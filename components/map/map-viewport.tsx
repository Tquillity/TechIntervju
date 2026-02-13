"use client";

import type maplibregl from "maplibre-gl";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { BBox } from "@/hooks/use-geodata";
import type { GeoJSONFeatureCollection } from "@/hooks/use-geodata";

// --- VERIFIED URLS FOR SPRINT 6 ---
const STADIA_VECTOR_STYLE = "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json";
const SENTINEL_RASTER_TILES = "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg";
const SENTINEL_MAX_ZOOM = 13;
const ESRI_IMAGERY_TILES = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const TERRAIN_SOURCE_URL = "https://demotiles.maplibre.org/terrain-tiles/tiles.json";

const SENTINEL_LAYER_ID = "sentinel-layer";
const ESRI_LAYER_ID = "esri-layer";
const TERRAIN_SOURCE_ID = "terrain-source";
const BUILDINGS_3D_LAYER_ID = "3d-buildings";
const NASA_CO2_SOURCE_ID = "nasa-co2";
const NASA_CO2_LAYER_ID = "co2-layer";

const GEODATA_LAYER_ID = "geodata-layer";
const GEODATA_SOURCE_ID = "geodata";

const OPENAQ_SOURCE_ID = "openaq";
const OPENAQ_GLOW_LAYER_ID = "openaq-glow";
const OPENAQ_LAYER_ID = "openaq-layer";

const NDVI_SOURCE_ID = "nasa-ndvi";
const NDVI_LAYER_ID = "ndvi-layer";
const SMAP_SOURCE_ID = "nasa-smap";
const SMAP_LAYER_ID = "smap-layer";
const FIRMS_PROXY_SOURCE_ID = "firms-proxy";
const FIRMS_PROXY_GLOW_LAYER_ID = "firms-proxy-glow";
const FIRMS_PROXY_LAYER_ID = "firms-proxy-layer";

/** NASA GIBS: OMPS Ozone Total Column (daily, near-real-time, Suomi NPP). */
function getNasaOzoneTileUrl(time: string): string {
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/OMPS_Ozone_Total_Column/default/${time}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`;
}

/** NASA GIBS: MODIS Terra NDVI 8-Day composite (current, Level9). */
function getNasaNdviTileUrl(time: string): string {
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/${time}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`;
}

