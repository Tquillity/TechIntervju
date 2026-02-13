import { Code, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Reference | Restart.Earth",
  description:
    "External APIs and endpoints consumed by the geospatial dashboard.",
};

interface Endpoint {
  method: string;
  url: string;
  description: string;
  params?: string;
  response: string;
}

const endpoints: Endpoint[] = [
  {
    method: "GET",
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/wmts.cgi",
    description:
      "NASA GIBS WMTS endpoint. Returns 256\u00d7256 raster tiles for all satellite imagery layers (Ozone, NDVI, IMERG, MODIS AOD, TROPOMI NO\u2082, VIIRS Night Lights).",
    params:
      "layer, tilematrixset, Service=WMTS, Request=GetTile, Format=image/png, TIME=YYYY-MM-DD",
    response: "image/png tile (256\u00d7256)",
  },
  {
    method: "GET",
    url: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/{period}.geojson",
    description:
      "USGS Earthquake Hazards GeoJSON feed. Returns all earthquakes for the specified period. Used by both the Earthquakes preset and the Fires overlay (latest hour).",
    params: "period = all_hour | all_day | all_week | all_month",
    response: "GeoJSON FeatureCollection (Point geometries with mag, depth, place, time)",
  },
  {
    method: "GET",
    url: "https://api.openaq.org/v3/locations",
    description:
      "OpenAQ v3 locations endpoint. Returns air quality monitoring stations with latest measurements in the current map viewport.",
    params: "bbox, limit, page, sort, parameter_id (optional), radius (optional)",
    response: "JSON with results[] containing coordinates, parameters[], and latest values",
  },
  {
    method: "GET",
    url: "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    description:
      "Tectonic plate boundary geometries from the Hugo Ahlenius GitHub dataset, derived from Peter Bird\u2019s 2002 model.",
    response: "GeoJSON FeatureCollection (LineString geometries)",
  },
  {
    method: "GET",
    url: "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson",
    description:
      "World country polygon boundaries from the Natural Earth 1:110m cultural vectors, hosted on GitHub.",
    response: "GeoJSON FeatureCollection (Polygon/MultiPolygon with ISO codes and names)",
  },
  {
    method: "GET",
    url: "https://data.cityofnewyork.us/resource/uvpi-gqnh.geojson?$limit=8000",
    description:
      "NYC Open Data tree census, served as GeoJSON via the Socrata API. Returns point features with species, trunk diameter, status, and address.",
    params: "$limit, $offset, $where (SoQL filter)",
    response: "GeoJSON FeatureCollection (Point geometries with tree attributes)",
  },
];

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-success/15 text-success border-success/30",
    POST: "bg-accent/15 text-accent border-accent/30",
    PUT: "bg-warning/15 text-warning border-warning/30",
    DELETE: "bg-danger/15 text-danger border-danger/30",
  };
  return (
    <span
      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${colors[method] ?? "bg-muted/15 text-muted border-muted/30"}`}
    >
      {method}
    </span>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      {/* Hero */}
      <div className="text-center mb-20">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          <span className="bg-linear-to-r from-accent via-white to-accent bg-clip-text text-transparent">
            API Reference
          </span>
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed">
          The dashboard consumes these open, freely accessible APIs. No
          authentication keys are required &mdash; all endpoints are public.
        </p>
      </div>

      {/* Intro note */}
      <div className="glass-panel p-6 mb-10 flex items-start gap-4">
        <Code className="size-6 text-accent shrink-0 mt-0.5" />
        <div className="text-sm text-muted leading-relaxed">
          <p>
            <strong className="text-white">Custom URL import</strong> &mdash;
            In addition to the pre-configured endpoints below, you can paste
            any public GeoJSON URL into the Magic Import panel to load custom
            data onto the map. The dashboard automatically detects geometry
            types (Point, LineString, Polygon) and applies appropriate styling.
          </p>
        </div>
      </div>

      {/* Endpoints */}
      <div className="space-y-6">
        {endpoints.map((ep) => (
          <div
            key={ep.url}
            className="glass-panel p-6 space-y-4 hover:border-accent/30 transition-colors"
          >
            <div className="flex flex-wrap items-center gap-3">
              <MethodBadge method={ep.method} />
              <code className="text-sm text-accent break-all">{ep.url}</code>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              {ep.description}
            </p>
            {ep.params && (
              <div>
                <span className="text-xs text-muted/70 uppercase tracking-wider">
                  Parameters
                </span>
                <p className="text-sm text-white/80 font-mono mt-1">
                  {ep.params}
                </p>
              </div>
            )}
            <div>
              <span className="text-xs text-muted/70 uppercase tracking-wider">
                Response
              </span>
              <p className="text-sm text-white/80 font-mono mt-1">
                {ep.response}
              </p>
            </div>
            <a
              href={ep.url.replace("{period}", "all_hour")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
            >
              Open endpoint
              <ExternalLink className="size-3" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
