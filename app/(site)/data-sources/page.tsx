import {
  Cloud,
  Leaf,
  Droplets,
  Haze,
  Factory,
  Moon,
  Flame,
  Wind,
  Activity,
  TreeDeciduous,
  Sparkles,
  Globe,
  Satellite,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Sources | Restart.Earth",
  description:
    "All satellite, sensor, and open-data sources powering the geospatial dashboard.",
};

interface DataSource {
  icon: React.ReactNode;
  name: string;
  provider: string;
  type: "overlay" | "preset" | "base";
  description: string;
  url: string;
}

const sources: DataSource[] = [
  // --- Overlays ---
  {
    icon: <Cloud className="size-5 text-accent" />,
    name: "Ozone Total Column (OMPS)",
    provider: "NASA GIBS / Suomi-NPP",
    type: "overlay",
    description:
      "Daily global total ozone column measured by the Ozone Mapping and Profiler Suite on the Suomi-NPP satellite. Distributed as WMTS raster tiles via NASA\u2019s Global Imagery Browse Services.",
    url: "https://gibs.earthdata.nasa.gov",
  },
  {
    icon: <Leaf className="size-5 text-success" />,
    name: "Vegetation Index (NDVI)",
    provider: "NASA GIBS / MODIS",
    type: "overlay",
    description:
      "Normalized Difference Vegetation Index derived from MODIS reflectance bands. Values range from \u20131 (water/bare) to +1 (dense vegetation). Updated every 8\u201316 days.",
    url: "https://gibs.earthdata.nasa.gov",
  },
  {
    icon: <Droplets className="size-5 text-blue-400" />,
    name: "Precipitation Rate (IMERG)",
    provider: "NASA GPM / GIBS",
    type: "overlay",
    description:
      "Near-real-time global precipitation rate from the Integrated Multi-satellite Retrievals for GPM (IMERG). Combines microwave and infrared estimates for 0.1\u00b0 resolution.",
    url: "https://gibs.earthdata.nasa.gov",
  },
  {
    icon: <Haze className="size-5 text-amber-300" />,
    name: "Aerosol Optical Depth (MODIS)",
    provider: "NASA GIBS / MODIS",
    type: "overlay",
    description:
      "Aerosol Optical Depth at 550 nm from MODIS on Terra and Aqua. Measures the total extinction of sunlight by atmospheric particulates \u2014 dust, smoke, haze, and pollution.",
    url: "https://gibs.earthdata.nasa.gov",
  },
  {
    icon: <Factory className="size-5 text-rose-400" />,
    name: "Nitrogen Dioxide (TROPOMI)",
    provider: "ESA / Sentinel-5P GIBS",
    type: "overlay",
    description:
      "Tropospheric NO\u2082 column density from the TROPOspheric Monitoring Instrument on Sentinel-5P. Highlights emissions from traffic, power plants, and industrial facilities.",
    url: "https://gibs.earthdata.nasa.gov",
  },
  {
    icon: <Moon className="size-5 text-indigo-300" />,
    name: "Night Lights (VIIRS 2012)",
    provider: "NASA GIBS / VIIRS",
    type: "overlay",
    description:
      "Global nighttime lights composite from the Visible Infrared Imaging Radiometer Suite Day-Night Band. Captures artificial light sources to reveal urbanization and energy use patterns.",
    url: "https://gibs.earthdata.nasa.gov",
  },
  {
    icon: <Flame className="size-5 text-orange-400" />,
    name: "Active Thermal Anomaly (FIRMS)",
    provider: "NASA FIRMS",
    type: "overlay",
    description:
      "Near-real-time thermal hotspot and fire detections from MODIS and VIIRS instruments via NASA\u2019s Fire Information for Resource Management System.",
    url: "https://firms.modaps.eosdis.nasa.gov",
  },
  {
    icon: <Wind className="size-5 text-emerald-400" />,
    name: "Live Air Quality (OpenAQ)",
    provider: "OpenAQ",
    type: "overlay",
    description:
      "Real-time ground-level air quality measurements from thousands of monitoring stations worldwide. Parameters include PM2.5, PM10, O\u2083, NO\u2082, SO\u2082, and CO.",
    url: "https://openaq.org",
  },
  // --- Presets ---
  {
    icon: <Activity className="size-5 text-warning" />,
    name: "Global Real-time Earthquakes",
    provider: "USGS Earthquake Hazards",
    type: "preset",
    description:
      "Live GeoJSON feed of all earthquakes detected worldwide in the past hour, day, week, or month. Includes magnitude, depth, and felt reports.",
    url: "https://earthquake.usgs.gov",
  },
  {
    icon: <TreeDeciduous className="size-5 text-success" />,
    name: "Local City Trees",
    provider: "Open Data Portals",
    type: "preset",
    description:
      "Municipal tree inventories published as open data. Includes species, trunk diameter, canopy size, and planting year for urban forestry analysis.",
    url: "https://opendata.cityofnewyork.us",
  },
  {
    icon: <Sparkles className="size-5 text-accent" />,
    name: "Recent Satellite Anomalies",
    provider: "USGS / Satellite Platforms",
    type: "preset",
    description:
      "Recent satellite-detected surface anomalies \u2014 unusual thermal signatures, outgassing events, and land-cover changes flagged by automated processing pipelines.",
    url: "https://earthquake.usgs.gov",
  },
  {
    icon: <Globe className="size-5 text-danger" />,
    name: "Tectonic Plate Boundaries",
    provider: "Hugo Ahlenius / GitHub",
    type: "preset",
    description:
      "GeoJSON line geometries for the Earth\u2019s major tectonic plate boundaries \u2014 divergent (mid-ocean ridges), convergent (subduction zones), and transform faults.",
    url: "https://github.com/fraxen/tectonicplates",
  },
  {
    icon: <Globe className="size-5 text-blue-400" />,
    name: "World Countries",
    provider: "Natural Earth / GitHub",
    type: "preset",
    description:
      "Country polygon geometries with ISO 3166-1 codes, names, and population estimates. Derived from Natural Earth 1:110m cultural vectors.",
    url: "https://www.naturalearthdata.com",
  },
  // --- Base layers ---
  {
    icon: <Globe className="size-5 text-white" />,
    name: "Vector Base Map",
    provider: "OpenMapTiles / Stadia Maps",
    type: "base",
    description:
      "OpenStreetMap-derived vector tiles with roads, water bodies, land use, labels, and 3D building extrusions. Styled with a custom dark theme.",
    url: "https://openmaptiles.org",
  },
  {
    icon: <Satellite className="size-5 text-accent" />,
    name: "Sentinel-2 Cloudless",
    provider: "EOX / ESA",
    type: "base",
    description:
      "True-color mosaic from Copernicus Sentinel-2 imagery with clouds algorithmically removed. Updated annually at 10 m resolution.",
    url: "https://s2maps.eu",
  },
];

