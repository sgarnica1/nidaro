"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, BookTemplate, Wallet, User, Settings } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import type { NavItem } from "@/types";

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/gastos", label: "Gastos", icon: Receipt },
  { href: "/plantillas", label: "Plantillas", icon: BookTemplate },
  { href: "/ingresos", label: "Ingresos", icon: Wallet },
];

const bottomItems: NavItem[] = [
  { href: "/estructura", label: "Estructura", icon: Settings },
  { href: "/perfil", label: "Perfil", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-background h-screen sticky top-0">
      <div className="flex items-center h-16 px-6 border-b">
        <span className="text-lg font-semibold tracking-tight">Mi Presupuesto</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-1">
        <Separator className="mb-3" />
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
        <div className="flex items-center gap-3 px-3 py-2.5">
          <UserButton afterSignOutUrl="/sign-in" />
          <span className="text-sm text-muted-foreground">Cuenta</span>
        </div>
      </div>
    </aside>
  );
}
