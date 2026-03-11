import { SiteNav, SiteFooter } from "@/components/site-nav";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-surface text-white">
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
