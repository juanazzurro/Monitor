import { NextResponse } from "next/server";
import type { BTCData } from "@/types/btc";

export const revalidate = 30;

async function fetchPrice(): Promise<{
  price: number | null;
  change24h: number | null;
}> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true",
      { next: { revalidate: 30 } }
    );
    if (!res.ok) return { price: null, change24h: null };
    const data = await res.json();
    return {
      price: data.bitcoin?.usd ?? null,
      change24h: data.bitcoin?.usd_24h_change ?? null,
    };
  } catch {
    return { price: null, change24h: null };
  }
}

async function fetchChart(): Promise<number[]> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7",
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const prices: [number, number][] = data.prices ?? [];
    // Sample ~50 points for the sparkline
    const step = Math.max(1, Math.floor(prices.length / 50));
    return prices.filter((_, i) => i % step === 0).map((p) => p[1]);
  } catch {
    return [];
  }
}

async function fetchFearGreed(): Promise<{
  value: number;
  label: string;
} | null> {
  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=1", {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const item = data.data?.[0];
    if (!item) return null;
    return {
      value: parseInt(item.value, 10),
      label: item.value_classification ?? "",
    };
  } catch {
    return null;
  }
}

async function fetchDominance(): Promise<number | null> {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/global", {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.market_cap_percentage?.btc ?? null;
  } catch {
    return null;
  }
}

async function fetchBlockHeight(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://mempool.space/api/blocks/tip/height",
      { next: { revalidate: 30 } }
    );
    if (!res.ok) return null;
    const text = await res.text();
    return parseInt(text, 10) || null;
  } catch {
    return null;
  }
}

async function fetchHashRate(): Promise<string | null> {
  try {
    const res = await fetch(
      "https://mempool.space/api/v1/mining/hashrate/3d",
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const current = data.currentHashrate;
    if (!current) return null;
    // Convert to EH/s
    const ehps = current / 1e18;
    return `${ehps.toFixed(1)} EH/s`;
  } catch {
    return null;
  }
}

export async function GET() {
  const errors: string[] = [];

  const [priceData, chartPrices, fearGreed, dominance, blockHeight, hashRate] =
    await Promise.all([
      fetchPrice().catch(() => {
        errors.push("price");
        return { price: null, change24h: null };
      }),
      fetchChart().catch(() => {
        errors.push("chart");
        return [] as number[];
      }),
      fetchFearGreed().catch(() => {
        errors.push("fearGreed");
        return null;
      }),
      fetchDominance().catch(() => {
        errors.push("dominance");
        return null;
      }),
      fetchBlockHeight().catch(() => {
        errors.push("blockHeight");
        return null;
      }),
      fetchHashRate().catch(() => {
        errors.push("hashRate");
        return null;
      }),
    ]);

  const response: BTCData = {
    price: priceData.price,
    change24h: priceData.change24h,
    chartPrices,
    fearGreed,
    dominance,
    blockHeight,
    hashRate,
    errors,
  };

  return NextResponse.json(response);
}
