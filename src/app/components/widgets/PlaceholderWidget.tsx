export default function PlaceholderWidget() {
  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="text-center">
        <p
          className="text-[10px] tracking-[0.3em] uppercase"
          style={{ color: "var(--hud-text-dim)" }}
        >
          AWAITING DATA FEED...
        </p>
        <div
          className="mx-auto mt-3 h-px w-16"
          style={{ background: "var(--hud-text-dim)" }}
        />
      </div>
    </div>
  );
}
