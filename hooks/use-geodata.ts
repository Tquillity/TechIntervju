"use client";

import { useCallback, useState } from "react";

export type GeoJSONFeature = GeoJSON.Feature<
  GeoJSON.Geometry,
  Record<string, unknown>
>;
export type GeoJSONFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Geometry,
  Record<string, unknown>
>;

export type BBox = [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]

function isFeatureCollection(
  data: unknown
): data is GeoJSON.FeatureCollection {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    (data as GeoJSON.GeoJSON).type === "FeatureCollection" &&
    Array.isArray((data as GeoJSON.FeatureCollection).features)
  );
}

function isFeature(data: unknown): data is GeoJSON.Feature {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    (data as GeoJSON.GeoJSON).type === "Feature" &&
    "geometry" in (data as GeoJSON.Feature)
  );
}

function isGeometry(
  g: unknown
): g is GeoJSON.Point | GeoJSON.MultiPoint | GeoJSON.LineString | GeoJSON.MultiLineString | GeoJSON.Polygon | GeoJSON.MultiPolygon {
  if (typeof g !== "object" || g === null || !("type" in g)) return false;
  const t = (g as GeoJSON.Geometry).type;
  return [
    "Point",
    "MultiPoint",
    "LineString",
    "MultiLineString",
    "Polygon",
    "MultiPolygon",
  ].includes(t);
}

function coordLonLat(c: GeoJSON.Position): [number, number] {
  return [c[0], c[1]];
}

function bboxFromGeometry(geometry: GeoJSON.Geometry): BBox | null {
  if (!isGeometry(geometry)) return null;
  let minLon = Infinity,
    minLat = Infinity,
    maxLon = -Infinity,
    maxLat = -Infinity;

  function expand(...positions: GeoJSON.Position[]) {
    for (const c of positions) {
      const [lon, lat] = coordLonLat(c);
      minLon = Math.min(minLon, lon);
      minLat = Math.min(minLat, lat);
      maxLon = Math.max(maxLon, lon);
      maxLat = Math.max(maxLat, lat);
    }
  }

  switch (geometry.type) {
    case "Point":
      expand(geometry.coordinates);
      break;
    case "MultiPoint":
    case "LineString":
      expand(...geometry.coordinates);
      break;
    case "MultiLineString":
    case "Polygon":
      for (const ring of geometry.coordinates) expand(...ring);
      break;
    case "MultiPolygon":
      for (const poly of geometry.coordinates)
        for (const ring of poly) expand(...ring);
      break;
    default:
      return null;
  }

  if (
    minLon === Infinity ||
    minLat === Infinity ||
    maxLon === -Infinity ||
    maxLat === -Infinity
  )
    return null;
  return [minLon, minLat, maxLon, maxLat];
}

export function computeBBox(geojson: GeoJSONFeatureCollection): BBox | null {
  let minLon = Infinity,
    minLat = Infinity,
    maxLon = -Infinity,
    maxLat = -Infinity;

  for (const f of geojson.features) {
    if (!f.geometry) continue;
    const b = bboxFromGeometry(f.geometry);
    if (!b) continue;
    const [w, s, e, n] = b;
    minLon = Math.min(minLon, w);
    minLat = Math.min(minLat, s);
    maxLon = Math.max(maxLon, e);
    maxLat = Math.max(maxLat, n);
  }

  if (
    minLon === Infinity ||
    minLat === Infinity ||
    maxLon === -Infinity ||
    maxLat === -Infinity
  )
    return null;
  return [minLon, minLat, maxLon, maxLat];
}

/** Expand bbox by a ratio (e.g. 1.2 = 20% padding) */
export function padBBox(bbox: BBox, padding = 1.2): BBox {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  const cLon = (minLon + maxLon) / 2;
  const cLat = (minLat + maxLat) / 2;
  const halfW = ((maxLon - minLon) / 2) * padding;
  const halfH = ((maxLat - minLat) / 2) * padding;
  return [
    cLon - halfW,
    cLat - halfH,
    cLon + halfW,
    cLat + halfH,
  ];
}

