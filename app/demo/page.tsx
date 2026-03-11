"use client";

import { useRouter } from "next/navigation";
import { MapDashboard } from "@/components/map/map-dashboard";
import { MockWebpage } from "@/components/mock-webpage";

export default function DemoPage() {
  const router = useRouter();

  return (
    <MockWebpage>
      <MapDashboard
        embeddedMode
        onEmbeddedModeToggle={() => router.push("/")}
      />
    </MockWebpage>
  );
}
