"use client";

import { useEffect, useState } from "react";

function formatTime(date: Date, timeZone: string): string {
  return date.toLocaleTimeString("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function HudClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) {
    return (
      <div className="flex gap-4 text-xs tracking-wider">
        <span className="text-hud-glow">UTC --:--:--</span>
        <span className="text-hud-amber">ART --:--:--</span>
      </div>
    );
  }

  return (
    <div className="flex gap-4 text-xs tracking-wider">
      <span className="text-hud-glow">
        UTC {formatTime(now, "UTC")}
      </span>
      <span style={{ color: "var(--hud-amber)" }}>
        ART {formatTime(now, "America/Argentina/Buenos_Aires")}
      </span>
    </div>
  );
}
