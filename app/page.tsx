"use client";

import { useRouter } from "next/navigation";
import { MapDashboard } from "@/components/map/map-dashboard";

export default function Page() {
  const router = useRouter();

  return (
    <main className="h-screen w-full overflow-hidden">
      <MapDashboard
        onEmbeddedModeToggle={() => router.push("/demo")}
      />
    </main>
  );
}
