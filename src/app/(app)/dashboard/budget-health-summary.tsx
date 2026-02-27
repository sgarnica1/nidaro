"use client";

type Props = {
  totalReal: number;
  totalPlanned: number;
  available: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BudgetHealthSummary({ totalReal, totalPlanned, available }: Props) {
  const unallocated = available - totalPlanned;
  const plannedRemaining = totalPlanned - totalReal;

  // Calculate percentages for the stacked bar
  const total = available;
  const spentPct = total > 0 ? (totalReal / total) * 100 : 0;
  const plannedRemainingPct = total > 0 ? (Math.max(0, plannedRemaining) / total) * 100 : 0;
  const unallocatedPct = total > 0 ? (Math.max(0, unallocated) / total) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] p-5">
      <p className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider mb-4">Resumen del mes</p>
      
      {/* Stacked Bar */}
      <div className="h-3 bg-[#E5E7EB] rounded-full overflow-hidden flex mb-3" style={{ height: "12px" }}>
        {/* Spent (Real) */}
        {spentPct > 0 && (
          <div
            className="h-full bg-[#1C3D2E]"
            style={{ width: `${spentPct}%` }}
          />
        )}
        {/* Planned Remaining */}
        {plannedRemainingPct > 0 && (
          <div
            className="h-full"
            style={{
              width: `${plannedRemainingPct}%`,
              backgroundColor: "rgba(28, 61, 46, 0.25)",
            }}
          />
        )}
        {/* Unallocated */}
        {unallocatedPct > 0 && (
          <div
            className="h-full bg-[#E5E7EB]"
            style={{ width: `${unallocatedPct}%` }}
          />
        )}
      </div>

      {/* Labels */}
      <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
        <span>Gastado {formatCurrency(totalReal)}</span>
        <span>·</span>
        <span>Planeado {formatCurrency(totalPlanned)}</span>
        <span>·</span>
        <span>Libre {formatCurrency(Math.max(0, unallocated))}</span>
      </div>
    </div>
  );
}
