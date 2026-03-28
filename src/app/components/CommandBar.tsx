"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { widgets } from "@/config/widgets";

interface CommandBarProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandBar({ open, onClose }: CommandBarProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return widgets;
    const q = query.toLowerCase();
    return widgets.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        w.id.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((prev) => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && filtered[selected]) {
        e.preventDefault();
        navigateToWidget(filtered[selected].id);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose, filtered, selected]);

  function navigateToWidget(id: string) {
    onClose();
    const el = document.querySelector(`[data-widget-id="${id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Flash highlight
      el.classList.add("ticker-flash-up");
      setTimeout(() => el.classList.remove("ticker-flash-up"), 600);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh]"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden"
        style={{
          backgroundColor: "var(--hud-bg-panel)",
          border: "1px solid var(--hud-border)",
          boxShadow: "var(--glow-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{ borderBottom: "1px solid rgba(0, 255, 65, 0.2)" }}
        >
          <span
            className="text-xs font-bold"
            style={{ color: "var(--hud-border)" }}
          >
            &gt;
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            placeholder="Search widgets..."
            className="flex-1 bg-transparent text-xs tracking-wider outline-none"
            style={{ color: "var(--hud-text)", caretColor: "var(--hud-border)" }}
          />
          <span
            className="text-[9px] tracking-wider"
            style={{ color: "var(--hud-text-dim)" }}
          >
            ESC
          </span>
        </div>

        {/* Results */}
        <div className="max-h-60 overflow-y-auto">
          {filtered.map((w, i) => (
            <button
              key={w.id}
              className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors"
              style={{
                backgroundColor:
                  i === selected
                    ? "rgba(0, 255, 65, 0.1)"
                    : "transparent",
              }}
              onClick={() => navigateToWidget(w.id)}
              onMouseEnter={() => setSelected(i)}
            >
              <span
                className="text-[10px]"
                style={{ color: "var(--hud-border)" }}
              >
                {w.category === "markets"
                  ? "▲"
                  : w.category === "crypto"
                    ? "⚡"
                    : w.category === "argentina"
                      ? "⚑"
                      : w.category === "news"
                        ? "◈"
                        : "✦"}
              </span>
              <span
                className="text-xs font-bold tracking-wider"
                style={{ color: "var(--hud-text)" }}
              >
                {w.title}
              </span>
              <span
                className="text-[9px] tracking-wider"
                style={{ color: "var(--hud-text-dim)" }}
              >
                {w.size.toUpperCase()}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-3">
              <span
                className="text-[10px] tracking-wider"
                style={{ color: "var(--hud-text-dim)" }}
              >
                NO MATCHING WIDGETS
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
