# Project Context: Map Dashboard 2026

## 🛠 Tech Stack (2026 Stable Standard)
- **Framework:** Next.js 16 (App Router, Turbopack, React 19/20)
- **Styling:** Tailwind CSS 4 (CSS-first configuration, Oxide engine)
- **Mapping:** MapLibre GL JS v5.x (WebGPU-first, 3D Terrain, 3D Buildings)
- **Icons:** Lucide React
- **Types:** Strict TypeScript 5.7+

## 🚫 CRITICAL RULES (Do Not Break)
1. **NO URL REDACTION:** Never replace a URL, Tile endpoint, or API string with `[URL_REDACTED]`. All URLs in this project are public/free and must be written out in full to prevent breaking the map.
2. **WEBGPU FIRST:** When initializing MapLibre, always prefer WebGPU context attributes for 2026 hardware acceleration.
3. **LAYER DEPTH:** Always place 4D/Atmospheric overlays (like CO2) above satellite base layers but BELOW vector labels and 3D buildings.
4. **NO RE-RENDERS:** Prevent map re-initialization. Use `useRef` for the map instance and `useEffect` with `setTiles` or `setPaintProperty` for updates.

## 📁 Folder Structure
- `app/`: Next.js App Router (Server Components by default).
- `components/map/`: All client-side geospatial components.
- `hooks/`: GeoJSON fetchers and real-time API integrations.
- `public/`: Static assets.

## 🚀 Common Commands
- **Dev:** `npm run dev` (uses Turbopack).
- **Build:** `npm run build`.
- **Clean:** `rm -rf .next` (if map cache gets corrupted).