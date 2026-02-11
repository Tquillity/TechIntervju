"use client";

import type maplibregl from "maplibre-gl";
import { useRef, useState, useCallback } from "react";
import { MapViewport, type BaseLayerId } from "./map-viewport";
import { MapControls } from "./controls";
import { DataInspector } from "./data-inspector";
import { TimelineSlider } from "./timeline-slider";
import { useGeoData } from "@/hooks/use-geodata";
import { padBBox } from "@/hooks/use-geodata";

function getYesterdayYYYYMMDD(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function MapDashboard() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [baseLayer, setBaseLayer] = useState<BaseLayerId>("vector");
  const [buildings3dVisible, setBuildings3dVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => getYesterdayYYYYMMDD());
  const [co2Enabled, setCo2Enabled] = useState(false);
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

  const flyToBbox = bbox ? padBBox(bbox, 1.25) : null;

  const handleFetchCustomUrl = useCallback(() => {
    if (customUrl.trim()) fetchByUrl(customUrl.trim());
  }, [customUrl, fetchByUrl]);

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
        onFeatureClick={setInspectedFeature}
      />

      {/* Mock data banner */}
      {isMocked && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-lg bg-warning/90 text-black font-semibold text-sm shadow-lg border border-warning"
          role="status"
          aria-live="polite"
        >
          THIS DATA IS MOCKED (real source unavailable or CORS blocked)
        </div>
      )}

      {/* Magic Import sidebar */}
      <div className="absolute top-4 left-4 z-10">
        <MapControls
          baseLayer={baseLayer}
          onBaseLayerChange={setBaseLayer}
          buildings3dVisible={buildings3dVisible}
          onBuildings3dChange={setBuildings3dVisible}
          co2Enabled={co2Enabled}
          onCo2EnabledChange={setCo2Enabled}
          onPresetFetch={fetchPreset}
          onClearData={clear}
          loading={loading}
          hasData={!!geodata?.features?.length}
          customUrl={customUrl}
          onCustomUrlChange={setCustomUrl}
          onFetchCustomUrl={handleFetchCustomUrl}
        />
      </div>

      {/* Temporal CO2 timeline – centered at bottom to avoid overlapping sidebar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4">
        <TimelineSlider value={selectedDate} onChange={setSelectedDate} />
      </div>

      {/* Data Inspector – offset from right so it doesn’t overlap MapLibre nav controls */}
      <div className="absolute top-4 right-16 z-10 max-w-[calc(100vw-8rem)]">
        <DataInspector
          feature={inspectedFeature}
          onClose={() => setInspectedFeature(null)}
        />
      </div>
    </div>
  );
}
