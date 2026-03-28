import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hud: {
          bg: "var(--hud-bg)",
          border: "var(--hud-border)",
          text: "var(--hud-text)",
          amber: "var(--hud-amber)",
          red: "var(--hud-red)",
          cyan: "var(--hud-cyan)",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        "hud-glow": "0 0 8px var(--hud-border), 0 0 20px rgba(0, 255, 65, 0.15)",
        "hud-glow-sm": "0 0 4px var(--hud-border), 0 0 10px rgba(0, 255, 65, 0.1)",
      },
      dropShadow: {
        "hud-glow": ["0 0 6px rgba(0, 255, 65, 0.6)", "0 0 12px rgba(0, 255, 65, 0.3)"],
      },
    },
  },
  plugins: [],
};

export default config;
