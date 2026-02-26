import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-6">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}
