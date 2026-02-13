"use client";

import { useState } from "react";
import { MapDashboard } from "@/components/map/map-dashboard";
import { MockWebpage } from "@/components/mock-webpage";

export default function Page() {
  const [embeddedMode, setEmbeddedMode] = useState(false);

  if (embeddedMode) {
    return (
      <MockWebpage>
        <MapDashboard
          embeddedMode
          onEmbeddedModeToggle={() => setEmbeddedMode(false)}
        />
      </MockWebpage>
    );
  }

  return (
    <main className="h-screen w-full overflow-hidden">
      <MapDashboard
        onEmbeddedModeToggle={() => setEmbeddedMode(true)}
      />
    </main>
  );
}
