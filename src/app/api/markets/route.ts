import { NextResponse } from "next/server";
import type { MarketAsset, MarketsResponse } from "@/types/market";

export const revalidate = 25;

const FALLBACK_IDS = [
  "btc", "sp500", "dowjones", "nasdaq",
  "nikkei", "ftse", "dax", "merval",
  "gold", "oil", "eurusd",
] as const;
const FALLBACK_NAMES = [
  "BTC", "S&P 500", "DOW JONES", "NASDAQ",
  "NIKKEI 225", "FTSE 100", "DAX", "MERVAL",
  "GOLD", "OIL WTI", "EUR/USD",
] as const;

function errorAsset(id: string, name: string, currency: "USD" | "ARS" = "USD"): MarketAsset {
  return { id, name, price: null, change24h: null, currency, error: true };
}

async function fetchBTC(): Promise<MarketAsset> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true",
      { next: { revalidate: 25 } }
    );
    if (!res.ok) return errorAsset("btc", "BTC");

    const data = await res.json();
    const btc = data.bitcoin;

    return {
      id: "btc",
      name: "BTC",
      price: btc.usd ?? null,
      change24h: btc.usd_24h_change ?? null,
      currency: "USD",
      error: false,
    };
  } catch {
    return errorAsset("btc", "BTC");
  }
}

async function fetchYahoo(
  symbol: string,
  id: string,
  name: string,
  currency: "USD" | "ARS" = "USD"
): Promise<MarketAsset> {
  try {
    const encoded = encodeURIComponent(symbol);
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?range=1d&interval=1d`,
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 25 },
      }
    );
    if (!res.ok) return errorAsset(id, name, currency);

    const data = await res.json();
    const meta = data.chart?.result?.[0]?.meta;
    if (!meta) return errorAsset(id, name, currency);

    const price: number = meta.regularMarketPrice;
    const previousClose: number = meta.chartPreviousClose ?? meta.previousClose;
    const change24h = previousClose ? ((price - previousClose) / previousClose) * 100 : null;

    return { id, name, price, change24h, currency, error: false };
  } catch {
    return errorAsset(id, name, currency);
  }
}

async function fetchMerval(): Promise<MarketAsset> {
  // Try Yahoo Finance ^MERV first
  const yahooResult = await fetchYahoo("^MERV", "merval", "MERVAL", "ARS");
  if (!yahooResult.error) return yahooResult;

  // Fallback: ArgentinaDatos API
  try {
    const res = await fetch(
      "https://api.argentinadatos.com/v1/finanzas/indices/merval/ultimo",
      { next: { revalidate: 25 } }
    );
    if (!res.ok) return errorAsset("merval", "MERVAL", "ARS");

    const data = await res.json();
    return {
      id: "merval",
      name: "MERVAL",
      price: data.valor ?? data.value ?? null,
      change24h: null,
      currency: "ARS",
      error: false,
    };
  } catch {
    return errorAsset("merval", "MERVAL", "ARS");
  }
}

export async function GET() {
  const results = await Promise.allSettled([
    fetchBTC(),
    fetchYahoo("^GSPC", "sp500", "S&P 500"),
    fetchYahoo("^DJI", "dowjones", "DOW JONES"),
    fetchYahoo("^IXIC", "nasdaq", "NASDAQ"),
    fetchYahoo("^N225", "nikkei", "NIKKEI 225"),
    fetchYahoo("^FTSE", "ftse", "FTSE 100"),
    fetchYahoo("^GDAXI", "dax", "DAX"),
    fetchMerval(),
    fetchYahoo("GC=F", "gold", "GOLD"),
    fetchYahoo("CL=F", "oil", "OIL WTI"),
    fetchYahoo("EURUSD=X", "eurusd", "EUR/USD"),
  ]);

  const assets: MarketAsset[] = results.map((result, i) => {
    if (result.status === "fulfilled") return result.value;
    return errorAsset(
      FALLBACK_IDS[i],
      FALLBACK_NAMES[i],
      FALLBACK_IDS[i] === "merval" ? "ARS" : "USD"
    );
  });

  const response: MarketsResponse = {
    assets,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
