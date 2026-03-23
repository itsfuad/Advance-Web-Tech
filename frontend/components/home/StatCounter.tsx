"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type StatCounterProps = {
  target: number;
  suffix?: string;
  prefix?: string;
  durationMs?: number;
  className?: string;
};

export default function StatCounter({
  target,
  suffix = "",
  prefix = "",
  durationMs = 1200,
  className,
}: StatCounterProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return (
    <div className={cn("text-3xl md:text-5xl font-extrabold text-(--primary)", className)}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </div>
  );
}
