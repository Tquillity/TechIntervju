"use client";

import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
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
  Minimize2,
  ChevronDown,
  ChevronRight,
  Leaf,
  Droplets,
  Flame,
  Haze,
  Factory,
  Globe,
  Moon,
  Smile,
  Info,
} from "lucide-react";
import type { BaseLayerId } from "./map-viewport";
import type { PresetId } from "@/hooks/use-geodata";

/**
 * Small info icon that portals a tooltip to document.body so it is never
 * clipped by the panel's overflow-y-auto.  Appears to the right of the icon,
 * overlaying the map.
 */
function InfoTooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const iconRef = useRef<HTMLSpanElement>(null);

  const handleEnter = useCallback(() => {
    if (!iconRef.current) return;
    const r = iconRef.current.getBoundingClientRect();
    setCoords({ x: r.right + 8, y: r.top + r.height / 2 });
    setVisible(true);
  }, []);

  const handleLeave = useCallback(() => setVisible(false), []);

  return (
    <span
      ref={iconRef}
      className="ml-auto shrink-0 group/tip"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Info className="size-3.5 opacity-40 group-hover/tip:opacity-100 group-hover/tip:text-accent transition-all cursor-help" />
      {visible &&
        createPortal(
          <span
            className="fixed -translate-y-1/2 w-52 rounded-lg bg-surface-elevated border border-border px-3 py-2 text-xs text-foreground shadow-lg z-9999 text-center leading-relaxed pointer-events-none animate-in fade-in duration-150"
            style={{ top: coords.y, left: coords.x }}
          >
            {text}
            <span className="absolute top-1/2 -translate-y-1/2 right-full border-4 border-transparent border-r-border" />
          </span>,
          document.body,
        )}
    </span>
  );
}

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
  ndviEnabled: boolean;
  onNdviEnabledChange: (enabled: boolean) => void;
  soilEnabled: boolean;
  onSoilEnabledChange: (enabled: boolean) => void;
  aodEnabled: boolean;
  onAodEnabledChange: (enabled: boolean) => void;
  no2Enabled: boolean;
  onNo2EnabledChange: (enabled: boolean) => void;
  nightlightsEnabled: boolean;
  onNightlightsEnabledChange: (enabled: boolean) => void;
  firesEnabled: boolean;
  onFiresEnabledChange: (enabled: boolean) => void;
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
  welcomeBannerVisible: boolean;
  onWelcomeBannerToggle: () => void;
  embeddedMode?: boolean;
  onEmbeddedModeToggle?: () => void;
}

