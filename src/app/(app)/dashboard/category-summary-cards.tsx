"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ExpensePlan = {
  plannedAmount: number;
  expenseCategory: {
    budgetCategory: {
      id: string;
      name: string;
    };
  };
};

type Expense = {
  amount: number;
  expenseCategory: {
    budgetCategory: {
      id: string;
      name: string;
    };
  };
};

type Props = {
  expensePlans: ExpensePlan[];
  expenses: Expense[];
  onCategoryClick?: (categoryId: string) => void;
};

const CATEGORY_COLORS: Record<string, string> = {
  Necesidades: "#1C3D2E",
  Gustos: "#52796F",
  Ahorro: "#84A98C",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CategorySummaryCards({ expensePlans, expenses, onCategoryClick }: Props) {
  const categories = useMemo(() => {
    const plannedByCategory: Record<string, number> = {};
    const spentByCategory: Record<string, number> = {};

    for (const plan of expensePlans) {
      const catId = plan.expenseCategory.budgetCategory.id;
      plannedByCategory[catId] = (plannedByCategory[catId] ?? 0) + plan.plannedAmount;
    }

    for (const exp of expenses) {
      const catId = exp.expenseCategory.budgetCategory.id;
      spentByCategory[catId] = (spentByCategory[catId] ?? 0) + exp.amount;
    }

    const catNameMap: Record<string, string> = {};
    for (const plan of expensePlans) {
      catNameMap[plan.expenseCategory.budgetCategory.id] = plan.expenseCategory.budgetCategory.name;
    }

    return Object.keys(plannedByCategory).map((catId) => {
      const planned = plannedByCategory[catId] ?? 0;
      const spent = spentByCategory[catId] ?? 0;
      const percentage = planned > 0 ? (spent / planned) * 100 : 0;

      return {
        id: catId,
        name: catNameMap[catId] ?? catId,
        planned,
        spent,
        percentage: Math.min(percentage, 100),
        color: CATEGORY_COLORS[catNameMap[catId]] || "#6B7280",
      };
    });
  }, [expensePlans, expenses]);

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {categories.map((category, index) => {
        const progressColor = category.percentage < 70 ? "#22C55E" : category.percentage < 90 ? "#F59E0B" : "#DC2626";

        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Card
              className={cn(
                "rounded-2xl border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] cursor-pointer",
                onCategoryClick && "hover:shadow-md transition-shadow"
              )}
              onClick={() => onCategoryClick?.(category.id)}
            >
              <CardContent className="p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-sm"
                        style={{ backgroundColor: category.color }}
                      />
                      <h3 className="text-base font-semibold text-foreground">{category.name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground tabular-nums">{formatCurrency(category.spent)}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.percentage.toFixed(0)}% of {formatCurrency(category.planned)}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: progressColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${category.percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
