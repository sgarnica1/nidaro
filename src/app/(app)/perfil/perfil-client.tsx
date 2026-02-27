"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Settings, Users, Tags, CircleUserRound, ChevronRight, Share2, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function PerfilClient() {
  const { user } = useUser();
  const userName = user?.fullName || user?.firstName || "Usuario";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const initials = getInitials(userName);

  return (
    <div className="space-y-8 pb-8">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-[#1C3D2E] flex items-center justify-center shrink-0">
          <span className="text-[20px] font-semibold text-white">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[18px] font-bold text-[#111111] truncate">{userName}</h2>
          <p className="text-[13px] text-[#6B7280] truncate">{userEmail || "Plan Personal"}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.8px] mb-2 px-1">
            CONFIGURACIÓN
          </p>
          <Card className="rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            <CardContent className="p-0">
              <Link href="/categorias">
                <div className="flex items-center gap-4 h-[52px] px-5 hover:bg-[#F3F4F6] transition-colors">
                  <div className="h-9 w-9 rounded-lg bg-[#EAF2EC] flex items-center justify-center shrink-0">
                    <Tags className="h-5 w-5 text-[#1C3D2E]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-[#111111]">Categorías de gastos</p>
                    <p className="text-[12px] text-[#6B7280] truncate">Crea y organiza tus categorías</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#D1D5DB] shrink-0" />
                </div>
              </Link>
              <div className="h-px bg-[#F3F4F6] mx-5" />
              <Link href="/estructura">
                <div className="flex items-center gap-4 h-[52px] px-5 hover:bg-[#F3F4F6] transition-colors">
                  <div className="h-9 w-9 rounded-lg bg-[#EAF2EC] flex items-center justify-center shrink-0">
                    <Settings className="h-5 w-5 text-[#1C3D2E]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-[#111111]">Estructura del presupuesto</p>
                    <p className="text-[12px] text-[#6B7280] truncate">Configura los porcentajes 50/30/20</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#D1D5DB] shrink-0" />
                </div>
              </Link>
              <div className="h-px bg-[#F3F4F6] mx-5" />
              <Link href="/perfil/familia">
                <div className="flex items-center gap-4 h-[52px] px-5 hover:bg-[#F3F4F6] transition-colors">
                  <div className="h-9 w-9 rounded-lg bg-[#EAF2EC] flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-[#1C3D2E]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-[#111111]">Grupos familiares</p>
                    <p className="text-[12px] text-[#6B7280] truncate">Comparte presupuestos con tu familia</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#D1D5DB] shrink-0" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.8px] mb-2 px-1">
            CUENTA
          </p>
          <Card className="rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            <CardContent className="p-0">
              <Link href="/perfil/conta">
                <div className="flex items-center gap-4 h-[52px] px-5 hover:bg-[#F3F4F6] transition-colors">
                  <div className="h-9 w-9 rounded-lg bg-[#EAF2EC] flex items-center justify-center shrink-0">
                    <CircleUserRound className="h-5 w-5 text-[#1C3D2E]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-[#111111]">Cuenta</p>
                    <p className="text-[12px] text-[#6B7280] truncate">Información personal y seguridad</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#D1D5DB] shrink-0" />
                </div>
              </Link>
              <div className="h-px bg-[#F3F4F6] mx-5" />
              <button
                type="button"
                className="w-full flex items-center gap-4 h-[52px] px-5 hover:bg-[#F3F4F6] transition-colors"
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: "Nidaro",
                        text: "Control total sobre tu dinero",
                        url: window.location.origin,
                      });
                    } catch (err) {
                      // User cancelled or error
                    }
                  }
                }}
              >
                <div className="h-9 w-9 rounded-lg bg-[#EAF2EC] flex items-center justify-center shrink-0">
                  <Share2 className="h-5 w-5 text-[#1C3D2E]" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[15px] font-medium text-[#111111]">Compartir la app</p>
                </div>
                <ChevronRight className="h-5 w-5 text-[#D1D5DB] shrink-0" />
              </button>
              <div className="h-px bg-[#F3F4F6] mx-5" />
              <SignOutButton>
                <button
                  type="button"
                  className="w-full flex items-center gap-4 h-[52px] px-5 hover:bg-[#F3F4F6] transition-colors text-left"
                >
                  <div className="h-9 w-9 rounded-lg bg-[#EAF2EC] flex items-center justify-center shrink-0">
                    <LogOut className="h-5 w-5 text-[#DC2626]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-[#DC2626]">Cerrar sesión</p>
                  </div>
                </button>
              </SignOutButton>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="text-center pt-4">
        <p className="text-[10px] text-[#6B7280]">v1.0.0</p>
      </div>
    </div>
  );
}