const typeLabels: Record<DataSource["type"], string> = {
  overlay: "Satellite / Sensor Overlay",
  preset: "GeoJSON Preset",
  base: "Base Map Layer",
};

const typeBadgeClass: Record<DataSource["type"], string> = {
  overlay: "bg-accent/15 text-accent border-accent/30",
  preset: "bg-success/15 text-success border-success/30",
  base: "bg-muted/15 text-muted border-muted/30",
};

export default function DataSourcesPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      {/* Hero */}
      <div className="text-center mb-20">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          <span className="bg-linear-to-r from-accent via-white to-accent bg-clip-text text-transparent">
            Data Sources
          </span>
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed">
          Every overlay, preset, and base layer in the dashboard is powered by
          open, freely accessible data from space agencies and community
          platforms.
        </p>
      </div>

      {/* Sources list */}
      <div className="space-y-5">
        {sources.map((src) => (
          <div
            key={src.name}
            className="glass-panel p-6 flex flex-col sm:flex-row items-start gap-5 hover:border-accent/30 transition-colors"
          >
            <div className="shrink-0 mt-0.5">{src.icon}</div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-semibold text-white">{src.name}</h3>
                <span
                  className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border ${typeBadgeClass[src.type]}`}
                >
                  {typeLabels[src.type]}
                </span>
              </div>
              <p className="text-xs text-muted/70">{src.provider}</p>
              <p className="text-sm text-muted leading-relaxed">
                {src.description}
              </p>
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs text-accent hover:underline"
              >
                {src.url}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
