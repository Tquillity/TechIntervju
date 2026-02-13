import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Map Dashboard | Show & Tell 2026",
  description: "Cutting-edge geospatial map dashboard with WebGPU, 3D terrain, and automated data ingestion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full min-h-screen">
        {children}
      </body>
    </html>
  );
}
