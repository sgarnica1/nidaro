"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const isTemplateDetailPage = pathname.startsWith("/plantillas/") && pathname !== "/plantillas" && !pathname.includes("/agregar-gasto");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Suppress non-critical Radix UI draggable error
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Suppress the releasePointerCapture error from Radix UI draggable
      if (
        event.error?.message?.includes("releasePointerCapture") ||
        event.error?.message?.includes("Failed to execute 'releasePointerCapture'") ||
        event.message?.includes("releasePointerCapture")
      ) {
        event.preventDefault();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Suppress the releasePointerCapture error from Radix UI draggable
      if (
        event.reason?.message?.includes("releasePointerCapture") ||
        event.reason?.message?.includes("Failed to execute 'releasePointerCapture'")
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && mounted) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname, mounted]);

  if (isTemplateDetailPage) {
    return <>{children}</>;
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 pb-20 md:pb-0">
          <div className="max-w-5xl mx-auto px-5 py-6">
            {children}
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 pb-20 md:pb-0 overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-5 py-6">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="overflow-x-hidden"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