/** NASA GIBS: IMERG Precipitation Rate (daily, near-real-time, GPM). */
function getImergPrecipTileUrl(time: string): string {
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/IMERG_Precipitation_Rate/default/${time}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`;
}

export type BaseLayerId = "vector" | "satellite" | "high-res";

export interface MapViewportProps {
  /** When set, triggers a cinematic fly-to this bbox (after data load) */
  flyToBbox: BBox | null;
  /** Current base layer for cross-fade (vector, Sentinel-2, or Esri high-res) */
  baseLayer: BaseLayerId;
  /** When true, show OpenFreeMap 3D buildings (fill-extrusion) */
  buildings3dVisible?: boolean;
  /** Selected date for NASA CO2 layer (YYYY-MM-DD) */
  selectedDate?: string;
  /** When true, show NASA CO2 atmosphere overlay */
  co2Enabled?: boolean;
  /** Loaded GeoJSON to display on the map */
  geodata?: GeoJSONFeatureCollection | null;
  /** OpenAQ PM2.5 GeoJSON for live air quality layer */
  openaqData?: GeoJSON.FeatureCollection<GeoJSON.Point, { pm25?: number }> | null;
  /** When true, show OpenAQ air quality circles */
  openaqEnabled?: boolean;
  /** When true, show NASA MODIS NDVI (vegetation) overlay */
  ndviEnabled?: boolean;
  /** When true, show NASA SMAP soil moisture overlay */
  soilEnabled?: boolean;
  /** When true, show Active Thermal Anomaly (NASA FIRMS proxy) layer – top-most */
  firesEnabled?: boolean;
  /** GeoJSON points for FIRMS proxy (e.g. USGS Latest Hour); styled as thermal anomalies */
  firesData?: GeoJSON.FeatureCollection<GeoJSON.Point> | null;
  /** Callback when map is ready */
  onMapReady?: (map: maplibregl.Map) => void;
  /** Callback when a feature is clicked (for Data Inspector) */
  onFeatureClick?: (feature: GeoJSON.Feature | null) => void;
  /** Ref to expose map instance to parent */
  mapRef?: RefObject<maplibregl.Map | null>;
}

export function MapViewport({
  flyToBbox,
  baseLayer,
  buildings3dVisible = false,
  selectedDate,
  co2Enabled = false,
  geodata,
  openaqData,
  openaqEnabled = false,
  ndviEnabled = false,
  soilEnabled = false,
  firesEnabled = false,
  firesData,
  onMapReady,
  onFeatureClick,
  mapRef: externalMapRef,
}: MapViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);
  const sentinelOpacityRef = useRef(0);
  const esriOpacityRef = useRef(0);
  const rafRef = useRef<number>(0);

  const map = externalMapRef?.current ?? mapInstanceRef.current;

  const cinematicFlyTo = useCallback(
    (bbox: BBox, duration = 3200) => {
      const m = mapInstanceRef.current;
      if (!m) return;
      const [minLon, minLat, maxLon, maxLat] = bbox;
      const padding = { top: 80, bottom: 80, left: 80, right: 80 };
      m.fitBounds(
        [
          [minLon, minLat],
          [maxLon, maxLat],
        ],
        {
          duration,
          padding,
          maxZoom: 14,
          pitch: 45,
          bearing: 0,
          essential: true,
        }
      );
    },
    []
  );

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    const maplibregl = require("maplibre-gl");
    const container = containerRef.current;

    const mapOptions: maplibregl.MapOptions = {
      container,
      style: STADIA_VECTOR_STYLE,
      center: [-98, 38.5],
      zoom: 3,
      pitch: 45,
      bearing: 0,
      ...(typeof (maplibregl as { preferWebGPU?: boolean }).preferWebGPU ===
        "boolean" && {
        preferWebGPU: true,
      }),
      canvasContextAttributes: {
        antialias: true,
        alpha: true,
      },
    };

    const mapInstance = new maplibregl.Map(mapOptions) as maplibregl.Map;
    mapInstanceRef.current = mapInstance;

    mapInstance.addControl(new maplibregl.NavigationControl(), "top-right");
    mapInstance.addControl(new maplibregl.ScaleControl(), "bottom-left");

    mapInstance.on("load", () => {
      const style = mapInstance.getStyle();
      if (!style) return;

      // True 3D terrain (RGB terrain tiles)
      if (!mapInstance.getSource(TERRAIN_SOURCE_ID)) {
        mapInstance.addSource(TERRAIN_SOURCE_ID, {
          type: "raster-dem",
          url: TERRAIN_SOURCE_URL,
          tileSize: 256,
        });
        mapInstance.setTerrain({
          source: TERRAIN_SOURCE_ID,
          exaggeration: 1.5,
        });
      }

      // Raster base layers (insert below labels): Sentinel-2 + Esri World Imagery
      const layers = mapInstance.getStyle().layers ?? [];
      let beforeId: string | undefined;
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === "symbol" && (layers[i] as { layout?: { "text-field"?: unknown } }).layout?.["text-field"]) {
          beforeId = layers[i].id;
          break;
        }
      }
      if (!mapInstance.getSource("sentinel-raster")) {
        mapInstance.addSource("sentinel-raster", {
          type: "raster",
          tiles: [SENTINEL_RASTER_TILES],
          tileSize: 256,
          maxzoom: SENTINEL_MAX_ZOOM,
          attribution:
            "Sentinel-2 cloudless © <a href='https://s2maps.eu' target='_blank'>EOX / s2maps.eu</a>",
        });
        mapInstance.addLayer(
          {
            id: SENTINEL_LAYER_ID,
            type: "raster",
            source: "sentinel-raster",
            minzoom: 0,
            maxzoom: SENTINEL_MAX_ZOOM,
            paint: { "raster-opacity": 0 },
          },
          beforeId
        );
      }
      if (!mapInstance.getSource("esri-raster")) {
        mapInstance.addSource("esri-raster", {
          type: "raster",
          tiles: [ESRI_IMAGERY_TILES],
          tileSize: 256,
          attribution: "Esri, Maxar, Earthstar Geographics",
        });
        mapInstance.addLayer(
          {
            id: ESRI_LAYER_ID,
            type: "raster",
            source: "esri-raster",
            paint: { "raster-opacity": 0 },
          },
          beforeId
        );
      }

      // NASA CO2 source (layer added after 3D buildings so it sits above base rasters, below 3D buildings)
      const initialCo2Time =
        selectedDate ??
        (() => {
          const d = new Date();
          d.setDate(d.getDate() - 8);
          return d.toISOString().slice(0, 10);
        })();
      if (!mapInstance.getSource(NASA_CO2_SOURCE_ID)) {
        mapInstance.addSource(NASA_CO2_SOURCE_ID, {
          type: "raster",
          tiles: [getNasaOzoneTileUrl(initialCo2Time)],
          tileSize: 256,
          maxzoom: 6,
          attribution: "NASA GIBS / OMPS Ozone Total Column",
        });
      }

      // 3D buildings: reuse Stadia style's openmaptiles source (no CORS/second source); OSM height/min_height
      if (mapInstance.getSource("openmaptiles") && !mapInstance.getLayer(BUILDINGS_3D_LAYER_ID)) {
        const labelLayerId = layers.find(
          (l) => l.type === "symbol" && (l as { layout?: { "text-field"?: unknown } }).layout?.["text-field"]
        )?.id;
        mapInstance.addLayer(
          {
            id: BUILDINGS_3D_LAYER_ID,
            source: "openmaptiles",
            "source-layer": "building",
            type: "fill-extrusion",
            minzoom: 14,
            layout: { visibility: "none" },
            paint: {
              "fill-extrusion-color": [
                "interpolate",
                ["linear"],
                ["coalesce", ["get", "height"], 0],
                0,
                "rgb(180,180,200)",
                200,
                "rgb(120,140,180)",
                400,
                "rgb(100,120,160)",
              ],
              "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["zoom"],
                14,
                0,
                16,
                ["coalesce", ["get", "height"], 0],
              ],
              "fill-extrusion-base": [
                "step",
                ["zoom"],
                0,
                16,
                ["coalesce", ["get", "min_height"], 0],
              ],
            },
          },
          labelLayerId
        );
      }

      // CO2 layer above base rasters, below 3D buildings and labels (hidden until overlay enabled)
      // NASA GIBS Level6 tile matrix only supports zoom 0–6; maxzoom prevents 400 on over-zoom
      if (!mapInstance.getLayer(NASA_CO2_LAYER_ID)) {
        mapInstance.addLayer(
          {
            id: NASA_CO2_LAYER_ID,
            type: "raster",
            source: NASA_CO2_SOURCE_ID,
            minzoom: 0,
            maxzoom: 6,
            layout: { visibility: "none" },
            paint: { "raster-opacity": 0.7 },
          },
          BUILDINGS_3D_LAYER_ID
        );
      }

      // NDVI (MODIS Terra NDVI 8-Day) – same stack as ozone overlay
      const ndviTime = initialCo2Time;
      if (!mapInstance.getSource(NDVI_SOURCE_ID)) {
        mapInstance.addSource(NDVI_SOURCE_ID, {
          type: "raster",
          tiles: [getNasaNdviTileUrl(ndviTime)],
          tileSize: 256,
          maxzoom: 9,
          attribution: "NASA GIBS / MODIS Terra NDVI 8-Day",
        });
        mapInstance.addLayer(
          {
            id: NDVI_LAYER_ID,
            type: "raster",
            source: NDVI_SOURCE_ID,
            minzoom: 0,
            maxzoom: 9,
            layout: { visibility: "none" },
            paint: { "raster-opacity": 0.8 },
          },
          BUILDINGS_3D_LAYER_ID
        );
      }

      // SMAP Soil Moisture – same stack
      if (!mapInstance.getSource(SMAP_SOURCE_ID)) {
        mapInstance.addSource(SMAP_SOURCE_ID, {
          type: "raster",
          tiles: [getImergPrecipTileUrl(initialCo2Time)],
          tileSize: 256,
          maxzoom: 6,
          attribution: "NASA GIBS / IMERG Precipitation Rate",
        });
        mapInstance.addLayer(
          {
            id: SMAP_LAYER_ID,
            type: "raster",
            source: SMAP_SOURCE_ID,
            minzoom: 0,
            maxzoom: 6,
            layout: { visibility: "none" },
            paint: { "raster-opacity": 0.75 },
          },
          BUILDINGS_3D_LAYER_ID
        );
      }

      setLoaded(true);
      onMapReady?.(mapInstance);
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      mapInstance.remove();
      mapInstanceRef.current = null;
      setLoaded(false);
    };
  }, [onMapReady]);

  // Cross-fade base layer (Sentinel-2, Vector, Esri high-res) via RAF
  useEffect(() => {
    if (!loaded || !mapInstanceRef.current) return;
    const m = mapInstanceRef.current;
    if (!m.getLayer(SENTINEL_LAYER_ID) || !m.getLayer(ESRI_LAYER_ID)) return;

    const targetSentinel = baseLayer === "satellite" ? 1 : 0;
    const targetEsri = baseLayer === "high-res" ? 1 : 0;
    const startSentinel = sentinelOpacityRef.current;
    const startEsri = esriOpacityRef.current;
    const startTime = performance.now();
    const duration = 600;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const sentinelOpacity = startSentinel + (targetSentinel - startSentinel) * eased;
      const esriOpacity = startEsri + (targetEsri - startEsri) * eased;
      sentinelOpacityRef.current = sentinelOpacity;
      esriOpacityRef.current = esriOpacity;
      m.setPaintProperty(SENTINEL_LAYER_ID, "raster-opacity", sentinelOpacity);
      m.setPaintProperty(ESRI_LAYER_ID, "raster-opacity", esriOpacity);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [baseLayer, loaded]);

  // 3D buildings visibility toggle
  useEffect(() => {
    if (!loaded || !mapInstanceRef.current) return;
    const m = mapInstanceRef.current;
    if (!m.getLayer(BUILDINGS_3D_LAYER_ID)) return;
    m.setLayoutProperty(
      BUILDINGS_3D_LAYER_ID,
      "visibility",
      buildings3dVisible ? "visible" : "none"
    );
  }, [loaded, buildings3dVisible]);

  // NASA CO2: update tile URL when selectedDate changes (avoids full layer reload/flicker)
  useEffect(() => {
    if (!loaded || !selectedDate || !mapInstanceRef.current) return;
    const m = mapInstanceRef.current;
    const source = m.getSource(NASA_CO2_SOURCE_ID) as
      | (maplibregl.RasterTileSource & { setTiles?: (tiles: string[]) => void })
      | undefined;
    if (source?.setTiles) {
      source.setTiles([getNasaOzoneTileUrl(selectedDate)]);
    }
  }, [loaded, selectedDate]);

  // NASA CO2 overlay visibility
  useEffect(() => {
    if (!loaded || !mapInstanceRef.current) return;
    const m = mapInstanceRef.current;
    if (!m.getLayer(NASA_CO2_LAYER_ID)) return;
    m.setLayoutProperty(
      NASA_CO2_LAYER_ID,
      "visibility",
      co2Enabled ? "visible" : "none"
    );
  }, [loaded, co2Enabled]);

  // NDVI: update tile URL to selected date (8-Day composite); toggle visibility
  useEffect(() => {
    if (!loaded || !selectedDate || !mapInstanceRef.current) return;
    const m = mapInstanceRef.current;
    const source = m.getSource(NDVI_SOURCE_ID) as
      | (maplibregl.RasterTileSource & { setTiles?: (tiles: string[]) => void })
      | undefined;
    if (source?.setTiles) source.setTiles([getNasaNdviTileUrl(selectedDate)]);
    if (m.getLayer(NDVI_LAYER_ID)) {
      m.setLayoutProperty(NDVI_LAYER_ID, "visibility", ndviEnabled ? "visible" : "none");
    }
  }, [loaded, selectedDate, ndviEnabled]);

  // SMAP: update tile URL to selected date; toggle visibility
  useEffect(() => {
    if (!loaded || !selectedDate || !mapInstanceRef.current) return;
    const m = mapInstanceRef.current;
    const source = m.getSource(SMAP_SOURCE_ID) as
      | (maplibregl.RasterTileSource & { setTiles?: (tiles: string[]) => void })
      | undefined;
    if (source?.setTiles) source.setTiles([getImergPrecipTileUrl(selectedDate)]);
    if (m.getLayer(SMAP_LAYER_ID)) {
      m.setLayoutProperty(SMAP_LAYER_ID, "visibility", soilEnabled ? "visible" : "none");
    }
  }, [loaded, selectedDate, soilEnabled]);

  // Cinematic fly-to when bbox is set (e.g. after data load)
  useEffect(() => {
    if (!flyToBbox || !loaded) return;
    cinematicFlyTo(flyToBbox);
  }, [flyToBbox, loaded, cinematicFlyTo]);

  // Sync ref for parent
  useEffect(() => {
    if (externalMapRef && mapInstanceRef.current) {
      (externalMapRef as React.MutableRefObject<maplibregl.Map | null>).current =
        mapInstanceRef.current;
    }
  }, [loaded, externalMapRef]);

  // GeoJSON overlay: always remove then add to avoid "layer already exists" race
  useEffect(() => {
    const m = mapInstanceRef.current;
    if (!m || !loaded) return;

    if (m.getLayer(GEODATA_LAYER_ID)) m.removeLayer(GEODATA_LAYER_ID);
    if (m.getSource(GEODATA_SOURCE_ID)) m.removeSource(GEODATA_SOURCE_ID);

    if (!geodata || geodata.features.length === 0) return;

    m.addSource(GEODATA_SOURCE_ID, { type: "geojson", data: geodata });
    m.addLayer({
      id: GEODATA_LAYER_ID,
      type: "circle",
      source: GEODATA_SOURCE_ID,
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          5,
          4,
          12,
          10,
        ],
        "circle-color": "#6b9ef5",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });
  }, [loaded, geodata]);

  // OpenAQ air quality: glow layer + main circle layer (step color by pm25)
  useEffect(() => {
    const m = mapInstanceRef.current;
    if (!m || !loaded) return;

    if (m.getLayer(OPENAQ_LAYER_ID)) m.removeLayer(OPENAQ_LAYER_ID);
    if (m.getLayer(OPENAQ_GLOW_LAYER_ID)) m.removeLayer(OPENAQ_GLOW_LAYER_ID);
    if (m.getSource(OPENAQ_SOURCE_ID)) m.removeSource(OPENAQ_SOURCE_ID);

    if (!openaqData || openaqData.features.length === 0) return;

    m.addSource(OPENAQ_SOURCE_ID, { type: "geojson", data: openaqData });
    m.addLayer(
      {
        id: OPENAQ_GLOW_LAYER_ID,
        type: "circle",
        source: OPENAQ_SOURCE_ID,
        paint: {
          "circle-radius": 24,
          "circle-blur": 1,
          "circle-color": [
            "step",
            ["get", "pm25"],
            "#22c55e",
            12,
            "#eab308",
            35,
            "#f97316",
            55,
            "#ef4444",
          ],
          "circle-opacity": 0.4,
        },
      },
      BUILDINGS_3D_LAYER_ID
    );
    m.addLayer(
      {
        id: OPENAQ_LAYER_ID,
        type: "circle",
        source: OPENAQ_SOURCE_ID,
        paint: {
          "circle-radius": 6,
          "circle-color": [
            "step",
            ["get", "pm25"],
            "#22c55e",
            12,
            "#eab308",
            35,
            "#f97316",
            55,
            "#ef4444",
          ],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
        },
      },
      OPENAQ_GLOW_LAYER_ID
    );
  }, [loaded, openaqData]);

  // OpenAQ layer visibility
  useEffect(() => {
    if (!loaded || !mapInstanceRef.current) return;
    const m = mapInstanceRef.current;
    for (const id of [OPENAQ_GLOW_LAYER_ID, OPENAQ_LAYER_ID]) {
      if (!m.getLayer(id)) continue;
      m.setLayoutProperty(id, "visibility", openaqEnabled ? "visible" : "none");
    }
  }, [loaded, openaqEnabled]);

  // Active Thermal Anomaly (NASA FIRMS proxy): USGS Latest Hour styled as pulsing orange/red heat rings – TOP-MOST
  useEffect(() => {
    const m = mapInstanceRef.current;
    if (!m || !loaded) return;

    if (m.getLayer(FIRMS_PROXY_LAYER_ID)) m.removeLayer(FIRMS_PROXY_LAYER_ID);
    if (m.getLayer(FIRMS_PROXY_GLOW_LAYER_ID)) m.removeLayer(FIRMS_PROXY_GLOW_LAYER_ID);
    if (m.getSource(FIRMS_PROXY_SOURCE_ID)) m.removeSource(FIRMS_PROXY_SOURCE_ID);

    if (!firesData || firesData.features.length === 0) return;

    m.addSource(FIRMS_PROXY_SOURCE_ID, { type: "geojson", data: firesData });
    m.addLayer({
      id: FIRMS_PROXY_GLOW_LAYER_ID,
      type: "circle",
      source: FIRMS_PROXY_SOURCE_ID,
      paint: {
        "circle-radius": 28,
        "circle-blur": 0.85,
        "circle-color": "#ff6b35",
        "circle-opacity": 0.5,
      },
    });
    m.addLayer({
      id: FIRMS_PROXY_LAYER_ID,
      type: "circle",
      source: FIRMS_PROXY_SOURCE_ID,
      paint: {
        "circle-radius": 8,
        "circle-color": "#dc2626",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#f97316",
      },
    });
  }, [loaded, firesData]);

  // FIRMS proxy layer visibility (top-most layer)
  useEffect(() => {
    if (!loaded || !mapInstanceRef.current) return;
    const m = mapInstanceRef.current;
    for (const id of [FIRMS_PROXY_GLOW_LAYER_ID, FIRMS_PROXY_LAYER_ID]) {
      if (!m.getLayer(id)) continue;
      m.setLayoutProperty(id, "visibility", firesEnabled ? "visible" : "none");
    }
  }, [loaded, firesEnabled]);

  // Feature click for Data Inspector
  useEffect(() => {
    const m = mapInstanceRef.current;
    if (!m || !onFeatureClick) return;
    const handleClick = (e: maplibregl.MapMouseEvent) => {
      try {
        if (!m.getLayer(GEODATA_LAYER_ID)) {
          onFeatureClick(null);
          return;
        }
        const features = m.queryRenderedFeatures(e.point, {
          layers: [GEODATA_LAYER_ID],
        });
        if (features.length > 0) {
          const f = features[0];
          onFeatureClick(
            f.geometry
              ? {
                  type: "Feature",
                  geometry: f.geometry as GeoJSON.Geometry,
                  properties: f.properties ?? {},
                }
              : null
          );
        } else {
          onFeatureClick(null);
        }
      } catch {
        onFeatureClick(null);
      }
    };
    m.on("click", handleClick);
    return () => {
      m.off("click", handleClick);
    };
  }, [loaded, onFeatureClick]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: "var(--color-surface)" }}
    />
  );
}

/**
 * Cinematic tour: Alps → NYC → Global.
 * Patient Rendering Logic: Waits for 'idle' (all tiles loaded) + 3s Dwell Time.
 */
/** Returns true if the map instance is still usable (not removed). */
function isMapAlive(map: maplibregl.Map): boolean {
  try {
    // getCanvas() throws or returns null after map.remove()
    return !!map.getCanvas();
  } catch {
    return false;
  }
}

export async function startCinematicTour(map: maplibregl.Map | null): Promise<void> {
  if (!map || !isMapAlive(map)) return;

  const stops: Array<{ center: [number, number]; zoom: number; pitch: number; bearing: number; name: string }> = [
    { center: [7.74, 46.02], zoom: 12, pitch: 60, bearing: 0, name: "3D Swiss Alps" },
    { center: [-74.006, 40.7128], zoom: 15.5, pitch: 55, bearing: -20, name: "New York Urbanism" },
    { center: [0, 20], zoom: 2.5, pitch: 0, bearing: 0, name: "Global Atmosphere" },
  ];

  for (const stop of stops) {
    if (!isMapAlive(map)) return;
    console.log(`Tour flying to: ${stop.name}`);

    map.flyTo({
      center: stop.center,
      zoom: stop.zoom,
      pitch: stop.pitch,
      bearing: stop.bearing,
      duration: 4000,
      essential: true,
    });

    // 1. Wait for movement to finish
    await new Promise<void>((resolve) => {
      if (!isMapAlive(map)) { resolve(); return; }
      map.once("moveend", resolve);
    });

    // 2. Wait for map to be 'idle' (tiles fully loaded)
    await new Promise<void>((resolve) => {
      if (!isMapAlive(map)) { resolve(); return; }
      map.once("idle", resolve);
    });

    // 3. Dwell time (3 seconds) to let the viewer enjoy the high-res detail
    await new Promise<void>((resolve) => setTimeout(resolve, 3000));
  }

  console.log("Cinematic Tour Complete.");
}
