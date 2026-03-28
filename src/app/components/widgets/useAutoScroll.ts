import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

type Direction = "up" | "down";

type UseAutoScrollOptions = {
  stepRatio?: number;
  minStep?: number;
  speedPxPerSecond?: number;
};

type UseAutoScrollResult = {
  autoScroll: boolean;
  scrollRef: RefObject<HTMLDivElement>;
  toggleAutoScroll: () => void;
  pauseAutoScroll: () => void;
  scrollByStep: (direction: Direction) => void;
  handleScroll: () => void;
};

const DEFAULT_STEP_RATIO = 0.35;
const DEFAULT_MIN_STEP = 80;
const DEFAULT_SPEED = 30;

export function useAutoScroll(
  options: UseAutoScrollOptions = {}
): UseAutoScrollResult {
  const {
    stepRatio = DEFAULT_STEP_RATIO,
    minStep = DEFAULT_MIN_STEP,
    speedPxPerSecond = DEFAULT_SPEED,
  } = options;

  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const pauseAutoScroll = useCallback(() => {
    setAutoScroll(false);
  }, []);

  const tick = useCallback(
    (ts: number) => {
      const el = scrollRef.current;
      if (!el || !autoScroll) {
        lastTsRef.current = null;
        return;
      }

      const lastTs = lastTsRef.current ?? ts;
      const deltaMs = ts - lastTs;
      lastTsRef.current = ts;

      const movement = (speedPxPerSecond * deltaMs) / 1000;

      isProgrammaticScrollRef.current = true;
      el.scrollTop += movement;

      if (el.scrollTop >= el.scrollHeight - el.clientHeight) {
        el.scrollTop = 0;
      }
      isProgrammaticScrollRef.current = false;

      rafRef.current = requestAnimationFrame(tick);
    },
    [autoScroll, speedPxPerSecond]
  );

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    lastTsRef.current = null;

    if (autoScroll) {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [autoScroll, tick]);

  const toggleAutoScroll = useCallback(() => {
    setAutoScroll((prev) => !prev);
  }, []);

  const scrollByStep = useCallback(
    (direction: Direction) => {
      const el = scrollRef.current;
      if (!el) return;

      const step = Math.max(minStep, Math.floor(el.clientHeight * stepRatio));
      const delta = direction === "up" ? -step : step;

      setAutoScroll(false);
      isProgrammaticScrollRef.current = true;
      el.scrollBy({ top: delta, behavior: "smooth" });

      window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 220);
    },
    [minStep, stepRatio]
  );

  const handleScroll = useCallback(() => {
    if (isProgrammaticScrollRef.current) return;
    setAutoScroll(false);
  }, []);

  return {
    autoScroll,
    scrollRef,
    toggleAutoScroll,
    pauseAutoScroll,
    scrollByStep,
    handleScroll,
  };
}
