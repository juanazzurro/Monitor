export default function PlaceholderWidget() {
  return (
    <div className="flex h-full items-center justify-center p-3">
      <div
        className="flex h-full w-full items-center justify-center rounded-sm border border-dashed px-3 text-center"
        style={{ borderColor: "rgba(0, 255, 65, 0.4)" }}
      >
        <span
          className="text-[10px] tracking-[0.28em] uppercase"
          style={{ color: "var(--hud-text-dim)" }}
        >
          AWAITING DATA FEED // WIDGET SLOT AVAILABLE
        </span>
      </div>
    </div>
  );
}
