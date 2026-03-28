"use client";

import { useState, useEffect, useCallback } from "react";

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_LINES: { text: string; delay: number }[] = [
  { text: "SITREP v1.0.0 — TACTICAL MONITOR", delay: 0 },
  { text: "", delay: 200 },
  { text: "INITIALIZING SITREP...", delay: 400 },
  { text: "[OK] CORE SYSTEMS LOADED", delay: 800 },
  { text: "CONNECTING TO DATA FEEDS...", delay: 1200 },
  { text: "[OK] FEEDS ONLINE", delay: 1800 },
  { text: "LOADING WIDGETS...", delay: 2200 },
  { text: "[OK] ALL MODULES ACTIVE", delay: 2600 },
  { text: "", delay: 2800 },
  { text: "SYSTEM READY", delay: 2900 },
];

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  const skip = useCallback(() => {
    if (fading) return;
    setFading(true);
    setTimeout(onComplete, 300);
  }, [fading, onComplete]);

  // Progress bar
  useEffect(() => {
    const start = Date.now();
    const totalMs = 3000;
    const frame = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / totalMs) * 100);
      setProgress(pct);
      if (pct < 100) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, []);

  // Boot lines
  useEffect(() => {
    const timers = BOOT_LINES.map((line, i) =>
      setTimeout(() => setVisibleLines(i + 1), line.delay)
    );
    // Auto-complete
    const done = setTimeout(() => {
      setFading(true);
      setTimeout(onComplete, 300);
    }, 3200);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [onComplete]);

  // Skip on click or Enter
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") skip();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [skip]);

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center p-8 transition-opacity duration-300"
      style={{
        backgroundColor: "var(--hud-bg)",
        opacity: fading ? 0 : 1,
        cursor: "pointer",
      }}
      onClick={skip}
    >
      {/* Boot log */}
      <div className="w-full max-w-lg font-mono">
        {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} className="mb-1">
            {line.text.startsWith("[OK]") ? (
              <span className="text-xs tracking-wider">
                <span style={{ color: "var(--hud-border)" }}>[OK] </span>
                <span style={{ color: "var(--hud-text)" }}>
                  {line.text.slice(5)}
                </span>
              </span>
            ) : line.text === "SYSTEM READY" ? (
              <span
                className="text-sm font-bold tracking-[0.3em]"
                style={{
                  color: "var(--hud-border)",
                  textShadow: "var(--glow-text)",
                }}
              >
                {line.text}
              </span>
            ) : (
              <span
                className="text-xs tracking-wider"
                style={{
                  color: line.text
                    ? "var(--hud-text-dim)"
                    : "transparent",
                }}
              >
                {line.text || "\u00A0"}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div
        className="mt-6 w-full max-w-lg overflow-hidden"
        style={{
          height: 2,
          backgroundColor: "rgba(0, 255, 65, 0.1)",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            backgroundColor: "var(--hud-border)",
            boxShadow: "0 0 8px var(--hud-border)",
            transition: "width 100ms linear",
          }}
        />
      </div>
      <span
        className="mt-2 text-[10px] tracking-widest"
        style={{ color: "var(--hud-text-dim)" }}
      >
        {Math.floor(progress)}%
      </span>

      {/* Skip hint */}
      <span
        className="mt-8 text-[9px] tracking-[0.3em] uppercase"
        style={{ color: "var(--hud-text-dim)", opacity: 0.5 }}
      >
        CLICK OR PRESS ENTER TO SKIP
      </span>
    </div>
  );
}
