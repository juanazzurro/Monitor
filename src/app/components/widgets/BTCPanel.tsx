"use client";

import useSWR from "swr";
import type { BTCData } from "@/types/btc";

const fetcher = (url: string): Promise<BTCData> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

function Sparkline({ prices }: { prices: number[] }) {
  if (prices.length < 2) return null;

  const w = 200;
  const h = 50;
  const pad = 2;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = prices.map((p, i) => {
    const x = pad + (i / (prices.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (p - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });

  const isUp = prices[prices.length - 1] >= prices[0];
  const color = isUp ? "var(--hud-border)" : "var(--hud-red)";

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full"
      style={{ height: 50 }}
      preserveAspectRatio="none"
    >
      {/* Fill area under line */}
      <path
        d={`M${points[0]} ${points.join(" L")} L${w - pad},${h - pad} L${pad},${h - pad} Z`}
        fill={isUp ? "rgba(0,255,65,0.08)" : "rgba(255,51,51,0.08)"}
      />
      {/* Line */}
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function fearGreedColor(value: number): string {
  if (value <= 25) return "var(--hud-red)";
  if (value <= 45) return "#ff8800";
  if (value <= 55) return "var(--hud-amber)";
  if (value <= 75) return "#88cc00";
  return "var(--hud-border)";
}

function StatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className="text-[9px] font-bold tracking-widest uppercase"
        style={{ color: "var(--hud-text-dim)" }}
      >
        {label}
      </span>
      <span
        className="text-[11px] font-bold tracking-wider"
        style={{ color: color ?? "var(--hud-text)" }}
      >
        {value}
      </span>
    </div>
  );
}

export default function BTCPanel() {
  const { data, error, isLoading } = useSWR<BTCData>("/api/btc", fetcher, {
    refreshInterval: 30000,
    dedupingInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
        <span
          className="text-[10px] tracking-[0.3em] uppercase"
          style={{ color: "var(--hud-text-dim)" }}
        >
          TRACKING ASSET...
        </span>
        <div className="widget-scan-bar w-32" />
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
          ASSET FEED OFFLINE
        </span>
        <div className="widget-scan-bar w-24" />
      </div>
    );
  }

  const priceStr =
    data?.price != null
      ? `$${data.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "--";

  const changeStr =
    data?.change24h != null
      ? `${data.change24h >= 0 ? "+" : ""}${data.change24h.toFixed(2)}%`
      : "--";

  const changeColor =
    data?.change24h != null
      ? data.change24h >= 0
        ? "var(--hud-border)"
        : "var(--hud-red)"
      : "var(--hud-text-dim)";

  const arrow =
    data?.change24h != null ? (data.change24h >= 0 ? "▲" : "▼") : "";

  return (
    <div className="flex h-full flex-col gap-2 p-3">
      {/* Asset designation */}
      <div
        className="flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(0, 255, 65, 0.15)" }}
      >
        <span
          className="pb-1 text-[9px] font-bold tracking-[0.3em] uppercase"
          style={{ color: "var(--hud-amber)" }}
        >
          ASSET: BTC
        </span>
        <span
          className="pb-1 text-[9px] tracking-wider"
          style={{ color: "var(--hud-text-dim)" }}
        >
          BITCOIN / USD
        </span>
      </div>

      {/* Price + change */}
      <div className="flex items-baseline justify-between">
        <span
          className="text-hud-glow text-xl font-bold tracking-wide"
          style={{ color: "var(--hud-border)" }}
        >
          {priceStr}
        </span>
        <span
          className="text-sm font-bold tracking-wider"
          style={{ color: changeColor }}
        >
          {arrow} {changeStr}
        </span>
      </div>

      {/* 7-day sparkline */}
      <div
        className="overflow-hidden rounded-sm"
        style={{ border: "1px solid rgba(0, 255, 65, 0.1)" }}
      >
        {data?.chartPrices && data.chartPrices.length > 1 ? (
          <Sparkline prices={data.chartPrices} />
        ) : (
          <div
            className="flex items-center justify-center"
            style={{ height: 50 }}
          >
            <span
              className="text-[8px] tracking-wider"
              style={{ color: "var(--hud-text-dim)" }}
            >
              NO CHART DATA
            </span>
          </div>
        )}
      </div>
      <span
        className="-mt-1 text-[8px] tracking-wider"
        style={{ color: "var(--hud-text-dim)" }}
      >
        7D RANGE
      </span>

      {/* Stats grid */}
      <div className="flex flex-1 flex-col justify-end gap-1.5">
        {data?.fearGreed && (
          <StatRow
            label="FEAR/GREED"
            value={`${data.fearGreed.value} · ${data.fearGreed.label.toUpperCase()}`}
            color={fearGreedColor(data.fearGreed.value)}
          />
        )}
        {data?.dominance != null && (
          <StatRow
            label="BTC DOM"
            value={`${data.dominance.toFixed(1)}%`}
            color="var(--hud-cyan)"
          />
        )}
        {data?.blockHeight != null && (
          <StatRow
            label="BLOCK"
            value={`#${data.blockHeight.toLocaleString()}`}
          />
        )}
        {data?.hashRate != null && (
          <StatRow label="HASHRATE" value={data.hashRate} />
        )}
      </div>
    </div>
  );
}
