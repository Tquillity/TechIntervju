"use client";

import { useMemo } from "react";
import { Calendar } from "lucide-react";

function formatDateYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Last 30 days (including today); indices 0..29 */
function getDatesLast30Days(): string[] {
  const out: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push(formatDateYYYYMMDD(d));
  }
  return out;
}

const DATES_30 = getDatesLast30Days();
const MIN_INDEX = 0;
const MAX_INDEX = DATES_30.length - 1;

function dateToIndex(dateStr: string): number {
  const i = DATES_30.indexOf(dateStr);
  return i === -1 ? MAX_INDEX : i;
}

export interface TimelineSliderProps {
  /** Current date in YYYY-MM-DD */
  value: string;
  /** Called when user selects a new date */
  onChange: (date: string) => void;
}

export function TimelineSlider({ value, onChange }: TimelineSliderProps) {
  const index = useMemo(() => dateToIndex(value), [value]);
  const displayDate = DATES_30[index] ?? value;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const i = Number(e.target.value);
    const clamped = Math.min(MAX_INDEX, Math.max(MIN_INDEX, i));
    onChange(DATES_30[clamped] ?? value);
  };

  return (
    <div className="glass-panel p-4 space-y-3 w-full max-w-md">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted flex items-center gap-2">
          <Calendar className="size-4" />
          CO₂ timeline
        </span>
        <span
          className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-sm font-medium tabular-nums"
          aria-live="polite"
        >
          {displayDate}
        </span>
      </div>
      <input
        type="range"
        min={MIN_INDEX}
        max={MAX_INDEX}
        value={index}
        onChange={handleSliderChange}
        className="w-full h-2 rounded-full appearance-none bg-surface-elevated border border-border accent-accent cursor-pointer"
        aria-label="Select date for CO2 layer"
      />
    </div>
  );
}
