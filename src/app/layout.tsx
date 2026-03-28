import type { Metadata } from "next";
import "./globals.css";
import HudClock from "./components/HudClock";
import HudControls from "./components/HudControls";

export const metadata: Metadata = {
  title: "SITREP // Tactical Monitor",
  description: "Military-grade situational awareness dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="hud-cursor scanlines flex min-h-screen flex-col font-mono">
        {/* ======== HUD HEADER ======== */}
        <header className="hud-panel-subtle flex items-center justify-between px-4 py-3 md:px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <h1 className="glitch-text text-xl md:text-2xl">SITREP</h1>
            <span
              className="hidden text-[10px] tracking-widest sm:inline"
              style={{ color: "var(--hud-text-dim)" }}
            >
              v1.0.0
            </span>
          </div>

          {/* Clock */}
          <HudClock />

          {/* System status */}
          <div className="flex items-center gap-2 text-xs tracking-wider">
            <span style={{ color: "var(--hud-text-dim)" }}>SYSTEM STATUS:</span>
            <span
              className="status-blink font-bold"
              style={{ color: "var(--hud-border)" }}
            >
              ONLINE
            </span>
            <span
              className="status-blink inline-block h-2 w-2 rounded-full"
              style={{
                backgroundColor: "var(--hud-border)",
                boxShadow: "0 0 6px var(--hud-border)",
              }}
            />
          </div>
        </header>

        <HudControls>
          {/* ======== MAIN CONTENT ======== */}
          <main className="flex-1">
            <div className="widget-grid">{children}</div>
          </main>

          {/* ======== FOOTER ======== */}
          <footer className="px-4 py-2 text-center md:px-6">
            <p
              className="text-[10px] tracking-[0.3em] uppercase"
              style={{ color: "var(--hud-text-dim)" }}
            >
              CLASSIFIED // AUTHORIZED PERSONNEL ONLY
            </p>
          </footer>
        </HudControls>
      </body>
    </html>
  );
}