export type PresetId = "earthquakes" | "city-trees" | "satellite-anomalies";

const PRESET_URLS: Record<PresetId, string> = {
  earthquakes: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
  "city-trees": "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/les-arbres/exports/geojson",
  "satellite-anomalies": "https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson"
};

/** Generate mock GeoJSON so demo works when CORS blocks real URLs */
export function generateMockGeoJSON(preset: PresetId): GeoJSONFeatureCollection {
  const centerLon = -98 + Math.random() * 20;
  const centerLat = 38 + Math.random() * 10;
  const features: GeoJSON.Feature<GeoJSON.Point, Record<string, unknown>>[] = [];

  if (preset === "earthquakes") {
    for (let i = 0; i < 24; i++) {
      features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            centerLon + (Math.random() - 0.5) * 8,
            centerLat + (Math.random() - 0.5) * 6,
          ],
        },
        properties: {
          mag: (Math.random() * 4 + 2).toFixed(1),
          place: `Mock earthquake ${i + 1}`,
          time: Date.now() - i * 3600000,
          title: `M ${(Math.random() * 4 + 2).toFixed(1)} - Mock`,
        },
      });
    }
  } else if (preset === "city-trees") {
    for (let i = 0; i < 40; i++) {
      features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            centerLon + (Math.random() - 0.5) * 0.05,
            centerLat + (Math.random() - 0.5) * 0.05,
          ],
        },
        properties: {
          common_name: ["Oak", "Maple", "Pine", "Birch", "Willow"][i % 5],
          height_m: (Math.random() * 15 + 3).toFixed(1),
          id: `tree-${i + 1}`,
        },
      });
    }
  } else {
    for (let i = 0; i < 15; i++) {
      features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            centerLon + (Math.random() - 0.5) * 6,
            centerLat + (Math.random() - 0.5) * 4,
          ],
        },
        properties: {
          anomaly_type: ["thermal", "ndvi_drop", "flood"][i % 3],
          confidence: (Math.random() * 0.4 + 0.6).toFixed(2),
          date: new Date().toISOString().slice(0, 10),
        },
      });
    }
  }

  return { type: "FeatureCollection", features };
}

export interface UseGeoDataResult {
  data: GeoJSONFeatureCollection | null;
  bbox: BBox | null;
  loading: boolean;
  error: string | null;
  isMocked: boolean;
  fetchByUrl: (url: string) => Promise<void>;
  fetchPreset: (preset: PresetId) => Promise<void>;
  clear: () => void;
}

export function useGeoData(): UseGeoDataResult {
  const [data, setData] = useState<GeoJSONFeatureCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMocked, setIsMocked] = useState(false);

  const fetchByUrl = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    setIsMocked(false);
    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      if (isFeatureCollection(raw)) {
        setData(raw as GeoJSONFeatureCollection);
        return;
      }
      if (isFeature(raw)) {
        setData({
          type: "FeatureCollection",
          features: [raw as GeoJSONFeature],
        });
        return;
      }
      throw new Error("Invalid GeoJSON");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPreset = useCallback(async (preset: PresetId) => {
    setLoading(true);
    setError(null);
    setIsMocked(false);
    const url = PRESET_URLS[preset];
    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      if (isFeatureCollection(raw) && raw.features.length > 0) {
        setData(raw as GeoJSONFeatureCollection);
        return;
      }
      if (isFeature(raw)) {
        setData({
          type: "FeatureCollection",
          features: [raw as GeoJSONFeature],
        });
        return;
      }
      throw new Error("Invalid or empty GeoJSON");
    } catch {
      const mock = generateMockGeoJSON(preset);
      setData(mock);
      setIsMocked(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setData(null);
    setError(null);
    setIsMocked(false);
  }, []);

  const bbox = data ? computeBBox(data) : null;

  return {
    data,
    bbox,
    loading,
    error,
    isMocked,
    fetchByUrl,
    fetchPreset,
    clear,
  };
}
