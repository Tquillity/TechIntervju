"use client";

import { useState, useMemo } from "react";
import { List, ChevronDown, ChevronUp, MapPin, ChevronRight, ChevronLeft } from "lucide-react";
import type { GeoJSONFeatureCollection } from "@/hooks/use-geodata";

/** Approx height for one row (padding + line) so 4 rows fit in list area */
const ROW_HEIGHT_REM = 3.25;
const VISIBLE_ROWS = 4;

interface DataListingProps {
  data: GeoJSONFeatureCollection | null;
  onFeatureClick: (feature: GeoJSON.Feature) => void;
  className?: string;
}

export function DataListing({ data, onFeatureClick, className = "" }: DataListingProps) {
  const [visible, setVisible] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const features = useMemo(() => data?.features ?? [], [data]);
  const count = features.length;

  if (count === 0) return null;

  const listHeightRem = ROW_HEIGHT_REM * VISIBLE_ROWS;

  return (
    <div className={`flex flex-col items-end gap-1 ${className}`}>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg glass-panel text-xs text-muted hover:text-foreground transition-all duration-200"
        aria-expanded={visible}
      >
        <List className="size-4" />
        <span className="font-medium">Data Records ({count})</span>
        {visible ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
      </button>

      {visible && (
        <div
          className="glass-panel w-72 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ maxHeight: `${listHeightRem + 2}rem` }}
        >
          <div className="p-3 border-b border-border text-[10px] font-semibold text-accent uppercase tracking-widest bg-white/5 shrink-0">
            Features in Viewport
          </div>
          <div
            className="overflow-y-auto custom-scrollbar bg-surface/30 shrink-0"
            style={{ maxHeight: `${listHeightRem}rem` }}
          >
            {features.map((f, i) => {
              const props = (f.properties ?? {}) as Record<string, unknown>;
              const label =
                (props.title as string) ??
                (props.place as string) ??
                (props.common_name as string) ??
                (props.id as string) ??
                `Feature ${i + 1}`;
              const sublabel = props.mag
                ? `Mag: ${props.mag}`
                : props.height_m
                  ? `${props.height_m}m height`
                  : (props.anomaly_type as string) ?? "";
              const isExpanded = expandedIndex === i;

              return (
                <div
                  key={i}
                  className="flex items-start gap-2 w-full border-b border-border hover:bg-white/5 transition-colors group"
                >
                  <button
                    type="button"
                    onClick={() => onFeatureClick(f as GeoJSON.Feature)}
                    className="flex-1 min-w-0 text-left p-3 flex items-start gap-3"
                  >
                    <MapPin className="size-4 mt-0.5 text-muted group-hover:text-accent transition-colors shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-sm font-medium text-white leading-tight ${isExpanded ? "wrap-break-word whitespace-normal" : "truncate"}`}
                        title={isExpanded ? undefined : String(label)}
                      >
                        {String(label)}
                      </div>
                      {sublabel && (
                        <div
                          className={`text-[11px] text-muted mt-0.5 ${isExpanded ? "wrap-break-word whitespace-normal" : "truncate"}`}
                          title={isExpanded ? undefined : String(sublabel)}
                        >
                          {String(sublabel)}
                        </div>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedIndex((prev) => (prev === i ? null : i));
                    }}
                    className="shrink-0 p-2 self-center text-muted hover:text-accent transition-colors rounded"
                    title={isExpanded ? "Collapse text" : "Expand text"}
                    aria-label={isExpanded ? "Collapse text" : "Expand text"}
                  >
                    {isExpanded ? (
                      <ChevronLeft className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