export function MapControls({
  baseLayer,
  onBaseLayerChange,
  buildings3dVisible,
  onBuildings3dChange,
  co2Enabled,
  onCo2EnabledChange,
  ndviEnabled,
  onNdviEnabledChange,
  soilEnabled,
  onSoilEnabledChange,
  aodEnabled,
  onAodEnabledChange,
  no2Enabled,
  onNo2EnabledChange,
  nightlightsEnabled,
  onNightlightsEnabledChange,
  firesEnabled,
  onFiresEnabledChange,
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
  welcomeBannerVisible,
  onWelcomeBannerToggle,
  embeddedMode = false,
  onEmbeddedModeToggle,
}: MapControlsProps) {
  const [baseLayerOpen, setBaseLayerOpen] = useState(true);
  const [layersAndPresentationOpen, setLayersAndPresentationOpen] = useState(true);
  const [presetsOpen, setPresetsOpen] = useState(true);
  const [customUrlOpen, setCustomUrlOpen] = useState(true);

  return (
    <div className="glass-panel p-4 space-y-4 w-72 max-h-[calc(100vh-5rem)] overflow-y-auto custom-scrollbar flex flex-col">
      <div className="flex items-center gap-2 text-accent font-semibold shrink-0">
        <Layers className="size-5" />
        <span className="flex-1">Magic Import</span>
        <button
          type="button"
          onClick={onWelcomeBannerToggle}
          className={`p-1 rounded-md transition-colors ${welcomeBannerVisible ? "bg-accent/20 text-accent" : "text-muted hover:text-accent"}`}
          title={welcomeBannerVisible ? "Hide welcome banner" : "Show welcome banner"}
          aria-pressed={welcomeBannerVisible}
        >
          <Smile className="size-5" />
        </button>
        {onEmbeddedModeToggle && (
          <button
            type="button"
            onClick={onEmbeddedModeToggle}
            className={`p-1 rounded-md transition-colors ${embeddedMode ? "bg-accent/20 text-accent" : "text-muted hover:text-accent"}`}
            title={embeddedMode ? "Expand to fullscreen" : "Embed in webpage"}
            aria-pressed={embeddedMode}
          >
            {embeddedMode ? <Maximize2 className="size-5" /> : <Minimize2 className="size-5" />}
          </button>
        )}
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
            <InfoTooltip text="Clean vector tile map with roads, labels, and terrain — ideal for data overlays." />
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
            <InfoTooltip text="True-color satellite imagery from the ESA Sentinel-2 constellation, updated regularly." />
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
            <InfoTooltip text="High-resolution aerial/satellite imagery for detailed close-up views of buildings and terrain." />
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
              <InfoTooltip text="Extrude building footprints into 3D using OpenStreetMap height data. Best at zoom 14+." />
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
              <span className="text-sm">Ozone Total Column (OMPS)</span>
              <InfoTooltip text="Daily total ozone column from OMPS on Suomi-NPP via NASA GIBS. Date-driven by the timeline." />
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ndviEnabled}
                onChange={(e) => onNdviEnabledChange(e.target.checked)}
                className="size-4 rounded border-border bg-surface-elevated text-accent focus:ring-accent"
              />
              <Leaf className="size-4 text-muted" />
              <span className="text-sm">Vegetation (NDVI)</span>
              <InfoTooltip text="Normalized Difference Vegetation Index — greener = denser plant cover. From MODIS via NASA GIBS." />
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={soilEnabled}
                onChange={(e) => onSoilEnabledChange(e.target.checked)}
                className="size-4 rounded border-border bg-surface-elevated text-accent focus:ring-accent"
              />
              <Droplets className="size-4 text-muted" />
              <span className="text-sm">Precipitation Rate (IMERG)</span>
              <InfoTooltip text="Near-real-time global precipitation estimates from NASA GPM/IMERG. Date-driven by the timeline." />
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={aodEnabled}
                onChange={(e) => onAodEnabledChange(e.target.checked)}
                className="size-4 rounded border-border bg-surface-elevated text-accent focus:ring-accent"
              />
              <Haze className="size-4 text-muted" />
              <span className="text-sm">Aerosol Optical Depth (MODIS)</span>
              <InfoTooltip text="Aerosol Optical Depth from MODIS — measures atmospheric haze, dust, and pollution density." />
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={no2Enabled}
                onChange={(e) => onNo2EnabledChange(e.target.checked)}
                className="size-4 rounded border-border bg-surface-elevated text-accent focus:ring-accent"
              />
              <Factory className="size-4 text-muted" />
              <span className="text-sm">Nitrogen Dioxide (TROPOMI)</span>
              <InfoTooltip text="Tropospheric NO₂ column from Sentinel-5P TROPOMI — highlights industrial and traffic emissions." />
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={nightlightsEnabled}
                onChange={(e) => onNightlightsEnabledChange(e.target.checked)}
                className="size-4 rounded border-border bg-surface-elevated text-accent focus:ring-accent"
              />
              <Moon className="size-4 text-muted" />
              <span className="text-sm">Night Lights (VIIRS 2012)</span>
              <InfoTooltip text="Global nighttime lights composite from VIIRS Day-Night Band (2012). Shows urban development and energy use." />
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={firesEnabled}
                onChange={(e) => onFiresEnabledChange(e.target.checked)}
                className="size-4 rounded border-border bg-surface-elevated text-accent focus:ring-accent"
              />
              <Flame className="size-4 text-muted" />
              <span className="text-sm">Active Thermal Anomaly (NASA FIRMS)</span>
              <InfoTooltip text="Near-real-time thermal hotspot detections from NASA FIRMS — wildfires, volcanic activity, and flaring." />
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
              <InfoTooltip text="Real-time air quality sensor readings from the OpenAQ network — PM2.5, PM10, O₃, NO₂, and more." />
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
              <InfoTooltip text="Fly the camera through a curated sequence of global landmarks with smooth cinematic transitions." />
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
              <InfoTooltip text="Hide all UI controls for a clean, full-screen map view. Press Esc or Enter to exit." />
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
            <InfoTooltip text="Fetch live earthquake data from the USGS Earthquake Hazards Program and plot quake epicenters on the map." />
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
            <InfoTooltip text="Load municipal open-data tree inventories — explore species, trunk diameter, and planting years." />
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
            <InfoTooltip text="Fetch recent satellite-detected anomalies — unusual heat signatures, outgassing, or surface changes." />
          </button>
          <button
            type="button"
            onClick={() => onPresetFetch("tectonic-plates")}
            disabled={loading}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg bg-surface-elevated hover:bg-border/50 border border-border transition-colors text-left disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-accent" />
            ) : (
              <Globe className="size-4 shrink-0 text-danger" />
            )}
            <span className="text-sm">Tectonic Plate Boundaries</span>
            <InfoTooltip text="Visualize the Earth's major tectonic plate boundaries — divergent, convergent, and transform faults." />
          </button>
          <button
            type="button"
            onClick={() => onPresetFetch("world-countries")}
            disabled={loading}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg bg-surface-elevated hover:bg-border/50 border border-border transition-colors text-left disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-accent" />
            ) : (
              <Globe className="size-4 shrink-0 text-accent" />
            )}
            <span className="text-sm">World Countries</span>
            <InfoTooltip text="Load world country polygons with names and ISO codes — useful as a reference or choropleth base." />
          </button>
        </div>
      </CollapsibleSection>

      {/* Custom GeoJSON URL – collapsible */}
      <CollapsibleSection
        title="Custom GeoJSON URL"
        expanded={customUrlOpen}
        onToggle={() => setCustomUrlOpen((v) => !v)}
      >
        <div className="space-y-2">
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
          <div className="flex items-center gap-1 text-muted">
            <InfoTooltip text="Paste any public GeoJSON URL and press Enter or click the link icon to import it onto the map." />
            <span className="text-xs">Paste a GeoJSON endpoint</span>
          </div>
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
          <InfoTooltip text="Remove all imported GeoJSON data from the map and reset the data inspector." />
        </button>
      )}
    </div>
  );
}
