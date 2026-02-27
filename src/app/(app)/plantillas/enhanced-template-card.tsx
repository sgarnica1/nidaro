"use client";

import { GripVertical, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TemplateWithItems } from "@/lib/actions/templates";

type Props = {
  template: TemplateWithItems;
  totalIncome: number;
  onClick: () => void;
  onUse: () => void;
  lastUsed?: string | null;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const CATEGORY_COLORS: Record<string, string> = {
  Necesidades: "#3B82F6",
  Gustos: "#F59E0B",
  Ahorro: "#10B981",
};

export function EnhancedTemplateCard({ template, totalIncome, onClick, onUse, lastUsed }: Props) {
  const totalPlanned = template.items.reduce((sum, i) => sum + Number(i.plannedAmount), 0);
  const percentOfIncome = totalIncome > 0 ? ((totalPlanned / totalIncome) * 100).toFixed(1) : "—";
  const itemCount = template.items.length;

  const categoryTotals: Record<string, number> = {};
  template.items.forEach((item) => {
    const catName = item.expenseCategory.budgetCategory.name;
    categoryTotals[catName] = (categoryTotals[catName] ?? 0) + Number(item.plannedAmount);
  });

  const totalExpenses = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
  const categoryPercentages: Record<string, number> = {};
  Object.entries(categoryTotals).forEach(([name, amount]) => {
    categoryPercentages[name] = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
  });

  const categories = Object.keys(categoryTotals).sort((a, b) => {
    const order = ["Necesidades", "Gustos", "Ahorro"];
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <Card
      className="rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] cursor-pointer hover:shadow-md transition-all"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-[18px] font-bold text-[#111111] mb-1">{template.name}</h3>
            <div className="flex items-center gap-2 text-[13px] text-[#6B7280]">
              <span>{itemCount} gastos</span>
              {totalIncome > 0 && <span>· {percentOfIncome}% del ingreso</span>}
            </div>
            {lastUsed && (
              <p className="text-[12px] text-[#6B7280] mt-1">Última vez usada: {lastUsed}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-[#D1D5DB]" />
          </div>
        </div>

        {categories.length > 0 && (
          <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden mb-4">
            <div className="h-full flex">
              {categories.map((catName) => {
                const pct = categoryPercentages[catName] ?? 0;
                return (
                  <div
                    key={catName}
                    className="h-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: CATEGORY_COLORS[catName] || "#6B7280",
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-[20px] font-bold text-[#111111]">{formatCurrency(totalPlanned)}</p>
          <Button
            size="sm"
            className="h-9 px-4 rounded-xl bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white text-[13px] font-medium"
            onClick={(e) => {
              e.stopPropagation();
              onUse();
            }}
          >
            Agregar gastos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
