"use client";

import useSWR from "swr";
import { useRef, useEffect, useState } from "react";
import type { MarketsResponse, MarketAsset } from "@/types/market";

const fetcher = (url: string): Promise<MarketsResponse> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

interface AssetRowProps {
  asset: MarketAsset;
  flash: "up" | "down" | null;
  highlight: boolean;
}

function AssetRow({ asset, flash, highlight }: AssetRowProps) {
  const currencySymbol = asset.currency === "ARS" ? "ARS " : "$";
  const priceStr =
    asset.price != null
      ? `${currencySymbol}${asset.price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "--";

  const changeStr =
    asset.change24h != null
      ? `${asset.change24h >= 0 ? "+" : ""}${asset.change24h.toFixed(2)}%`
      : "--";

  const arrow =
    asset.change24h != null ? (asset.change24h >= 0 ? "▲" : "▼") : "";

  const changeColor = asset.error
    ? "var(--hud-text-dim)"
    : asset.change24h != null
      ? asset.change24h >= 0
        ? "var(--hud-border)"
        : "var(--hud-red)"
      : "var(--hud-text-dim)";

  const flashClass =
    flash === "up"
      ? "ticker-flash-up"
      : flash === "down"
        ? "ticker-flash-down"
        : "";

  return (
    <div
      className={`flex items-center justify-between py-2 ${flashClass} ${highlight ? "ticker-highlight" : ""}`}
      style={{ borderBottom: "1px solid rgba(0, 255, 65, 0.1)" }}
    >
      <div className="flex flex-col">
        <span
          className={`font-bold tracking-wider ${highlight ? "text-sm" : "text-xs"}`}
          style={{ color: "var(--hud-text)" }}
        >
          {asset.name}
        </span>
        {asset.error && (
          <span
            className="text-[8px] tracking-wider"
            style={{ color: "var(--hud-red)" }}
          >
            SIGNAL LOST
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`font-bold tracking-wide ${highlight ? "text-lg" : "text-sm"}`}
          style={{
            color: asset.error ? "var(--hud-text-dim)" : "var(--hud-border)",
            textShadow:
              highlight && !asset.error ? "var(--glow-text)" : "none",
          }}
        >
          {priceStr}
        </span>
        <span
          className="min-w-[72px] text-right text-xs font-bold tracking-wider"
          style={{ color: changeColor }}
        >
          {arrow} {changeStr}
        </span>
      </div>
    </div>
  );
}

export default function MarketTicker() {
  const { data, error, isLoading } = useSWR<MarketsResponse>(
    "/api/markets",
    fetcher,
    { refreshInterval: 30000, dedupingInterval: 10000 }
  );

  const prevPricesRef = useRef<Record<string, number | null>>({});
  const [flashMap, setFlashMap] = useState<Record<string, "up" | "down" | null>>(
    {}
  );

  useEffect(() => {
    if (!data) return;

    const newFlashMap: Record<string, "up" | "down" | null> = {};
    for (const asset of data.assets) {
      const prev = prevPricesRef.current[asset.id];
      if (prev != null && asset.price != null && prev !== asset.price) {
        newFlashMap[asset.id] = asset.price > prev ? "up" : "down";
      }
      prevPricesRef.current[asset.id] = asset.price;
    }

    if (Object.keys(newFlashMap).length > 0) {
      setFlashMap(newFlashMap);
      const timer = setTimeout(() => setFlashMap({}), 600);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col justify-center gap-4 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2"
            style={{ borderBottom: "1px solid rgba(0, 255, 65, 0.1)" }}
          >
            <span
              className="text-[10px] tracking-[0.3em] uppercase"
              style={{ color: "var(--hud-text-dim)" }}
            >
              ACQUIRING...
            </span>
            <div className="widget-scan-bar w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
        <span
          className="text-xs font-bold tracking-[0.3em] uppercase"
          style={{ color: "var(--hud-red)" }}
        >
          FEED OFFLINE
        </span>
        <div className="widget-scan-bar w-24" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-center px-3 py-2">
      {data?.assets.map((asset) => (
        <AssetRow
          key={asset.id}
          asset={asset}
          flash={flashMap[asset.id] ?? null}
          highlight={asset.id === "btc"}
        />
      ))}
    </div>
  );
}
