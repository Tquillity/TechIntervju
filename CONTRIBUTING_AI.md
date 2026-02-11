# AI Contribution Guide (5-star Tier 2026)

Welcome, Agent. You are contributing to a high-performance geospatial dashboard. Follow these architectural patterns to maintain quality.

## 1. Geospatial Data Best Practices
- **Auto-Fit BBox:** Every new dataset added must include a "Fly-to" logic using `padBBox`.
- **Mock Fallback:** External APIs (USGS, OpenAQ, Copernicus) can be flaky. Every fetch hook must include a `generateMockGeoJSON` fallback and trigger the `isMocked` banner.
- **Worker Safety:** MapLibre 5+ uses heavy WebWorkers. Ensure you don't block the main thread with heavy GeoJSON processing; do it in the `useEffect` or via a separate Worker.

## 2. Tailwind 4 & Next.js 16 Standards
- **@theme over tailwind.config:** Do not look for a `tailwind.config.js`. We use the CSS-first approach in `app/globals.css`.
- **Container Queries:** Use `@container` on the dashboard wrapper and `@sm`, `@md` on sidebars for true responsive panels.
- **Partial Pre-Rendering (PPR):** The map container is client-side, but the sidebar data should be fetched via React Server Components where possible.

## 3. Map Intelligence
- **Cinematic Tour:** When adding a new feature, update `startCinematicTour` in `map-viewport.tsx` to include a stop that highlights it.
- **Cross-Fade logic:** All base-layer transitions must use `requestAnimationFrame` for a smooth 600ms ease-in-out opacity transition.

## 4. Troubleshooting for Agents
- **AJAX Error (0):** Usually means a missing `.json` on a TileJSON endpoint or a CORS block. Check `OpenFreeMap` URLs specifically.
- **Flickering layers:** Do not remove/add layers to update data. Use `source.setData()` or `source.setTiles()` to keep the WebGPU buffer intact.