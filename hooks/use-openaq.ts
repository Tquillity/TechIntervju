"use client";

import { useCallback, useState } from "react";

const OPENAQ_LATEST_URL = "https://api.openaq.org/v2/latest?limit=250&parameter=pm25";

export type OpenAQGeoJSON = GeoJSON.FeatureCollection<
  GeoJSON.Point,
  { pm25: number; locationId?: string; datetime?: string }
>;

interface OpenAQResultRow {
  coordinates?: { latitude?: number; longitude?: number };
  locationId?: string;
  datetime?: string;
  measurements?: Array<{ parameter?: string; value?: number }>;
  parameter?: number;
  value?: number;
}

interface OpenAQResponse {
  results?: OpenAQResultRow[];
}

function toGeoJSON(response: OpenAQResponse): OpenAQGeoJSON {
  const results = response?.results ?? [];
  const features: GeoJSON.Feature<GeoJSON.Point, { pm25: number; locationId?: string; datetime?: string }>[] = [];

  for (const row of results) {
    const lat = row.coordinates?.latitude;
    const lon = row.coordinates?.longitude;
    if (lat == null || lon == null) continue;

    let pm25: number | undefined;
    if (row.measurements?.length) {
      const pm = row.measurements.find(
        (m) => m.parameter === "pm25" || (m as { parameterId?: number }).parameterId === 2
      );
      pm25 = pm?.value ?? (row as { value?: number }).value;
    } else {
      pm25 = (row as { value?: number }).value;
    }
    if (pm25 == null || typeof pm25 !== "number") continue;

    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [lon, lat],
      },
      properties: {
        pm25: Number(pm25),
        ...(row.locationId != null && { locationId: String(row.locationId) }),
        ...(row.datetime != null && { datetime: String(row.datetime) }),
      },
    });
  }

  return { type: "FeatureCollection", features };
}

export interface UseOpenAQResult {
  data: OpenAQGeoJSON | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useOpenAQ(): UseOpenAQResult {
  const [data, setData] = useState<OpenAQGeoJSON | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(OPENAQ_LATEST_URL, { mode: "cors" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: OpenAQResponse = await res.json();
      setData(toGeoJSON(json));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, refresh };
}
