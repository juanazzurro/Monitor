"use client";

import useSWR from "swr";
import { useRef, useEffect, useState, useCallback } from "react";
import type { ArgentinaNewsResponse, ArgentinaNewsItem } from "@/types/news";

const fetcher = (url: string): Promise<ArgentinaNewsResponse> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function isRecent(iso: string): boolean {
  const diff = Date.now() - new Date(iso).getTime();
  return diff < 60 * 60 * 1000;
}

function ArgNewsLine({ item }: { item: ArgentinaNewsItem }) {
  const recent = isRecent(item.timestamp);

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      title={item.link}
      className="group flex items-start gap-2 px-3 py-1.5 transition-colors hover:bg-[rgba(255,191,0,0.05)]"
    >
      <span
        className="shrink-0 text-[11px]"
        style={{ color: "var(--hud-text-dim)" }}
      >
        {formatTime(item.timestamp)}
      </span>

      <span
        className="shrink-0 text-[10px] font-bold tracking-wider"
        style={{ color: "var(--hud-amber)" }}
      >
        {item.source.padEnd(9)}
      </span>

      {item.priority === "HIGH" && (
        <span
          className="status-blink shrink-0 text-[9px] font-bold tracking-widest"
          style={{ color: "var(--hud-red)" }}
        >
          HIGH
        </span>
      )}

      {recent && item.priority !== "HIGH" && (
        <span
          className="status-blink shrink-0 text-[9px] font-bold tracking-widest"
          style={{ color: "var(--hud-amber)" }}
        >
          NEW
        </span>
      )}

      {item.tags.map((tag) => (
        <span
          key={tag}
          className="shrink-0 text-[9px] font-bold tracking-wider"
          style={{ color: "var(--hud-cyan)" }}
        >
          [{tag}]
        </span>
      ))}

      <span
        className="min-w-0 flex-1 truncate text-xs group-hover:underline"
        style={{ color: "var(--hud-text)" }}
      >
        {item.title}
      </span>
    </a>
  );
}

export default function ArgentinaEcon() {
  const { data, error, isLoading } = useSWR<ArgentinaNewsResponse>(
    "/api/news/argentina",
    fetcher,
    { refreshInterval: 300000, dedupingInterval: 60000 }
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const animFrameRef = useRef<number>(0);

  const tick = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !autoScroll) return;

    el.scrollTop += 0.5;
    if (el.scrollTop >= el.scrollHeight - el.clientHeight) {
      el.scrollTop = 0;
    }

    animFrameRef.current = requestAnimationFrame(tick);
  }, [autoScroll]);

  useEffect(() => {
    if (autoScroll) {
      animFrameRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [autoScroll, tick]);

  const handleToggle = () => {
    setAutoScroll((prev) => !prev);
  };

  const pauseAutoScroll = () => setAutoScroll(false);

  const scrollByStep = (direction: "up" | "down") => {
    const el = scrollRef.current;
    if (!el) return;

    const step = Math.max(80, Math.floor(el.clientHeight * 0.35));
    const delta = direction === "up" ? -step : step;

    pauseAutoScroll();
    el.scrollBy({ top: delta, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col justify-center gap-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5">
            <span
              className="text-[10px] tracking-[0.3em] uppercase"
              style={{ color: "var(--hud-text-dim)" }}
            >
              MONITOREANDO...
            </span>
            <div className="widget-scan-bar w-20" />
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
          FEED ECON OFFLINE
        </span>
        <div className="widget-scan-bar w-24" />
      </div>
    );
  }

  const highCount = data?.items.filter((i) => i.priority === "HIGH").length ?? 0;

  return (
    <div className="argentina-econ-shell flex h-full flex-col">
      {/* Status bar */}
      <div
        className="flex items-center justify-between gap-2 px-3 py-1"
        style={{ borderBottom: "1px solid rgba(255, 191, 0, 0.15)" }}
      >
        <span
          className="text-[9px] tracking-wider uppercase"
          style={{ color: "var(--hud-text-dim)" }}
        >
          {data?.items.length ?? 0} ALERTAS · {highCount} PRIORITY
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => scrollByStep("up")}
            className="px-1 text-[9px] tracking-wider uppercase"
            style={{
              color: "var(--hud-text-dim)",
              background: "none",
              border: "1px solid rgba(255, 191, 0, 0.2)",
              cursor: "pointer",
            }}
            aria-label="Scroll up"
            title="Scroll up"
          >
            ▲
          </button>
          <button
            onClick={() => scrollByStep("down")}
            className="px-1 text-[9px] tracking-wider uppercase"
            style={{
              color: "var(--hud-text-dim)",
              background: "none",
              border: "1px solid rgba(255, 191, 0, 0.2)",
              cursor: "pointer",
            }}
            aria-label="Scroll down"
            title="Scroll down"
          >
            ▼
          </button>
          <button
            onClick={handleToggle}
            className="px-1 text-[9px] tracking-wider uppercase"
            style={{
              color: autoScroll ? "var(--hud-amber)" : "var(--hud-text-dim)",
              background: "none",
              border: "1px solid rgba(255, 191, 0, 0.2)",
              cursor: "pointer",
            }}
          >
            AUTOSCROLL {autoScroll ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* News list */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto"
        onWheel={pauseAutoScroll}
        onTouchStart={pauseAutoScroll}
        onPointerDown={pauseAutoScroll}
      >
        {data?.items.length === 0 && (
          <div className="flex h-full items-center justify-center p-4">
            <span
              className="text-[10px] tracking-[0.3em] uppercase"
              style={{ color: "var(--hud-text-dim)" }}
            >
              NO ECON ALERTS
            </span>
          </div>
        )}
        {data?.items.map((item) => (
          <ArgNewsLine key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
