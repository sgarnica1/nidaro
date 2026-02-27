"use client";

import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryWithPercentage } from "@/lib/actions/budget-structure";

type Props = {
  categories: CategoryWithPercentage[];
  availableIncome: number;
  onFinish: (percentages: { categoryId: string; percentage: number }[]) => void;
  pending: boolean;
};

const CATEGORY_COLORS: Record<string, string> = {
  Necesidades: "#1C3D2E",
  Gustos: "#52796F",
  Ahorro: "#84A98C",
};

const PRESETS = [
  { name: "50 · 30 · 20", values: [50, 30, 20] },
  { name: "60 · 20 · 20", values: [60, 20, 20] },
  { name: "70 · 20 · 10", values: [70, 20, 10] },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function Step4Distribution({ categories, availableIncome, onFinish, pending }: Props) {
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
  const [percentages, setPercentages] = useState<Record<string, number>>(
    Object.fromEntries(sortedCategories.map((c) => [c.id, c.userPercentage]))
  );

  const total = Object.values(percentages).reduce((sum, v) => sum + v, 0);
  const isValid = Math.abs(total - 100) <= 0.01;

  function handleSliderChange(categoryId: string, value: number) {
    const newPercentages = { ...percentages };
    newPercentages[categoryId] = value;

    const otherCategories = sortedCategories.filter((c) => c.id !== categoryId);
    const otherTotal = otherCategories.reduce((sum, c) => sum + newPercentages[c.id], 0);
    const remaining = 100 - value;

    if (otherTotal > 0 && remaining > 0) {
      const ratio = remaining / otherTotal;
      otherCategories.forEach((c) => {
        newPercentages[c.id] = Math.max(0, Math.min(100, newPercentages[c.id] * ratio));
      });
    } else {
      otherCategories.forEach((c) => {
        newPercentages[c.id] = 0;
      });
      newPercentages[categoryId] = 100;
    }

    setPercentages(newPercentages);
  }

  function applyPreset(values: number[]) {
    const newPercentages: Record<string, number> = {};
    sortedCategories.forEach((c, i) => {
      newPercentages[c.id] = values[i] || 0;
    });
    setPercentages(newPercentages);
  }

  const categoryAmounts = sortedCategories.map((c) => ({
    category: c,
    percentage: percentages[c.id],
    amount: (availableIncome * percentages[c.id]) / 100,
  }));

  const totalPercentage = categoryAmounts.reduce((sum, ca) => sum + ca.percentage, 0);

  return (
    <div className="px-4 pt-6 pb-8">
      <h1 className="text-[26px] font-bold text-[#111111] mb-2">¿Cómo distribuir?</h1>
      <p className="text-[15px] text-[#6B7280] mb-8">Ajusta los porcentajes según tu estilo</p>

      <div className="mb-8">
        <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden flex">
          {categoryAmounts.map((ca) => (
            <div
              key={ca.category.id}
              className="transition-all duration-300"
              style={{
                width: `${ca.percentage}%`,
                backgroundColor: CATEGORY_COLORS[ca.category.name] || "#1C3D2E",
              }}
            />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-[11px] uppercase text-[#6B7280] mb-3">Distribuciones comunes</p>
        <div className="flex gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset.values)}
              className="h-9 px-3 rounded-full bg-white border border-[#E5E7EB] text-[13px] font-medium text-[#111111] hover:bg-[#F8F8F6] transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 mb-24">
        {sortedCategories.map((category) => {
          const percentage = percentages[category.id];
          const amount = (availableIncome * percentage) / 100;
          const color = CATEGORY_COLORS[category.name] || "#1C3D2E";

          return (
            <div key={category.id}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[15px] font-medium text-[#111111]">{category.name}</span>
                </div>
                <span className="text-[15px] font-bold" style={{ color }}>
                  {Math.round(percentage)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={percentage}
                onChange={(e) => handleSliderChange(category.id, parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#E5E7EB] rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, ${color} 0%, ${color} ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`,
                }}
              />
              <div className="mt-2 text-[13px] text-[#6B7280]">
                {formatCurrency(amount)} de {formatCurrency(availableIncome)}
              </div>
            </div>
          );
        })}
      </div>

      {!isValid && (
        <div className="fixed bottom-20 left-0 right-0 px-4">
          <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-xl p-3 text-center">
            <p className="text-[13px] font-medium text-[#92400E]">
              Los porcentajes deben sumar 100%
            </p>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F3F4F6] px-4 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        <button
          onClick={() => {
            const data = sortedCategories.map((c) => ({
              categoryId: c.id,
              percentage: percentages[c.id],
            }));
            onFinish(data);
          }}
          disabled={!isValid || pending}
          className={cn(
            "w-full h-[52px] rounded-[14px] font-bold text-base flex items-center justify-center transition-all",
            isValid && !pending
              ? "bg-[#1C3D2E] text-white hover:bg-[#1C3D2E]/90 active:scale-[0.98]"
              : "bg-[#9CA3AF] text-white opacity-50"
          )}
        >
          {pending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Creando...
            </>
          ) : (
            "Crear presupuesto"
          )}
        </button>
      </div>

    </div>
  );
}
