"use client";

import { Droplets, Leaf, Cloud, Haze, Factory, Moon } from "lucide-react";

interface MapLegendProps {
  co2Enabled: boolean;
  ndviEnabled: boolean;
  soilEnabled: boolean;
  aodEnabled: boolean;
  no2Enabled: boolean;
  nightlightsEnabled?: boolean;
  className?: string;
}

export function MapLegend({ co2Enabled, ndviEnabled, soilEnabled, aodEnabled, no2Enabled, nightlightsEnabled = false, className = "" }: MapLegendProps) {
  if (!co2Enabled && !ndviEnabled && !soilEnabled && !aodEnabled && !no2Enabled && !nightlightsEnabled) return null;

  return (
    <div
      className={`glass-panel p-3 space-y-4 w-56 animate-in fade-in slide-in-from-left-2 duration-500 ${className}`}
    >
      {co2Enabled && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-medium text-muted">
            <Cloud className="size-3.5 text-accent" /> Ozone Total Column (DU)
          </div>
          <div className="h-2 w-full rounded-full bg-linear-to-r from-[#0000ff] via-[#00ff00] to-[#ff0000] border border-white/10" />
          <div className="flex justify-between text-[10px] text-muted tabular-nums px-0.5">
            <span>100</span>
            <span>300</span>
            <span>500</span>
          </div>
        </div>
      )}

      {ndviEnabled && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-medium text-muted">
            <Leaf className="size-3.5 text-success" /> Vegetation Index (NDVI)
          </div>
          <div className="h-2 w-full rounded-full bg-linear-to-r from-[#8b4513] via-[#f5deb3] to-[#006400] border border-white/10" />
          <div className="flex justify-between text-[10px] text-muted px-0.5">
            <span>Barren</span>
            <span>Sparse</span>
            <span>Dense</span>
          </div>
        </div>
      )}

      {soilEnabled && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-medium text-muted">
            <Droplets className="size-3.5 text-blue-400" /> Precipitation (mm/hr)
          </div>
          {/* Match NASA GIBS IMERG: light/cyan (low) → green → yellow → red (high) */}
          <div
            className="h-2 w-full rounded-full border border-white/10"
            style={{
              background: "linear-gradient(to right, #e0f7fa 0%, #22c55e 33%, #eab308 66%, #dc2626 100%)",
            }}
          />
          <div className="flex justify-between text-[10px] text-muted tabular-nums px-0.5">
            <span>0.1</span>
            <span>10</span>
            <span>50+</span>
          </div>
        </div>
      )}

      {aodEnabled && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-medium text-muted">
            <Haze className="size-3.5 text-orange-400" /> Aerosol Optical Depth
          </div>
          {/* MODIS AOD: transparent (clean) → yellow → orange → dark red (heavy aerosol) */}
          <div
            className="h-2 w-full rounded-full border border-white/10"
            style={{
              background: "linear-gradient(to right, #fefce8 0%, #facc15 33%, #f97316 66%, #991b1b 100%)",
            }}
          />
          <div className="flex justify-between text-[10px] text-muted tabular-nums px-0.5">
            <span>0.0</span>
            <span>0.5</span>
            <span>1.0+</span>
          </div>
        </div>
      )}

      {no2Enabled && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-medium text-muted">
            <Factory className="size-3.5 text-violet-400" /> NO&#8322; Tropospheric (mol/cm&#xB2;)
          </div>
          {/* TROPOMI NO2: light (low) → yellow → orange → dark red/violet (high pollution) */}
          <div
            className="h-2 w-full rounded-full border border-white/10"
            style={{
              background: "linear-gradient(to right, #eff6ff 0%, #fde68a 30%, #f97316 60%, #7c3aed 100%)",
            }}
          />
          <div className="flex justify-between text-[10px] text-muted tabular-nums px-0.5">
            <span>Low</span>
            <span>Moderate</span>
            <span>High</span>
          </div>
        </div>
      )}

      {nightlightsEnabled && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-medium text-muted">
            <Moon className="size-3.5 text-amber-300" /> Night Lights (VIIRS 2012)
          </div>
          <div
            className="h-2 w-full rounded-full border border-white/10"
            style={{
              background: "linear-gradient(to right, #0a0a0a 0%, #fbbf24 50%, #ffffff 100%)",
            }}
          />
          <div className="flex justify-between text-[10px] text-muted px-0.5">
            <span>Dark</span>
            <span>Urban</span>
            <span>Bright</span>
          </div>
        </div>
      )}
    </div>
  );
}
