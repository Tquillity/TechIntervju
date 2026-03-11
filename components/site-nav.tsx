"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";

const navLinks = [
  { href: "/demo", label: "Demo" },
  { href: "/platform", label: "Platform" },
  { href: "/data-sources", label: "Data Sources" },
  { href: "/api-docs", label: "API" },
  { href: "/about", label: "About" },
];

interface SiteNavProps {
  /** Primary CTA button config. Defaults to "Open Map" → "/" */
  cta?: { label: string; href: string };
}

export function SiteNav({ cta = { label: "Open Map", href: "/" } }: SiteNavProps) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <Globe className="size-7 text-accent group-hover:rotate-12 transition-transform" />
          <span className="text-lg font-bold tracking-tight">
            Restart<span className="text-accent">.Earth</span>
            <span className="text-xs font-normal text-muted ml-2">
              Teknisk Intervju
            </span>
          </span>
        </Link>

        {/* Links */}
        <div className="hidden sm:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? "text-white bg-white/10 font-medium"
                    : "text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <Link
          href={cta.href}
          className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-muted text-white text-sm font-medium transition-colors"
        >
          {cta.label}
        </Link>
      </div>
    </nav>
  );
}

/** Shared footer used across all site pages */
export function SiteFooter() {
  const pathname = usePathname();

  return (
    <footer className="border-t border-border py-10 text-center text-sm text-muted">
      <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-accent" />
          <span>Restart.Earth Teknisk Intervju</span>
          <span className="text-border">|</span>
          <span>2026</span>
        </div>
        <div className="flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs transition-colors ${
                  isActive
                    ? "text-white font-medium"
                    : "hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="text-xs text-muted/60">
          Built with Next.js 16, MapLibre GL JS v5, Tailwind CSS 4
        </div>
      </div>
    </footer>
  );
}
