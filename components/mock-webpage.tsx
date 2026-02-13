"use client";

import Link from "next/link";
import { Globe, Layers, BarChart3, Zap, Shield, Code } from "lucide-react";

interface MockWebpageProps {
  children: React.ReactNode;
}

export function MockWebpage({ children }: MockWebpageProps) {
  return (
    <div className="min-h-screen bg-surface text-white">
      {/* Nav bar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="size-7 text-accent" />
            <span className="text-lg font-bold tracking-tight">
              Restart<span className="text-accent">.Earth</span>
              <span className="text-xs font-normal text-muted ml-2">Teknisk Intervju</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-8 text-sm text-muted">
            <Link href="/platform" className="hover:text-white transition-colors">Platform</Link>
            <Link href="/data-sources" className="hover:text-white transition-colors">Data Sources</Link>
            <Link href="/api-docs" className="hover:text-white transition-colors">API</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/about"
              className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-muted text-white text-sm font-medium transition-colors"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-6">
          <Zap className="size-3.5" />
          Teknisk Intervju Demo
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-4">
          Geospatial Intelligence
          <br />
          <span className="bg-linear-to-r from-accent via-white to-accent bg-clip-text text-transparent">
            Platform
          </span>
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed">
          Real-time NASA satellite overlays, live sensor data, and 3D terrain visualization
          powered by WebGPU and MapLibre GL JS v5.
        </p>
      </section>

      {/* Embedded map */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-xl border border-border overflow-hidden shadow-[0_0_60px_oklch(0.72_0.18_250/0.15)] aspect-video relative">
          {children}
        </div>
        <p className="text-center text-xs text-muted mt-3">
          Interactive map — use the controls on the left to explore overlays and datasets.
        </p>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <h2 className="text-2xl font-bold text-center mb-10">Core Capabilities</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Layers className="size-6 text-accent" />}
            title="Multi-Layer Overlays"
            description="Stack NASA GIBS atmospheric, vegetation, and precipitation rasters with live sensor data in a single view."
          />
          <FeatureCard
            icon={<BarChart3 className="size-6 text-success" />}
            title="Real-Time Ingestion"
            description="Automated GeoJSON pipelines pull USGS, OpenAQ, and FIRMS data with zero manual intervention."
          />
          <FeatureCard
            icon={<Shield className="size-6 text-warning" />}
            title="WebGPU Rendering"
            description="Hardware-accelerated 3D terrain, buildings, and cinematic camera tours at 60 fps on modern browsers."
          />
          <FeatureCard
            icon={<Code className="size-6 text-violet-400" />}
            title="TypeScript-First"
            description="Strict TypeScript 5.7+ with Next.js 16 App Router and Tailwind CSS 4 Oxide engine."
          />
          <FeatureCard
            icon={<Globe className="size-6 text-blue-400" />}
            title="Open Data Standards"
            description="Native GeoJSON, WMTS, and OGC support. Import any public dataset by URL."
          />
          <FeatureCard
            icon={<Zap className="size-6 text-amber-400" />}
            title="Performance HUD"
            description="Live coordinates, compass bearing, pitch, zoom, and layer count updated every frame."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 text-center text-sm text-muted">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-accent" />
            <span>Restart.Earth Teknisk Intervju</span>
            <span className="text-border">|</span>
            <span>2026</span>
          </div>
          <div className="text-xs text-muted/60">
            Built with Next.js 16, MapLibre GL JS v5, Tailwind CSS 4, and NASA GIBS
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="glass-panel p-6 space-y-3 hover:border-accent/30 transition-colors">
      {icon}
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </div>
  );
}
