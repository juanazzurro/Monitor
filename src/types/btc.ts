export interface BTCData {
  price: number | null;
  change24h: number | null;
  chartPrices: number[];
  fearGreed: { value: number; label: string } | null;
  dominance: number | null;
  blockHeight: number | null;
  hashRate: string | null;
  errors: string[];
}
