import { ComponentType } from "react";

export type WidgetSize = "sm" | "md" | "lg" | "xl";

export type WidgetCategory = "markets" | "news" | "argentina" | "crypto" | "custom";

export interface WidgetConfig {
  id: string;
  title: string;
  size: WidgetSize;
  refreshInterval?: number;
  component: ComponentType;
  category: WidgetCategory;
}
