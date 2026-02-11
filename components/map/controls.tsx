"use client";

import {
  Layers,
  Satellite,
  Map as MapIcon,
  Sparkles,
  TreeDeciduous,
  Activity,
  Link,
  Loader2,
  X,
  Building2,
  ImageIcon,
} from "lucide-react";
import type { BaseLayerId } from "./map-viewport";
import type { PresetId } from "@/hooks/use-geodata";

export interface MapControlsProps {
  baseLayer: BaseLayerId;
  onBaseLayerChange: (id: BaseLayerId) => void;
  buildings3dVisible: boolean;
  onBuildings3dChange: (visible: boolean) => void;
  onPresetFetch: (preset: PresetId) => void;
  onClearData: () => void;
  loading: boolean;
  hasData: boolean;
  customUrl: string;
  onCustomUrlChange: (url: string) => void;
  onFetchCustomUrl: () => void;
}

export function MapControls({
  baseLayer,
  onBaseLayerChange,
  buildings3dVisible,
  onBuildings3dChange,
  onPresetFetch,
  onClearData,
  loading,
  hasData,
  customUrl,
  onCustomUrlChange,
  onFetchCustomUrl,
}: MapControlsProps) {
  return (
    <div className="glass-panel p-4 space-y-4 w-72">
      <div className="flex items-center gap-2 text-accent font-semibold">
        <Layers className="size-5" />
        <span>Magic Import</span>
      </div>

      {/* Base layer switcher: Vector | Sentinel-2 | High-Res Esri */}
      <div className="space-y-2">
        <span className="text-sm text-muted">Base layer</span>
        <div className="flex flex-col gap-1 rounded-lg overflow-hidden border border-border">
          <div className="flex">
            <button
              type="button"
              onClick={() => onBaseLayerChange("vector")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm transition-colors ${
                baseLayer === "vector"
                  ? "bg-accent text-white"
                  : "bg-surface-elevated text-muted hover:bg-border/50"
              }`}
            >
              <MapIcon className="size-4" />
              Vector
            </button>
            <button
              type="button"
              onClick={() => onBaseLayerChange("satellite")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm transition-colors ${
                baseLayer === "satellite"
                  ? "bg-accent text-white"
                  : "bg-surface-elevated text-muted hover:bg-border/50"
              }`}
            >
              <Satellite className="size-4" />
              Sentinel-2
            </button>
            <button
              type="button"
              onClick={() => onBaseLayerChange("high-res")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm transition-colors ${
                baseLayer === "high-res"
                  ? "bg-accent text-white"
                  : "bg-surface-elevated text-muted hover:bg-border/50"
              }`}
            >
              <ImageIcon className="size-4" />
              High-Res
            </button>
          </div>
        </div>
      </div>

      {/* 3D Building toggle */}
      <div className="space-y-2">
        <span className="text-sm text-muted">3D</span>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={buildings3dVisible}
            onChange={(e) => onBuildings3dChange(e.target.checked)}
            className="size-4 rounded border-border bg-surface-elevated text-accent focus:ring-accent"
          />
          <Building2 className="size-4 text-muted" />
          <span className="text-sm">3D Buildings</span>
        </label>
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <span className="text-sm text-muted">Presets</span>
        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => onPresetFetch("earthquakes")}
            disabled={loading}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg bg-surface-elevated hover:bg-border/50 border border-border transition-colors text-left disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-accent" />
            ) : (
              <Activity className="size-4 shrink-0 text-warning" />
            )}
            <span className="text-sm">Global Real-time Earthquakes</span>
          </button>
          <button
            type="button"
            onClick={() => onPresetFetch("city-trees")}
            disabled={loading}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg bg-surface-elevated hover:bg-border/50 border border-border transition-colors text-left disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-accent" />
            ) : (
              <TreeDeciduous className="size-4 shrink-0 text-success" />
            )}
            <span className="text-sm">Local City Trees (Open Data)</span>
          </button>
          <button
            type="button"
            onClick={() => onPresetFetch("satellite-anomalies")}
            disabled={loading}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg bg-surface-elevated hover:bg-border/50 border border-border transition-colors text-left disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-accent" />
            ) : (
              <Sparkles className="size-4 shrink-0 text-accent" />
            )}
            <span className="text-sm">Recent Satellite Anomalies</span>
          </button>
        </div>
      </div>

      {/* Custom URL */}
      <div className="space-y-2">
        <span className="text-sm text-muted">Custom GeoJSON URL</span>
        <div className="flex gap-2">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => onCustomUrlChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onFetchCustomUrl()}
            placeholder="https://…/data.geojson"
            className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-surface-elevated border border-border text-sm text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="button"
            onClick={onFetchCustomUrl}
            disabled={loading}
            className="shrink-0 p-2 rounded-lg bg-accent hover:bg-accent-muted text-white disabled:opacity-60"
            title="Fetch URL"
          >
            <Link className="size-4" />
          </button>
        </div>
      </div>

      {hasData && (
        <button
          type="button"
          onClick={onClearData}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-border text-muted hover:text-white hover:bg-surface-elevated text-sm"
        >
          <X className="size-4" />
          Clear data
        </button>
      )}
    </div>
  );
}
