"use client";

import { X, Info, Calendar, Database } from "lucide-react";

interface DataInspectorProps {
  feature: GeoJSON.Feature | null;
  onClose: () => void;
}

export function DataInspector({ feature, onClose }: DataInspectorProps) {
  if (!feature) {
    return (
      <div className="glass-panel p-4 w-72 text-muted text-sm italic flex items-center gap-2">
        <Info className="size-4" />
        Click a data point to inspect...
      </div>
    );
  }

  const props = feature.properties || {};

  return (
    <div className="glass-panel w-80 max-h-[70vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4">
      <div className="p-4 border-b border-border flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-2 font-semibold text-accent">
          <Database className="size-4" />
          <span>Feature Data</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="p-4 overflow-y-auto space-y-3">
        {Object.entries(props).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted font-bold">
              {key}
            </span>
            <div className="text-sm bg-black/20 p-2 rounded border border-white/5 wrap-break-word">
              {typeof value === "object"
                ? JSON.stringify(value)
                : String(value)}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-accent/10 border-t border-accent/20 text-[10px] text-accent-muted flex justify-between">
        <span>Geometry: {feature.geometry?.type ?? "Unknown"}</span>
        <div className="flex items-center gap-1">
          <Calendar className="size-3" />
          {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
