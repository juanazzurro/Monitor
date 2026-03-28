export interface MarketAsset {
  id: string;
  name: string;
  price: number | null;
  change24h: number | null;
  currency: "USD" | "ARS";
  error: boolean;
}

export interface MarketsResponse {
  assets: MarketAsset[];
  timestamp: string;
}
