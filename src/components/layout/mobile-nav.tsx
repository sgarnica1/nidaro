"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Receipt, BookTemplate, Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/gastos", label: "Gastos", icon: Receipt },
  { href: "/plantillas", label: "Plantillas", icon: BookTemplate },
  { href: "/ingresos", label: "Ingresos", icon: Wallet },
  { href: "/perfil", label: "Perfil", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isWizardOpen = pathname === "/presupuestos/nuevo";
  const isTemplateDetailPage = pathname.startsWith("/plantillas/") && pathname !== "/plantillas";

  useEffect(() => {
    const checkSheetOpen = () => {
      const sheet = document.querySelector('[data-slot="sheet"][data-state="open"]');
      setIsSheetOpen(!!sheet);
    };

    checkSheetOpen();
    const observer = new MutationObserver(checkSheetOpen);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "fixed bottom-6 left-4 right-4 z-50 rounded-2xl border border-border/30 bg-white/70 backdrop-blur-3xl shadow-xl md:hidden",
        (isSheetOpen || isWizardOpen || isTemplateDetailPage) && "hidden"
      )}
    >
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition-all duration-200",
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Icon className={cn("h-5 w-5 transition-colors duration-200", isActive && "text-primary")} />
              </motion.div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
