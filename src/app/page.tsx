export default function Home() {
  return (
    <>
      {/* Placeholder widgets to show grid working */}
      <div className="hud-panel widget-2x1 p-4">
        <p className="text-xs tracking-wider" style={{ color: "var(--hud-text-dim)" }}>
          WIDGET SLOT // 2x1
        </p>
      </div>
      <div className="hud-panel widget-1x1 p-4">
        <p className="text-xs tracking-wider" style={{ color: "var(--hud-text-dim)" }}>
          WIDGET SLOT // 1x1
        </p>
      </div>
      <div className="hud-panel widget-1x1 p-4">
        <p className="text-xs tracking-wider" style={{ color: "var(--hud-text-dim)" }}>
          WIDGET SLOT // 1x1
        </p>
      </div>
      <div className="hud-panel widget-4x1 p-4">
        <p className="text-xs tracking-wider" style={{ color: "var(--hud-text-dim)" }}>
          WIDGET SLOT // 4x1
        </p>
      </div>
    </>
  );
}
