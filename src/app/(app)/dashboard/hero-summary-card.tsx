"use client";

import { cn } from "@/lib/utils";

type Props = {
  available: number;
  totalPlanned: number;
  totalReal: number;
  remaining: number;
};

function formatCurrency(amount: number, showDecimals = false) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
}

export function HeroSummaryCard({ available, totalPlanned, totalReal, remaining }: Props) {
  return (
    <div
      className="rounded-[20px] p-6 bg-[#1C3D2E] text-white relative overflow-hidden"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
      }}
    >
      {/* Radial glow */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10">
        <div className="mb-4">
          <p className="text-[12px] mb-1" style={{ color: "rgba(255,255,255,0.55)" }}>
            Ingreso disponible
          </p>
          <p className="text-[36px] font-bold tracking-tight">{formatCurrency(available)}</p>
        </div>
        <div className="h-px bg-white/15 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[12px] mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
              Planeado
            </p>
            <p className="text-[15px] font-semibold">{formatCurrency(totalPlanned)}</p>
          </div>
          <div>
            <p className="text-[12px] mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
              Real
            </p>
            <p className="text-[15px] font-semibold">{formatCurrency(totalReal)}</p>
          </div>
          <div>
            <p className="text-[12px] mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>
              Restante
            </p>
            <p className={cn("text-[17px] font-semibold", remaining < 0 ? "text-[#DC2626]" : "text-[#22C55E]")}>
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
