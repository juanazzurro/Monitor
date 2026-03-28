import { WidgetConfig, WidgetSize, WidgetCategory } from "@/types/widget";
import PlaceholderWidget from "@/app/components/widgets/PlaceholderWidget";
import MarketTicker from "@/app/components/widgets/MarketTicker";
import WorldNews from "@/app/components/widgets/WorldNews";
import ArgentinaEcon from "@/app/components/widgets/ArgentinaEcon";

export const WIDGET_SIZE_CLASS: Record<WidgetSize, string> = {
  sm: "widget-1x1",
  md: "widget-2x1",
  lg: "widget-2x2",
  xl: "widget-4x1",
};

export const CATEGORY_ICONS: Record<WidgetCategory, string> = {
  markets: "\u25B2",
  news: "\u25C8",
  argentina: "\u2691",
  crypto: "\u26A1",
  custom: "\u2726",
};

export const widgets: WidgetConfig[] = [
  {
    id: "market-ticker",
    title: "MARKET TICKER",
    size: "lg",
    refreshInterval: 30000,
    component: MarketTicker,
    category: "markets",
  },
  {
    id: "placeholder-1",
    title: "STANDBY",
    size: "md",
    component: PlaceholderWidget,
    category: "custom",
  },
  {
    id: "argentina-econ",
    title: "ECON ARGENTINA",
    size: "lg",
    refreshInterval: 300000,
    component: ArgentinaEcon,
    category: "argentina",
  },
  {
    id: "world-news",
    title: "WORLD NEWS INTERCEPT",
    size: "xl",
    refreshInterval: 300000,
    component: WorldNews,
    category: "news",
  },
];
