"use client";

import { useMemo, useState, useRef, useCallback } from "react";
import { Calendar } from "lucide-react";

function formatDateYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Last 30 days from a given end date (31 dates: endDate - 30 .. endDate). */
function getDatesForRange(endDateYYYYMMDD: string): string[] {
  const end = new Date(endDateYYYYMMDD + "T12:00:00Z");
  const out: string[] = [];
  for (let i = 30; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    out.push(formatDateYYYYMMDD(d));
  }
  return out;
}

/** When no maxDate: last 30 days from today (legacy behavior). */
function getDatesLast30Days(): string[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return getDatesForRange(formatDateYYYYMMDD(today));
}

const DEFAULT_DATES = getDatesLast30Days();

function dateToIndex(dateStr: string, dates: string[]): number {
  const i = dates.indexOf(dateStr);
  const maxIdx = dates.length - 1;
  return i === -1 ? maxIdx : i;
}

export interface TimelineSliderProps {
  /** Current date in YYYY-MM-DD */
  value: string;
  /** Called when user selects a new date */
  onChange: (date: string) => void;
  /** Latest available date (e.g. from NASA GIBS probe). Range becomes [maxDate - 30d, maxDate]. */
  maxDate?: string;
}

export function TimelineSlider({ value, onChange, maxDate }: TimelineSliderProps) {
  const dates = useMemo(
    () => (maxDate ? getDatesForRange(maxDate) : DEFAULT_DATES),
    [maxDate]
  );
  const minIndex = 0;
  const maxIndex = dates.length - 1;

  const committedIndex = useMemo(() => dateToIndex(value, dates), [value, dates]);

  // Local preview index while dragging (null = not dragging, use committed)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const draggingRef = useRef(false);

  const displayIndex = previewIndex ?? committedIndex;
  const displayDate = dates[displayIndex] ?? value;

  // During drag: update the visual preview only (no data fetch)
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const i = Math.min(maxIndex, Math.max(minIndex, Number(e.target.value)));
      setPreviewIndex(i);
      draggingRef.current = true;
    },
    [minIndex, maxIndex]
  );

  // On release: commit the final date (triggers data fetch)
  const commitValue = useCallback(() => {
    const idx = previewIndex ?? committedIndex;
    const date = dates[idx] ?? value;
    draggingRef.current = false;
    setPreviewIndex(null);
    onChange(date);
  }, [previewIndex, committedIndex, dates, value, onChange]);

  return (
    <div className="glass-panel p-4 space-y-3 w-full max-w-md">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted flex items-center gap-2">
          <Calendar className="size-4" />
          Atmosphere timeline
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
        min={minIndex}
        max={maxIndex}
        value={displayIndex}
        onChange={handleInput}
        onMouseUp={() => commitValue()}
        onTouchEnd={() => commitValue()}
        className="w-full h-2 rounded-full appearance-none bg-surface-elevated border border-border accent-accent cursor-pointer"
        aria-label="Select date for atmosphere overlay"
      />
    </div>
  );
}
