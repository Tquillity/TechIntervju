"use client";

import type maplibregl from "maplibre-gl";
import { useRef, useState, useCallback, useEffect } from "react";
import { PanelLeftOpen } from "lucide-react";
import { MapViewport, startCinematicTour, type BaseLayerId } from "./map-viewport";
import { MapControls } from "./controls";
import { DataInspector } from "./data-inspector";
import { TimelineSlider } from "./timeline-slider";
import { useGeoData } from "@/hooks/use-geodata";
import { useOpenAQ } from "@/hooks/use-openaq";
import { padBBox } from "@/hooks/use-geodata";

/** NASA GIBS AIRS CO2 has ~3–4 day processing lag; use 4 days prior so tiles exist. */
function getCo2DefaultDateYYYYMMDD(): string {
  const d = new Date();
  d.setDate(d.getDate() - 4);
  return d.toISOString().slice(0, 10);
}

export function MapDashboard() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [baseLayer, setBaseLayer] = useState<BaseLayerId>("vector");
  const [buildings3dVisible, setBuildings3dVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => getCo2DefaultDateYYYYMMDD());
  const [co2Enabled, setCo2Enabled] = useState(false);
  const [openaqEnabled, setOpenaqEnabled] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [inspectedFeature, setInspectedFeature] =
    useState<GeoJSON.Feature | null>(null);

  const {
    data: geodata,
    bbox,
    loading,
    isMocked,
    fetchPreset,
    fetchByUrl,
    clear,
  } = useGeoData();

  const { data: openaqData, loading: openaqLoading, refresh: refreshOpenAQ } = useOpenAQ();

  useEffect(() => {
    if (openaqEnabled && !openaqData) refreshOpenAQ();
  }, [openaqEnabled, openaqData, refreshOpenAQ]);

  const flyToBbox = bbox ? padBBox(bbox, 1.25) : null;

  const handleFetchCustomUrl = useCallback(() => {
    if (customUrl.trim()) fetchByUrl(customUrl.trim());
  }, [customUrl, fetchByUrl]);

  const handleStartCinematicTour = useCallback(() => {
    startCinematicTour(mapRef.current);
  }, []);

  // ESC (and Enter on some OS) exits presentation mode
  useEffect(() => {
    if (!presentationMode) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") {
        setPresentationMode(false);
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [presentationMode]);

  const presentationHide = presentationMode ? "opacity-0 pointer-events-none transition-opacity duration-300" : "transition-opacity duration-300";

  return (
    <div className="relative w-full h-full @container">
      <MapViewport
        mapRef={mapRef}
        flyToBbox={flyToBbox}
        baseLayer={baseLayer}
        buildings3dVisible={buildings3dVisible}
        selectedDate={selectedDate}
        co2Enabled={co2Enabled}
        geodata={geodata ?? null}
        openaqData={openaqData ?? null}
        openaqEnabled={openaqEnabled}
        onFeatureClick={setInspectedFeature}
      />

      {/* Presentation mode: small expand button top-left to show menu again */}
      {presentationMode && (
        <button
          type="button"
          onClick={() => setPresentationMode(false)}
          className="absolute top-4 left-4 z-20 flex items-center justify-center size-10 rounded-lg bg-surface-elevated/95 hover:bg-surface-elevated border border-border shadow-lg text-muted hover:text-foreground transition-colors"
          aria-label="Exit presentation mode (show menu)"
          title="Exit presentation mode (Esc)"
        >
          <PanelLeftOpen className="size-5" />
        </button>
      )}

      {/* Mock data banner – hidden in presentation mode */}
      {isMocked && (
        <div
          className={`absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-lg bg-warning/90 text-black font-semibold text-sm shadow-lg border border-warning ${presentationHide}`}
          role="status"
          aria-live="polite"
        >
          THIS DATA IS MOCKED (real source unavailable or CORS blocked)
        </div>
      )}

      {/* Magic Import sidebar – hidden in presentation mode */}
      <div className={`absolute top-4 left-4 z-10 ${presentationHide}`}>
        <MapControls
          baseLayer={baseLayer}
          onBaseLayerChange={setBaseLayer}
          buildings3dVisible={buildings3dVisible}
          onBuildings3dChange={setBuildings3dVisible}
          co2Enabled={co2Enabled}
          onCo2EnabledChange={setCo2Enabled}
          openaqEnabled={openaqEnabled}
          onOpenaqEnabledChange={setOpenaqEnabled}
          openaqLoading={openaqLoading}
          onRefreshOpenaq={refreshOpenAQ}
          onStartCinematicTour={handleStartCinematicTour}
          presentationMode={presentationMode}
          onPresentationModeChange={setPresentationMode}
          onPresetFetch={fetchPreset}
          onClearData={clear}
          loading={loading}
          hasData={!!geodata?.features?.length}
          customUrl={customUrl}
          onCustomUrlChange={setCustomUrl}
          onFetchCustomUrl={handleFetchCustomUrl}
        />
      </div>

      {/* Temporal CO2 timeline – hidden in presentation mode */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4 ${presentationHide}`}>
        <TimelineSlider value={selectedDate} onChange={setSelectedDate} />
      </div>

      {/* Data Inspector – hidden in presentation mode */}
      <div className={`absolute top-4 right-16 z-10 max-w-[calc(100vw-8rem)] ${presentationHide}`}>
        <DataInspector
          feature={inspectedFeature}
          onClose={() => setInspectedFeature(null)}
        />
      </div>
    </div>
  );
}
