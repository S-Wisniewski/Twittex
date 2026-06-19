import { useState, useEffect } from "react";

function compute(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const isToday = now.toDateString() === date.toDateString();
  const isThisYear = now.getFullYear() === date.getFullYear();

  if (isToday) {
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    return `${diffHour}h ago`;
  }
  if (isThisYear)
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function tickMs(iso: string): number | null {
  const diffSec = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diffSec < 60) return 10_000;
  if (diffSec < 3_600) return 30_000;
  if (diffSec < 86_400) return 60_000;
  return null;
}

export function useRelativeTime(iso: string): string {
  const [label, setLabel] = useState(() => compute(iso));

  useEffect(() => {
    const ms = tickMs(iso);
    if (!ms) return;
    const id = setInterval(() => setLabel(compute(iso)), ms);
    return () => clearInterval(id);
  }, [iso]);

  return label;
}
