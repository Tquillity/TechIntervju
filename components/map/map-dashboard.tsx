"use client";

import type maplibregl from "maplibre-gl";
import { useRef, useState, useCallback, useEffect } from "react";
import { PanelLeftOpen } from "lucide-react";
import { MapViewport, startCinematicTour, type BaseLayerId } from "./map-viewport";
import { MapControls } from "./controls";
import { DataInspector } from "./data-inspector";
import { DataListing } from "./data-listing";
import { MapLegend } from "./map-legend";
import { TimelineSlider } from "./timeline-slider";
import { PerformanceHUD } from "./performance-hud";
import { useGeoData, findLatestNasaDate } from "@/hooks/use-geodata";
import { useOpenAQ } from "@/hooks/use-openaq";
import { padBBox } from "@/hooks/use-geodata";

/** Fallback when availability probe finds no valid date (8 days ago). */
function getCo2FallbackDateYYYYMMDD(): string {
  const d = new Date();
  d.setDate(d.getDate() - 8);
  return d.toISOString().slice(0, 10);
}

export function MapDashboard() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [baseLayer, setBaseLayer] = useState<BaseLayerId>("vector");
  const [buildings3dVisible, setBuildings3dVisible] = useState(false);
  const [maxAvailableDate, setMaxAvailableDate] = useState(() => getCo2FallbackDateYYYYMMDD());
  const [selectedDate, setSelectedDate] = useState(() => getCo2FallbackDateYYYYMMDD());
  const [co2Enabled, setCo2Enabled] = useState(false);
  const [openaqEnabled, setOpenaqEnabled] = useState(false);
  const [ndviEnabled, setNdviEnabled] = useState(false);
  const [soilEnabled, setSoilEnabled] = useState(false);
  const [aodEnabled, setAodEnabled] = useState(false);
  const [no2Enabled, setNo2Enabled] = useState(false);
  const [nightlightsEnabled, setNightlightsEnabled] = useState(false);
  const [firesEnabled, setFiresEnabled] = useState(false);
  const [firesData, setFiresData] = useState<GeoJSON.FeatureCollection<GeoJSON.Point> | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
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

  // FIRMS proxy: fetch USGS Latest Hour when fires overlay enabled (open API, same logic as FIRMS)
  useEffect(() => {
    if (!firesEnabled) return;
    const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";
    fetch(url, { mode: "cors" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("HTTP " + res.status))))
      .then((fc: GeoJSON.FeatureCollection) => setFiresData(fc as GeoJSON.FeatureCollection<GeoJSON.Point>))
      .catch(() => setFiresData(null));
  }, [firesEnabled]);

  // Probe NASA GIBS for latest available CO2 date on mount; clamp timeline to available range
  useEffect(() => {
    const fallback = getCo2FallbackDateYYYYMMDD();
    findLatestNasaDate().then((latest) => {
      const resolved = latest ?? fallback;
      setMaxAvailableDate(resolved);
      setSelectedDate(resolved);
    });
  }, []);

  const flyToBbox = bbox ? padBBox(bbox, 1.25) : null;

  const handleFetchCustomUrl = useCallback(() => {
    if (customUrl.trim()) fetchByUrl(customUrl.trim());
  }, [customUrl, fetchByUrl]);

  const handleMapReady = useCallback((map: maplibregl.Map) => {
    setMapReady(true);
    setMapInstance(map);
  }, []);

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
        ndviEnabled={ndviEnabled}
        soilEnabled={soilEnabled}
        aodEnabled={aodEnabled}
        no2Enabled={no2Enabled}
        nightlightsEnabled={nightlightsEnabled}
        firesEnabled={firesEnabled}
        firesData={firesData ?? null}
        geodata={geodata ?? null}
        openaqData={openaqData ?? null}
        openaqEnabled={openaqEnabled}
        onMapReady={handleMapReady}
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
          ndviEnabled={ndviEnabled}
          onNdviEnabledChange={setNdviEnabled}
          soilEnabled={soilEnabled}
          onSoilEnabledChange={setSoilEnabled}
          aodEnabled={aodEnabled}
          onAodEnabledChange={setAodEnabled}
          no2Enabled={no2Enabled}
          onNo2EnabledChange={setNo2Enabled}
          nightlightsEnabled={nightlightsEnabled}
          onNightlightsEnabledChange={setNightlightsEnabled}
          firesEnabled={firesEnabled}
          onFiresEnabledChange={setFiresEnabled}
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

      {/* Scientific legends: right of menu so they never sit on top of it */}
      <div className={`absolute bottom-12 left-78 z-10 ${presentationHide}`}>
        <MapLegend
          co2Enabled={co2Enabled}
          ndviEnabled={ndviEnabled}
          soilEnabled={soilEnabled}
          aodEnabled={aodEnabled}
          no2Enabled={no2Enabled}
          nightlightsEnabled={nightlightsEnabled}
        />
      </div>

      {/* Temporal atmosphere timeline – hidden in presentation mode */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4 ${presentationHide}`}>
        <TimelineSlider value={selectedDate} onChange={setSelectedDate} maxDate={maxAvailableDate} />
      </div>

      {/* Bottom-right: Inspector above list so it never overlaps Data Records */}
      <div className={`absolute bottom-10 right-4 z-20 flex flex-col items-end gap-3 ${presentationHide}`}>
        <DataInspector
          feature={inspectedFeature}
          onClose={() => setInspectedFeature(null)}
        />
        <DataListing
          data={geodata ?? null}
          onFeatureClick={(f) => {
            setInspectedFeature(f);
            if (f.geometry?.type === "Point" && mapRef.current) {
              const coords = (f.geometry as GeoJSON.Point).coordinates;
              if (Array.isArray(coords) && coords.length >= 2) {
                mapRef.current.flyTo({
                  center: [coords[0], coords[1]],
                  zoom: 12,
                  pitch: 45,
                  essential: true,
                });
              }
            }
          }}
        />
        <PerformanceHUD
          map={mapInstance}
          mapRef={mapRef}
          mapReady={mapReady}
          className="static"
        />
      </div>
    </div>
  );
}
