"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExpenseWithCategory } from "@/lib/actions/expenses";

type Props = {
  expenses: ExpenseWithCategory[];
  maxItems?: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(date);
}

function getCategoryIcon(category: { name: string; color: string }) {
  const IconMap: Record<string, string> = {
    Supermercado: "🛒",
    Salidas: "🍽️",
    Hogar: "🏠",
    Transporte: "🚗",
    Salud: "🏥",
    Ropa: "👕",
    Entretenimiento: "🎬",
    Educación: "📚",
  };
  return IconMap[category.name] || "💰";
}

export function RecentExpensesPreview({ expenses, maxItems = 3 }: Props) {
  const router = useRouter();
  const recentExpenses = expenses
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, maxItems);

  if (recentExpenses.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Últimos gastos</p>
        <button
          type="button"
          onClick={() => router.push("/gastos")}
          className="flex items-center gap-1 text-[13px] text-[#1C3D2E] font-medium hover:opacity-80 transition-opacity"
        >
          Ver todos
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-0">
        {recentExpenses.map((expense, index) => {
          const category = expense.expenseCategory;
          return (
            <div key={expense.id}>
              {index > 0 && <div className="h-px bg-[#F3F4F6]" />}
              <div className="flex items-center gap-3 h-14 px-0">
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 text-lg"
                  style={{
                    backgroundColor: `${category.color}1F`,
                  }}
                >
                  {getCategoryIcon(category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-[#111111] truncate">{expense.name}</p>
                  <p className="text-[12px] text-[#6B7280]">{formatDate(new Date(expense.date))}</p>
                </div>
                <p className="text-[15px] font-bold text-[#111111] tabular-nums shrink-0">
                  {formatCurrency(expense.amount)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
