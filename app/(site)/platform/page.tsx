import {
  Globe,
  Layers,
  Cpu,
  MonitorSmartphone,
  Gauge,
  Workflow,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform | Restart.Earth",
  description:
    "Explore the geospatial intelligence platform — WebGPU rendering, real-time overlays, and cinematic 3D visualization.",
};

const capabilities = [
  {
    icon: <Cpu className="size-7 text-accent" />,
    title: "WebGPU-First Rendering",
    description:
      "MapLibre GL JS v5 leverages the WebGPU graphics API for hardware-accelerated vector tiles, raster overlays, and 3D terrain — delivering 60 fps even with multiple atmospheric layers active simultaneously.",
  },
  {
    icon: <Layers className="size-7 text-success" />,
    title: "Multi-Layer Compositing",
    description:
      "Stack NASA GIBS ozone, NDVI vegetation, IMERG precipitation, MODIS aerosols, TROPOMI NO\u2082, and VIIRS nightlights on a single canvas. Each layer is date-driven via a shared timeline slider.",
  },
  {
    icon: <Globe className="size-7 text-blue-400" />,
    title: "Live Sensor Ingestion",
    description:
      "Real-time GeoJSON pipelines pull USGS earthquake feeds, NASA FIRMS thermal anomalies, and OpenAQ air-quality sensor readings with automatic refresh and graceful fallback to cached data.",
  },
  {
    icon: <MonitorSmartphone className="size-7 text-violet-400" />,
    title: "Responsive Embedded Mode",
    description:
      "Toggle between a full-screen map dashboard and a responsive embedded widget that fits naturally inside any webpage. Aspect-ratio-aware scaling ensures the map looks great at every breakpoint.",
  },
  {
    icon: <Gauge className="size-7 text-warning" />,
    title: "Performance HUD",
    description:
      "An always-on heads-up display shows live coordinates, compass bearing, pitch, zoom level, and total layer count — updated every animation frame for precise monitoring during presentations.",
  },
  {
    icon: <Workflow className="size-7 text-danger" />,
    title: "Cinematic Camera Tours",
    description:
      "A built-in cinematic tour flies the camera through curated global landmarks with smooth easing, tilt transitions, and auto-rotation — perfect for stakeholder demos and conference talks.",
  },
];

export default function PlatformPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      {/* Hero */}
      <div className="text-center mb-20">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          The{" "}
          <span className="bg-linear-to-r from-accent via-white to-accent bg-clip-text text-transparent">
            Platform
          </span>
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed">
          A next-generation geospatial intelligence dashboard built on WebGPU,
          real-time satellite data, and modern web standards.
        </p>
      </div>

      {/* Architecture overview */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold mb-4">Architecture</h2>
        <div className="glass-panel p-8 space-y-4 text-sm leading-relaxed text-muted">
          <p>
            The platform is a <strong className="text-white">Next.js 16 App Router</strong> application
            using React 19 Server Components for the shell and client-side components for all
            interactive map logic. Turbopack provides sub-second HMR during development.
          </p>
          <p>
            Styling is handled entirely by <strong className="text-white">Tailwind CSS 4</strong> with
            CSS-first configuration and the Oxide engine. A custom dark-space theme
            palette is defined through <code className="text-accent">@theme</code> tokens, giving
            every surface a cohesive deep-space aesthetic.
          </p>
          <p>
            The mapping layer is <strong className="text-white">MapLibre GL JS v5</strong> initialized
            with WebGPU context attributes. The map instance is held in a React ref to prevent
            re-initialization. All overlay updates go through{" "}
            <code className="text-accent">setTiles</code> /{" "}
            <code className="text-accent">setPaintProperty</code> for zero-rerender tile swaps.
          </p>
        </div>
      </section>

      {/* Capabilities grid */}
      <section>
        <h2 className="text-2xl font-bold mb-8">Core Capabilities</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap) => (
            <div
              key={cap.title}
              className="glass-panel p-6 space-y-3 hover:border-accent/30 transition-colors"
            >
              {cap.icon}
              <h3 className="font-semibold text-white">{cap.title}</h3>
              <p className="text-sm text-muted leading-relaxed">
                {cap.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
