import { Globe, Code, Layers, Cpu, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Restart.Earth",
  description:
    "About the Restart.Earth technical interview map dashboard project.",
};

const techStack = [
  {
    icon: <Code className="size-5 text-accent" />,
    name: "Next.js 16",
    detail: "App Router, React 19 Server Components, Turbopack",
  },
  {
    icon: <Layers className="size-5 text-success" />,
    name: "Tailwind CSS 4",
    detail: "CSS-first configuration, Oxide engine, custom @theme tokens",
  },
  {
    icon: <Globe className="size-5 text-blue-400" />,
    name: "MapLibre GL JS v5",
    detail: "WebGPU-first, 3D terrain, 3D buildings, WMTS raster tiles",
  },
  {
    icon: <Cpu className="size-5 text-violet-400" />,
    name: "TypeScript 5.7+",
    detail: "Strict mode, full type coverage across all components and hooks",
  },
];

const credits = [
  {
    name: "NASA GIBS",
    url: "https://gibs.earthdata.nasa.gov",
    description: "Satellite imagery tile services (OMPS, MODIS, IMERG, TROPOMI, VIIRS)",
  },
  {
    name: "USGS Earthquake Hazards",
    url: "https://earthquake.usgs.gov",
    description: "Real-time global earthquake GeoJSON feeds",
  },
  {
    name: "ESA Copernicus",
    url: "https://s2maps.eu",
    description: "Sentinel-2 cloudless satellite base map",
  },
  {
    name: "OpenAQ",
    url: "https://openaq.org",
    description: "Global open air quality monitoring data",
  },
  {
    name: "OpenMapTiles",
    url: "https://openmaptiles.org",
    description: "OpenStreetMap-based vector tile schema",
  },
  {
    name: "Natural Earth",
    url: "https://www.naturalearthdata.com",
    description: "Public domain map dataset for country boundaries",
  },
  {
    name: "Lucide Icons",
    url: "https://lucide.dev",
    description: "Beautiful open-source SVG icon library",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      {/* Hero */}
      <div className="text-center mb-20">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          <span className="bg-linear-to-r from-accent via-white to-accent bg-clip-text text-transparent">
            About
          </span>
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed">
          This project was created as part of the{" "}
          <strong className="text-white">Restart.Earth Teknisk Intervju</strong>{" "}
          to demonstrate modern geospatial web development capabilities.
        </p>
      </div>

      {/* Project overview */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Project Overview</h2>
        <div className="glass-panel p-8 space-y-4 text-sm text-muted leading-relaxed">
          <p>
            The <strong className="text-white">Map Dashboard 2026</strong> is a
            cutting-edge geospatial intelligence platform that combines
            real-time satellite imagery, live sensor feeds, and interactive 3D
            visualization into a single cohesive dashboard.
          </p>
          <p>
            It showcases the ability to integrate multiple heterogeneous data
            sources &mdash; from NASA satellite raster tiles to USGS earthquake
            GeoJSON feeds to OpenAQ air quality sensors &mdash; into a
            performant, hardware-accelerated map interface with smooth
            cinematic camera transitions.
          </p>
          <p>
            The project was built from scratch with production-quality code
            patterns: strict TypeScript, zero-rerender map updates via refs,
            graceful error handling with mock fallbacks, and a responsive
            embedded mode for integration into existing web pages.
          </p>
        </div>
      </section>

      {/* Tech stack */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Tech Stack</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="glass-panel p-5 flex items-start gap-4 hover:border-accent/30 transition-colors"
            >
              <div className="shrink-0 mt-0.5">{tech.icon}</div>
              <div>
                <h3 className="font-semibold text-white">{tech.name}</h3>
                <p className="text-sm text-muted mt-1">{tech.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Credits */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Credits & Data Sources</h2>
        <p className="text-sm text-muted mb-6 leading-relaxed">
          This project would not be possible without the following open-data
          providers and open-source projects:
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {credits.map((credit) => (
            <a
              key={credit.name}
              href={credit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-panel p-5 space-y-2 hover:border-accent/30 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white group-hover:text-accent transition-colors">
                  {credit.name}
                </h3>
                <ExternalLink className="size-3 text-muted group-hover:text-accent transition-colors" />
              </div>
              <p className="text-xs text-muted leading-relaxed">
                {credit.description}
              </p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
