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

// Alidade Smooth Dark – high-contrast dark vector theme for data overlays
const STADIA_VECTOR_STYLE =
  "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json";
// Satellite base layer: ESRI World Imagery (reliable, no CORS/404). EOX Sentinel-2 often blocks or 404s at high zoom.
const SENTINEL_RASTER_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
// Global 3D terrain (MapLibre demo)
const TERRAIN_SOURCE_URL =
  "https://demotiles.maplibre.org/terrain-tiles/tiles.json";
// OpenFreeMap vector tiles for 3D buildings (planet = TileJSON endpoint)
const OPENFREEMAP_VECTOR = "https://tiles.openfreemap.org/planet";

const GEODATA_LAYER_ID = "geodata-layer";
const GEODATA_SOURCE_ID = "geodata";

export type BaseLayerId = "vector" | "satellite";

export interface MapViewportProps {
  /** When set, triggers a cinematic fly-to this bbox (after data load) */
  flyToBbox: BBox | null;
  /** Current base layer for cross-fade */
  baseLayer: BaseLayerId;
  /** Loaded GeoJSON to display on the map */
  geodata?: GeoJSONFeatureCollection | null;
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
  geodata,
  onMapReady,
  onFeatureClick,
  mapRef: externalMapRef,
}: MapViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);
  const sentinelOpacityRef = useRef(0);
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

      // Terrain (raster-dem + setTerrain)
      if (!mapInstance.getSource("maplibre-terrain")) {
        mapInstance.addSource("maplibre-terrain", {
          type: "raster-dem",
          url: TERRAIN_SOURCE_URL,
          tileSize: 256,
        });
        mapInstance.setTerrain({
          source: "maplibre-terrain",
          exaggeration: 1.2,
        });
      }

      // Sentinel-2 raster layer (for base layer switch) – insert below labels
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
          attribution:
            "Esri, Maxar, Earthstar Geographics",
        });
        mapInstance.addLayer(
          {
            id: "sentinel-layer",
            type: "raster",
            source: "sentinel-raster",
            paint: { "raster-opacity": 0 },
          },
          beforeId
        );
      }

      // 3D buildings (OpenFreeMap building layer)
      if (!mapInstance.getSource("openfreemap")) {
        mapInstance.addSource("openfreemap", {
          type: "vector",
          url: OPENFREEMAP_VECTOR,
        });
        const labelLayerId = layers.find(
          (l) => l.type === "symbol" && (l as { layout?: { "text-field"?: unknown } }).layout?.["text-field"]
        )?.id;
        mapInstance.addLayer(
          {
            id: "3d-buildings",
            source: "openfreemap",
            "source-layer": "building",
            type: "fill-extrusion",
            minzoom: 14,
            filter: ["!=", ["get", "hide_3d"], true],
            paint: {
              "fill-extrusion-color": [
                "interpolate",
                ["linear"],
                ["get", "render_height"],
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
                ["get", "render_height"],
              ],
              "fill-extrusion-base": [
                "step",
                ["zoom"],
                0,
                16,
                ["get", "render_min_height"],
              ],
            },
          },
          labelLayerId
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

  // Cross-fade base layer (raster opacity) using requestAnimationFrame for smoothness
  useEffect(() => {
    if (!loaded || !mapInstanceRef.current) return;
    const m = mapInstanceRef.current;
    const layer = m.getLayer("sentinel-layer");
    if (!layer) return;

    const targetOpacity = baseLayer === "satellite" ? 1 : 0;
    const startOpacity = sentinelOpacityRef.current;
    const startTime = performance.now();
    const duration = 600;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const opacity = startOpacity + (targetOpacity - startOpacity) * eased;
      sentinelOpacityRef.current = opacity;
      m.setPaintProperty("sentinel-layer", "raster-opacity", opacity);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [baseLayer, loaded]);

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
