"use client";

import { useState, useEffect, useCallback } from "react";
import BootSequence from "./BootSequence";
import CommandBar from "./CommandBar";

function playBeep() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

export default function HudControls({
  children,
}: {
  children: React.ReactNode;
}) {
  const [booting, setBooting] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [scanlinesEnabled, setScanlinesEnabled] = useState(true);
  const [commandBarOpen, setCommandBarOpen] = useState(false);

  const handleBootComplete = useCallback(() => {
    setBooting(false);
  }, []);

  // Play beep after boot if sound is on
  useEffect(() => {
    if (!booting && soundEnabled) playBeep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booting]);

  // Toggle scanlines class on body
  useEffect(() => {
    if (scanlinesEnabled) {
      document.body.classList.add("scanlines");
    } else {
      document.body.classList.remove("scanlines");
    }
  }, [scanlinesEnabled]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandBarOpen((prev) => !prev);
        return;
      }

      if (e.key === "Escape") {
        if (commandBarOpen) {
          setCommandBarOpen(false);
        }
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case "r": {
          e.preventDefault();
          // Force refresh by revalidating all fetches
          window.location.reload();
          break;
        }
        case "f": {
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
          break;
        }
        case "s": {
          e.preventDefault();
          setSoundEnabled((prev) => {
            const next = !prev;
            if (next) playBeep();
            return next;
          });
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [commandBarOpen]);

  return (
    <>
      {booting && <BootSequence onComplete={handleBootComplete} />}

      {/* Header control strip */}
      <div
        className="flex items-center justify-between px-4 py-1 md:px-6"
        style={{ borderBottom: "1px solid rgba(0, 255, 65, 0.1)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSoundEnabled((prev) => {
                const next = !prev;
                if (next) playBeep();
                return next;
              });
            }}
            className="text-[9px] tracking-wider uppercase"
            style={{
              color: soundEnabled
                ? "var(--hud-border)"
                : "var(--hud-text-dim)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            title="Toggle sound (S)"
          >
            SND {soundEnabled ? "ON" : "OFF"}
          </button>
          <button
            onClick={() => setScanlinesEnabled((prev) => !prev)}
            className="text-[9px] tracking-wider uppercase"
            style={{
              color: scanlinesEnabled
                ? "var(--hud-border)"
                : "var(--hud-text-dim)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            title="Toggle scanlines"
          >
            CRT {scanlinesEnabled ? "ON" : "OFF"}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-[9px] tracking-wider"
            style={{ color: "var(--hud-text-dim)" }}
          >
            R:REFRESH F:FULL S:SND
          </span>
          <button
            onClick={() => setCommandBarOpen(true)}
            className="text-[9px] tracking-wider uppercase"
            style={{
              color: "var(--hud-text-dim)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            CTRL+K
          </button>
        </div>
      </div>

      {/* Dashboard content with fade-in after boot */}
      <div
        style={{
          opacity: booting ? 0 : 1,
          transition: "opacity 400ms ease-in",
        }}
      >
        {children}
      </div>

      <CommandBar
        open={commandBarOpen}
        onClose={() => setCommandBarOpen(false)}
      />
    </>
  );
}
