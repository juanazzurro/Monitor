"use client";

import { useEffect, useState } from "react";
import { CATEGORY_ICONS } from "@/config/widgets";
import type { WidgetCategory, WidgetSize } from "@/types/widget";

interface WidgetShellProps {
  title: string;
  category: WidgetCategory;
  size: WidgetSize;
  children: React.ReactNode;
}

export default function WidgetShell({ title, category, children }: WidgetShellProps) {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    setLastUpdate(new Date());
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const timestamp = lastUpdate
    ? lastUpdate.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    : "--:--:--";

  return (
    <div
      className="widget-shell-clip h-full"
      style={{
        background: "var(--hud-border)",
        filter: "drop-shadow(0 0 6px rgba(0, 255, 65, 0.3))",
      }}
    >
      <div
        className="widget-shell-clip m-[1px] flex h-[calc(100%-2px)] flex-col"
        style={{ background: "var(--hud-bg-panel)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ borderBottom: "1px solid rgba(0, 255, 65, 0.2)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px]" style={{ color: "var(--hud-border)" }}>
              {CATEGORY_ICONS[category]}
            </span>
            <span
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: "var(--hud-text)" }}
            >
              {title}
            </span>
          </div>
          <span
            className="text-[10px] tracking-wider"
            style={{ color: "var(--hud-text-dim)" }}
          >
            LAST UPDATE: {timestamp}
          </span>
        </div>

        {/* Content */}
        <div className="relative min-h-0 flex-1 overflow-auto">
          <div className="widget-shell-scanlines" />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 p-6">
              <span
                className="text-[10px] tracking-[0.3em] uppercase"
                style={{ color: "var(--hud-text-dim)" }}
              >
                SCANNING...
              </span>
              <div className="widget-scan-bar w-32" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-4">
              <span
                className="text-xs font-bold tracking-wider"
                style={{ color: "var(--hud-red)" }}
              >
                ERROR: {error}
              </span>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
