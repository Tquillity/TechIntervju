"use client";

import { useEffect, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { Gauge, ChevronUp, ChevronDown, Compass } from "lucide-react";

/** Convert bearing (0-360) to a 16-point compass direction. */
function bearingToCompass(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const normalized = ((deg % 360) + 360) % 360;
  return dirs[Math.round(normalized / 22.5) % 16];
}

export interface PerformanceHUDProps {
  /** Map instance – when provided, HUD subscribes to this map for live updates */
  map?: MapLibreMap | null;
  /** Map ref (kept for backwards compatibility; prefer map when available) */
  mapRef?: React.RefObject<MapLibreMap | null>;
  /** When true, map is ready */
  mapReady?: boolean;
  /** Optional class name for the container */
  className?: string;
}

export function PerformanceHUD({ map: mapProp, mapRef, mapReady = false, className = "" }: PerformanceHUDProps) {
  const [visible, setVisible] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [zoom, setZoom] = useState<number | null>(null);
  const [pitch, setPitch] = useState<number | null>(null);
  const [bearing, setBearing] = useState<number | null>(null);
  const [layerCount, setLayerCount] = useState<number | null>(null);

  useEffect(() => {
    const m = mapProp ?? mapRef?.current;
    if (!m) return;

    // Guard: check map is still alive before subscribing
    try { m.getCanvas(); } catch { return; }

    const update = () => {
      try {
        const center = m.getCenter();
        setCoords({ lng: center.lng, lat: center.lat });
        setZoom(m.getZoom());
        setPitch(m.getPitch());
        setBearing(m.getBearing());
        const style = m.getStyle();
        const layers = Array.isArray(style?.layers) ? style.layers : [];
        setLayerCount(layers.length);
      } catch {
        // Map may have been removed between ticks
      }
    };

    update();
    m.on("move", update);
    m.on("moveend", update);
    m.on("idle", update);
    return () => {
      try {
        m.off("move", update);
        m.off("moveend", update);
        m.off("idle", update);
      } catch {
        // Map already removed
      }
    };
  }, [mapProp, mapRef]);

  return (
    <div
      className={`absolute bottom-10 right-4 z-20 flex flex-col items-end gap-1 ${className}`}
      aria-label="Performance HUD"
    >
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg glass-panel text-xs text-muted hover:text-foreground transition-colors"
        aria-expanded={visible}
        title={visible ? "Collapse HUD" : "Expand HUD"}
      >
        <Gauge className="size-4" />
        {visible ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
      </button>
      {visible && (
        <div className="glass-panel p-3 space-y-2 min-w-[200px] text-xs font-mono">
          <div className="text-accent font-semibold flex items-center gap-2">
            <Gauge className="size-4" />
            Performance
          </div>
          <div className="space-y-1 text-muted">
            <div>Engine: MapLibre v5 (WebGPU Enabled)</div>
            <div>
              Coordinates:{" "}
              {coords != null ? (
                <span className="text-foreground tabular-nums">
                  {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                </span>
              ) : (
                "—"
              )}
            </div>
            <div>
              Zoom Level:{" "}
              {zoom != null ? <span className="text-foreground tabular-nums">{zoom.toFixed(2)}</span> : "—"}
            </div>
            <div className="flex items-center gap-3">
              <span>
                Pitch:{" "}
                {pitch != null ? <span className="text-foreground tabular-nums">{pitch.toFixed(1)}°</span> : "—"}
              </span>
              <span className="flex items-center gap-1">
                <Compass className="size-3" />
                {bearing != null ? (
                  <span className="text-foreground tabular-nums">{bearingToCompass(bearing)} {bearing.toFixed(0)}°</span>
                ) : "—"}
              </span>
            </div>
            <div>
              Layer Count:{" "}
              {layerCount != null ? <span className="text-foreground tabular-nums">{layerCount}</span> : "—"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
