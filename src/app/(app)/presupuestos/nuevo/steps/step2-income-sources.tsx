"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SerializedIncomeSource } from "@/lib/actions/income";

type Props = {
  incomeSources: SerializedIncomeSource[];
  selectedIds: string[];
  onToggle: (id: string, checked: boolean) => void;
  total: number;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function Step2IncomeSources({ incomeSources, selectedIds, onToggle, total }: Props) {
  const activeSources = incomeSources.filter((s) => s.isActive);
  const selectedCount = selectedIds.length;

  return (
    <div className="px-4 pt-6 pb-8">
      <h1 className="text-[26px] font-bold text-[#111111] mb-2">¿Qué ingresos incluir?</h1>
      <p className="text-[15px] text-[#6B7280] mb-8">Selecciona las fuentes para este mes</p>

      <div className="space-y-3 mb-24">
        {activeSources.map((source) => {
          const isSelected = selectedIds.includes(source.id);
          return (
            <button
              key={source.id}
              type="button"
              onClick={() => onToggle(source.id, !isSelected)}
              className={cn(
                "w-full bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4 transition-all",
                isSelected
                  ? "border-[1.5px] border-[#1C3D2E] bg-[#F0F7F4]"
                  : "border-[1.5px] border-transparent"
              )}
            >
              <div className="w-9 h-9 rounded-full bg-[#EAF2EC] flex items-center justify-center shrink-0">
                <span className="text-[13px] font-bold text-[#1C3D2E]">{getInitials(source.name)}</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-[15px] font-bold text-[#111111]">{source.name}</div>
                <div className="text-[13px] text-[#6B7280]">{formatCurrency(source.amount)}</div>
              </div>
              <div
                className={cn(
                  "w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 transition-all",
                  isSelected
                    ? "bg-[#1C3D2E]"
                    : "border-[1.5px] border-[#D1D5DB]"
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F3F4F6] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[15px] font-bold text-[#111111]">
              Total seleccionado: {formatCurrency(total)}
            </div>
            <div className="text-[13px] text-[#6B7280]">{selectedCount} fuente{selectedCount !== 1 ? "s" : ""}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
