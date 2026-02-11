# Map Dashboard — Show & Tell 2026

A production-ready geospatial Map Dashboard built with **Next.js 16**, **Tailwind CSS 4**, and **MapLibre GL JS 5.x**. Designed for speed, 3D fluid motion, and automated data ingestion.

## Tech Stack

- **Framework:** Next.js 16 (App Router, React Server Components)
- **Styling:** Tailwind CSS 4 (CSS-first `@theme` configuration)
- **Mapping:** MapLibre GL JS v5.x (WebGPU preference when available, antialias, terrain, 3D buildings)
- **Icons:** Lucide React
- **Type safety:** TypeScript 5.7+ (strict mode)

## Features

- **Map engine:** MapLibre with antialias, 3D terrain, 3D buildings, and cinematic fly-to when data loads
- **Base layers:** Stadia Alidade Smooth Dark (vector) and EOX Sentinel-2 Cloudless (raster) with seamless cross-fade
- **Magic Import sidebar:** Presets for Global Earthquakes, City Trees, and Satellite Anomalies; custom GeoJSON URL; auto-fit bbox
- **Mock data fallback:** If the real data URL is blocked (e.g. CORS), the app uses generated mock GeoJSON and shows a clear **"THIS DATA IS MOCKED"** banner
- **Data Inspector:** Click a point on the map to see feature properties in a glassmorphism panel
- **2026 UI:** Tailwind 4 theme, container queries, glassmorphism panels

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use the **Magic Import** presets or paste a GeoJSON URL to load data; the map will fly to the data bounds automatically.

## Project Structure

- `app/layout.tsx` — Root layout and Tailwind 4 global styles
- `app/page.tsx` — Main page (Server Component) with map wrapper
- `components/map/map-viewport.tsx` — WebGPU-accelerated map (Client Component)
- `components/map/controls.tsx` — Layer toggles and Magic Import presets
- `components/map/data-inspector.tsx` — Feature properties panel
- `components/map/map-dashboard.tsx` — Dashboard composition (client)
- `hooks/use-geodata.ts` — GeoJSON fetch, validation, bbox, mock fallback

## Data Sources

- **Earthquakes:** USGS real-time feed (CORS permitting)
- **City Trees / Satellite Anomalies:** Preset URLs may be CORS-restricted; mock data is used when fetch fails, with an on-screen banner

## License

MIT
