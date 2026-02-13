import Link from "next/link";
import { Globe } from "lucide-react";

const navLinks = [
  { href: "/platform", label: "Platform" },
  { href: "/data-sources", label: "Data Sources" },
  { href: "/api-docs", label: "API" },
  { href: "/about", label: "About" },
];

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-surface text-white">
      {/* Shared nav bar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Globe className="size-7 text-accent" />
            <span className="text-lg font-bold tracking-tight">
              Restart<span className="text-accent">.Earth</span>
              <span className="text-xs font-normal text-muted ml-2">
                Teknisk Intervju
              </span>
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-8 text-sm text-muted">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-muted text-white text-sm font-medium transition-colors"
          >
            Open Map
          </Link>
        </div>
      </nav>

      {/* Page content */}
      <main>{children}</main>

      {/* Shared footer */}
      <footer className="border-t border-border py-10 text-center text-sm text-muted">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-accent" />
            <span>Restart.Earth Teknisk Intervju</span>
            <span className="text-border">|</span>
            <span>2026</span>
          </div>
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-white transition-colors text-xs"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="text-xs text-muted/60">
            Built with Next.js 16, MapLibre GL JS v5, Tailwind CSS 4
          </div>
        </div>
      </footer>
    </div>
  );
}
