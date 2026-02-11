"use client";

import { useState } from "react";
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
  Landmark,
  Cloud,
  Play,
  Wind,
  Maximize2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { BaseLayerId } from "./map-viewport";
import type { PresetId } from "@/hooks/use-geodata";

function CollapsibleSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 w-full text-left text-sm text-muted hover:text-foreground transition-colors"
        aria-expanded={expanded}
      >
        {expanded ? (
          <ChevronDown className="size-4 shrink-0" />
        ) : (
          <ChevronRight className="size-4 shrink-0" />
        )}
        <span>{title}</span>
      </button>
      {expanded && children}
    </div>
  );
}

export interface MapControlsProps {
  baseLayer: BaseLayerId;
  onBaseLayerChange: (id: BaseLayerId) => void;
  buildings3dVisible: boolean;
  onBuildings3dChange: (visible: boolean) => void;
  co2Enabled: boolean;
  onCo2EnabledChange: (enabled: boolean) => void;
  openaqEnabled: boolean;
  onOpenaqEnabledChange: (enabled: boolean) => void;
  openaqLoading: boolean;
  onRefreshOpenaq: () => void;
  onStartCinematicTour: () => void;
  presentationMode: boolean;
  onPresentationModeChange: (enabled: boolean) => void;
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
  co2Enabled,
  onCo2EnabledChange,
  openaqEnabled,
  onOpenaqEnabledChange,
  openaqLoading,
  onRefreshOpenaq,
  onStartCinematicTour,
  presentationMode,
  onPresentationModeChange,
  onPresetFetch,
  onClearData,
  loading,
  hasData,
  customUrl,
  onCustomUrlChange,
  onFetchCustomUrl,
}: MapControlsProps) {
  const [baseLayerOpen, setBaseLayerOpen] = useState(true);
  const [layersAndPresentationOpen, setLayersAndPresentationOpen] = useState(true);
  const [presetsOpen, setPresetsOpen] = useState(true);
  const [customUrlOpen, setCustomUrlOpen] = useState(true);

  return (
    <div className="glass-panel p-4 space-y-4 w-72">
      <div className="flex items-center gap-2 text-accent font-semibold">
        <Layers className="size-5" />
        <span>Magic Import</span>
      </div>

      {/* Base layer – collapsible */}
      <CollapsibleSection
        title="Base layer"
        expanded={baseLayerOpen}
        onToggle={() => setBaseLayerOpen((v) => !v)}
      >
        <div className="flex flex-col gap-1 rounded-lg overflow-hidden border border-border">
          <button
            type="button"
            onClick={() => onBaseLayerChange("vector")}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 text-sm transition-colors ${
              baseLayer === "vector"
                ? "bg-accent text-white"
                : "bg-surface-elevated text-muted hover:bg-border/50"
            }`}
          >
            <MapIcon className="size-4 shrink-0" />
            Vector
          </button>
          <button
            type="button"
            onClick={() => onBaseLayerChange("satellite")}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 text-sm transition-colors ${
              baseLayer === "satellite"
                ? "bg-accent text-white"
                : "bg-surface-elevated text-muted hover:bg-border/50"
            }`}
          >
            <Satellite className="size-4 shrink-0" />
            Sentinel-2
          </button>
          <button
            type="button"
            onClick={() => onBaseLayerChange("high-res")}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 text-sm transition-colors ${
              baseLayer === "high-res"
                ? "bg-accent text-white"
                : "bg-surface-elevated text-muted hover:bg-border/50"
            }`}
          >
            <Landmark className="size-4 shrink-0" />
            High-Res
          </button>
        </div>
      </CollapsibleSection>

      {/* Layers & presentation: 3D, Overlays, Presentation – one collapsible group */}
      <CollapsibleSection
        title="Layers & presentation"
        expanded={layersAndPresentationOpen}
        onToggle={() => setLayersAndPresentationOpen((v) => !v)}
      >
        <div className="space-y-4 pl-0">
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
          <div className="space-y-2">
            <span className="text-sm text-muted">Overlays</span>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={co2Enabled}
                onChange={(e) => onCo2EnabledChange(e.target.checked)}
                className="size-4 rounded border-border bg-surface-elevated text-accent focus:ring-accent"
              />
              <Cloud className="size-4 text-muted" />
              <span className="text-sm">CO₂ Atmosphere Overlay</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={openaqEnabled}
                onChange={(e) => {
                  onOpenaqEnabledChange(e.target.checked);
                  if (e.target.checked) onRefreshOpenaq();
                }}
                disabled={openaqLoading}
                className="size-4 rounded border-border bg-surface-elevated text-accent focus:ring-accent"
              />
              {openaqLoading ? (
                <Loader2 className="size-4 text-muted animate-spin" />
              ) : (
                <Wind className="size-4 text-muted" />
              )}
              <span className="text-sm">Live Air Quality</span>
            </label>
          </div>
          <div className="space-y-2">
            <span className="text-sm text-muted">Presentation</span>
            <button
              type="button"
              onClick={onStartCinematicTour}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg bg-accent hover:bg-accent-muted text-white text-sm font-medium transition-colors"
            >
              <Play className="size-4 shrink-0" />
              Start Cinematic Tour
            </button>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={presentationMode}
                onChange={(e) => onPresentationModeChange(e.target.checked)}
                className="size-4 rounded border-border bg-surface-elevated text-accent focus:ring-accent"
              />
              <Maximize2 className="size-4 text-muted" />
              <span className="text-sm">Presentation Mode</span>
            </label>
          </div>
        </div>
      </CollapsibleSection>

      {/* Presets – collapsible */}
      <CollapsibleSection
        title="Presets"
        expanded={presetsOpen}
        onToggle={() => setPresetsOpen((v) => !v)}
      >
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
      </CollapsibleSection>

      {/* Custom GeoJSON URL – collapsible */}
      <CollapsibleSection
        title="Custom GeoJSON URL"
        expanded={customUrlOpen}
        onToggle={() => setCustomUrlOpen((v) => !v)}
      >
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
      </CollapsibleSection>

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
