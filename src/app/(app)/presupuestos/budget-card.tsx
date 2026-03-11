"use client";

import { useTransition, useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ChevronDown, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteBudgetExpensePlan, type BudgetWithDetails } from "@/lib/actions/budgets";
import type { ExpenseCategoryWithRelations, BudgetCategoryWithSubs } from "@/lib/actions/expense-categories";
import { BudgetExpensePlanForm } from "./budget-expense-plan-form";
import { cn } from "@/lib/utils";

type Props = {
  budget: BudgetWithDetails;
  expenseCategories: ExpenseCategoryWithRelations[];
  budgetCategories: BudgetCategoryWithSubs[];
  totalIncome: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getCategoryIcon(category: ExpenseCategoryWithRelations) {
  const IconMap: Record<string, string> = {
    Supermercado: "🛒",
    Salidas: "🍽️",
    Hogar: "🏠",
    Transporte: "🚗",
    Salud: "🏥",
    Ropa: "👕",
    Entretenimiento: "🎬",
    Educación: "📚",
    Agua: "💧",
    Gas: "🔥",
    iPhone: "📱",
  };
  return IconMap[category.name] || category.name.charAt(0).toUpperCase();
}

const CATEGORY_COLORS: Record<string, string> = {
  Necesidades: "#1C3D2E",
  Gustos: "#52796F",
  Ahorro: "#84A98C",
};

export function BudgetCard({
  budget,
  expenseCategories,
  budgetCategories,
  totalIncome,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingPlan, setEditingPlan] = useState<{ expenseCategoryId: string; plannedAmount: number } | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (swipedItemId) {
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest(`[data-plan-id="${swipedItemId}"]`)) {
          setSwipedItemId(null);
        }
      };
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [swipedItemId]);

  const totalPlanned = budget.expensePlans.reduce((sum, p) => sum + p.plannedAmount, 0);
  const remaining = totalIncome - totalPlanned;

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    budget.expensePlans.forEach((plan) => {
      const catId = plan.expenseCategory.budgetCategory.id;
      totals[catId] = (totals[catId] ?? 0) + plan.plannedAmount;
    });
    return totals;
  }, [budget.expensePlans]);

  const categoryPercentages = useMemo(() => {
    const pcts: Record<string, number> = {};
    Object.entries(categoryTotals).forEach(([catId, amount]) => {
      pcts[catId] = totalPlanned > 0 ? (amount / totalPlanned) * 100 : 0;
    });
    return pcts;
  }, [categoryTotals, totalPlanned]);

  function handleDeletePlan(expenseCategoryId: string) {
    setSwipedItemId(null);
    startTransition(async () => {
      const result = await deleteBudgetExpensePlan(budget.id, expenseCategoryId);
      if (result.success) {
        toast.success("Gasto eliminado");
        router.refresh();
      } else {
        toast.error(result.error || "Error al eliminar el gasto");
      }
    });
  }

  function handleStartEdit(plan: { expenseCategoryId: string; plannedAmount: number }) {
    setSwipedItemId(null);
    setEditingPlan(plan);
  }

  function toggleSection(categoryId: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }

  useEffect(() => {
    if (expandedSections.size === 0) {
      const necesidadesCategory = budgetCategories.find((bc) => bc.name === "Necesidades");
      if (necesidadesCategory) {
        const plans = budget.expensePlans.filter((p) => p.expenseCategory.budgetCategory.id === necesidadesCategory.id);
        const gastosFijosPlans = plans.filter((p) => p.expenseCategory.subcategory?.name === "Gastos Fijos");
        if (gastosFijosPlans.length > 0) {
          setTimeout(() => {
            setExpandedSections(new Set([`${necesidadesCategory.id}-gastos-fijos`]));
          }, 0);
          return;
        }
      }
      const firstWithData = budgetCategories.find((bc) => {
        const plans = budget.expensePlans.filter((p) => p.expenseCategory.budgetCategory.id === bc.id);
        return plans.length > 0;
      });
      if (firstWithData) {
        setTimeout(() => {
          setExpandedSections(new Set([firstWithData.id]));
        }, 0);
      }
    }
  }, [expandedSections.size, budgetCategories, budget.expensePlans]);

  const existingPlanCategoryIds = budget.expensePlans.map((p) => p.expenseCategory.id);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className="pb-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] p-6 mb-6"
      >
        <div className="mb-5">
          <h2 className="text-[20px] font-bold text-[#111111] mb-1">
            {budget.name || "Presupuesto"}
          </h2>
          <p className="text-[14px] text-[#6B7280]">Total asignado</p>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-[32px] font-bold text-[#111111]">{formatCurrency(totalPlanned)}</span>
            {totalIncome > 0 && (
              <span className="text-[14px] text-[#6B7280]">
                de {formatCurrency(totalIncome)}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {budgetCategories.map((bc) => {
              const amount = categoryTotals[bc.id] ?? 0;
              const percentage = categoryPercentages[bc.id] ?? 0;
              const color = CATEGORY_COLORS[bc.name] || "#6B7280";

              return (
                <div key={bc.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#111111]">{bc.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[#111111]">{formatCurrency(amount)}</span>
                      <span className="text-[12px] text-[#6B7280]">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        {budgetCategories.map((bc) => {
          const allPlans = budget.expensePlans.filter((p) => p.expenseCategory.budgetCategory.id === bc.id);
          const sectionTotal = categoryTotals[bc.id] ?? 0;
          const categoryColor = CATEGORY_COLORS[bc.name] || "#6B7280";
          const categoryPercentage = categoryPercentages[bc.id] ?? 0;

          const shouldSplitBySubcategory = bc.name === "Necesidades";

          if (shouldSplitBySubcategory) {
            const gastosFijosPlans = allPlans.filter((p) => p.expenseCategory.subcategory?.name === "Gastos Fijos");
            const gastosVariablesPlans = allPlans.filter((p) => p.expenseCategory.subcategory?.name === "Gastos Variables Necesarios");
            const plansWithoutSubcategory = allPlans.filter((p) => !p.expenseCategory.subcategory);

            const gastosFijosTotal = gastosFijosPlans.reduce((sum, p) => sum + p.plannedAmount, 0);
            const gastosVariablesTotal = gastosVariablesPlans.reduce((sum, p) => sum + p.plannedAmount, 0);
            const plansWithoutSubcategoryTotal = plansWithoutSubcategory.reduce((sum, p) => sum + p.plannedAmount, 0);

            const subcategories: Array<{
              id: string;
              name: string;
              dbName: string | undefined;
              plans: typeof gastosFijosPlans;
              total: number;
              order: number;
            }> = [
              {
                id: "gastos-fijos",
                name: "Gastos Fijos",
                dbName: "Gastos Fijos",
                plans: gastosFijosPlans,
                total: gastosFijosTotal,
                order: 1,
              },
              {
                id: "gastos-variables",
                name: "Variables Necesarios",
                dbName: "Gastos Variables Necesarios",
                plans: gastosVariablesPlans,
                total: gastosVariablesTotal,
                order: 2,
              },
            ];

            if (plansWithoutSubcategory.length > 0) {
              subcategories.push({
                id: "sin-subcategoria",
                name: "Sin subcategoría",
                dbName: undefined,
                plans: plansWithoutSubcategory,
                total: plansWithoutSubcategoryTotal,
                order: 3,
              });
            }

            return (
              <div key={bc.id} className="space-y-4">
                {subcategories.map((subcat) => {
                  const isExpanded = expandedSections.has(`${bc.id}-${subcat.id}`);
                  const subcatPercentage = sectionTotal > 0 ? (subcat.total / sectionTotal) * 100 : 0;

                  return (
                    <motion.div
                      key={subcat.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: subcat.order * 0.05 }}
                    >
                      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden">
                        <button
                          type="button"
                          className="w-full flex items-center justify-between p-5 hover:bg-[#FAFAFA] transition-colors"
                          onClick={() => toggleSection(`${bc.id}-${subcat.id}`)}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div
                              className="h-3 w-3 rounded-full shrink-0"
                              style={{ backgroundColor: categoryColor }}
                            />
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[16px] font-bold text-[#111111]">{subcat.name}</span>
                                {subcat.plans.length > 0 && (
                                  <span className="text-[12px] text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full">
                                    {subcat.plans.length} {subcat.plans.length === 1 ? "gasto" : "gastos"}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[18px] font-bold text-[#111111]">{formatCurrency(subcat.total)}</span>
                                {sectionTotal > 0 && (
                                  <span className="text-[13px] text-[#6B7280]">{subcatPercentage.toFixed(1)}% de {bc.name}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="h-5 w-5 text-[#6B7280] shrink-0" />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 pt-2">
                                {subcat.plans.length === 0 ? (
                                  <div className="py-8 text-center">
                                    <p className="text-[14px] text-[#6B7280] mb-4">No hay gastos en esta subcategoría</p>
                                    <BudgetExpensePlanForm
                                      budgetId={budget.id}
                                      expenseCategories={expenseCategories}
                                      budgetCategories={budgetCategories}
                                      filterBudgetCategoryId={bc.id}
                                      filterSubcategoryName={subcat.dbName}
                                      existingPlanCategoryIds={existingPlanCategoryIds}
                                      currentCategoryTotal={subcat.total}
                                      onPlanAdded={() => router.refresh()}
                                    >
                                      <div className="bg-[#F8F9FA] border-2 border-dashed border-[#E5E7EB] rounded-xl p-4 hover:bg-[#F3F4F6] transition-colors cursor-pointer">
                                        <div className="flex items-center justify-center gap-2 text-[#6B7280]">
                                          <Plus className="h-5 w-5" />
                                          <span className="text-[14px] font-medium">Agregar gasto</span>
                                        </div>
                                        <p className="text-[12px] text-[#9CA3AF] mt-1 text-center">Toca para agregar un gasto a esta subcategoría</p>
                                      </div>
                                    </BudgetExpensePlanForm>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    {subcat.plans.map((plan, index) => {
                                      const planPct = subcat.total > 0 ? (plan.plannedAmount / subcat.total) * 100 : 0;
                                      const isSwiped = swipedItemId === plan.expenseCategory.id;

                                      return (
                                        <motion.div
                                          key={plan.id}
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          transition={{ duration: 0.2, delay: index * 0.03 }}
                                          data-plan-id={plan.expenseCategory.id}
                                          className={cn(
                                            "relative flex items-center gap-3 p-3 rounded-xl overflow-hidden",
                                            "hover:bg-[#FAFAFA] transition-colors",
                                            isSwiped && "bg-[#FAFAFA]"
                                          )}
                                          onTouchStart={(e) => {
                                            const touch = e.touches[0];
                                            const startX = touch.clientX;
                                            let moved = false;

                                            const handleMove = (moveEvent: TouchEvent) => {
                                              const currentX = moveEvent.touches[0].clientX;
                                              const diff = startX - currentX;
                                              if (Math.abs(diff) > 10) {
                                                moved = true;
                                              }
                                              if (diff > 80) {
                                                setSwipedItemId(plan.expenseCategory.id);
                                              } else if (diff < -80) {
                                                setSwipedItemId(null);
                                              }
                                            };

                                            const handleEnd = () => {
                                              if (!moved && swipedItemId === plan.expenseCategory.id) {
                                                setSwipedItemId(null);
                                              }
                                              document.removeEventListener("touchmove", handleMove as EventListener);
                                              document.removeEventListener("touchend", handleEnd);
                                            };

                                            document.addEventListener("touchmove", handleMove as EventListener);
                                            document.addEventListener("touchend", handleEnd);
                                          }}
                                        >
                                          <div className={cn(
                                            "absolute inset-y-0 right-0 flex items-center transition-transform duration-200 z-10",
                                            isSwiped ? "translate-x-0" : "translate-x-full"
                                          )}>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-full w-14 bg-[#3B82F6] hover:bg-[#2563EB] rounded-l-xl rounded-r-none"
                                              onClick={() => handleStartEdit({
                                                expenseCategoryId: plan.expenseCategory.id,
                                                plannedAmount: plan.plannedAmount,
                                              })}
                                            >
                                              <Pencil className="h-4 w-4 text-white" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-full w-14 bg-[#DC2626] hover:bg-[#B91C1C] rounded-r-xl rounded-l-none"
                                              onClick={() => handleDeletePlan(plan.expenseCategory.id)}
                                            >
                                              <Trash2 className="h-4 w-4 text-white" />
                                            </Button>
                                          </div>

                                          <div className={cn(
                                            "flex items-center gap-3 flex-1 transition-transform duration-200",
                                            isSwiped && "-translate-x-28"
                                          )}>
                                            <div
                                              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-lg shadow-sm"
                                              style={{
                                                backgroundColor: `${plan.expenseCategory.color}15`,
                                              }}
                                            >
                                              {getCategoryIcon(plan.expenseCategory)}
                                            </div>

                                            <div className="flex-1 min-w-0 overflow-hidden">
                                              <p className="text-[15px] font-medium text-[#111111] truncate max-w-full">
                                                {plan.expenseCategory.name}
                                              </p>
                                              <p className="text-[12px] text-[#6B7280] truncate">{planPct.toFixed(1)}%</p>
                                            </div>

                                            <div className="text-right shrink-0">
                                              <p
                                                className="text-[16px] font-bold text-[#111111] tabular-nums cursor-pointer hover:text-[#1C3D2E] transition-colors"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleStartEdit({
                                                    expenseCategoryId: plan.expenseCategory.id,
                                                    plannedAmount: plan.plannedAmount,
                                                  });
                                                }}
                                              >
                                                {formatCurrency(plan.plannedAmount)}
                                              </p>
                                            </div>
                                          </div>
                                        </motion.div>
                                      );
                                    })}

                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: subcat.plans.length * 0.03 }}
                                      className="mt-3"
                                    >
                                      <BudgetExpensePlanForm
                                        budgetId={budget.id}
                                        expenseCategories={expenseCategories}
                                        budgetCategories={budgetCategories}
                                        filterBudgetCategoryId={bc.id}
                                        filterSubcategoryName={subcat.dbName}
                                        existingPlanCategoryIds={existingPlanCategoryIds}
                                        currentCategoryTotal={subcat.total}
                                        onPlanAdded={() => router.refresh()}
                                      >
                                        <div className="bg-[#F8F9FA] border-2 border-dashed border-[#E5E7EB] rounded-xl p-4 hover:bg-[#F3F4F6] transition-colors cursor-pointer">
                                          <div className="flex items-center justify-center gap-2 text-[#6B7280]">
                                            <Plus className="h-5 w-5" />
                                            <span className="text-[14px] font-medium">Agregar gasto</span>
                                          </div>
                                          <p className="text-[12px] text-[#9CA3AF] mt-1 text-center">Toca para agregar otro gasto a esta subcategoría</p>
                                        </div>
                                      </BudgetExpensePlanForm>
                                    </motion.div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          }

          const isExpanded = expandedSections.has(bc.id);

          return (
            <motion.div
              key={bc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: budgetCategories.indexOf(bc) * 0.05 }}
            >
              <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-5 hover:bg-[#FAFAFA] transition-colors"
                  onClick={() => toggleSection(bc.id)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: categoryColor }}
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[16px] font-bold text-[#111111]">{bc.name}</span>
                        {allPlans.length > 0 && (
                          <span className="text-[12px] text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full">
                            {allPlans.length} {allPlans.length === 1 ? "gasto" : "gastos"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[18px] font-bold text-[#111111]">{formatCurrency(sectionTotal)}</span>
                        {totalPlanned > 0 && (
                          <span className="text-[13px] text-[#6B7280]">{categoryPercentage.toFixed(1)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-5 w-5 text-[#6B7280] shrink-0" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-2">
                        {allPlans.length === 0 ? (
                          <div className="py-8 text-center">
                            <p className="text-[14px] text-[#6B7280] mb-4">No hay gastos en esta categoría</p>
                            <BudgetExpensePlanForm
                              budgetId={budget.id}
                              expenseCategories={expenseCategories}
                              budgetCategories={budgetCategories}
                              filterBudgetCategoryId={bc.id}
                              existingPlanCategoryIds={existingPlanCategoryIds}
                              currentCategoryTotal={sectionTotal}
                              onPlanAdded={() => router.refresh()}
                            >
                              <div className="bg-[#F8F9FA] border-2 border-dashed border-[#E5E7EB] rounded-xl p-4 hover:bg-[#F3F4F6] transition-colors cursor-pointer">
                                <div className="flex items-center justify-center gap-2 text-[#6B7280]">
                                  <Plus className="h-5 w-5" />
                                  <span className="text-[14px] font-medium">Agregar gasto</span>
                                </div>
                                <p className="text-[12px] text-[#9CA3AF] mt-1 text-center">Toca para agregar un gasto a esta categoría</p>
                              </div>
                            </BudgetExpensePlanForm>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {allPlans.map((plan, index) => {
                              const planPct = sectionTotal > 0 ? (plan.plannedAmount / sectionTotal) * 100 : 0;
                              const isSwiped = swipedItemId === plan.expenseCategory.id;

                              return (
                                <motion.div
                                  key={plan.id}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.2, delay: index * 0.03 }}
                                  data-plan-id={plan.expenseCategory.id}
                                  className={cn(
                                    "relative flex items-center gap-3 p-3 rounded-xl overflow-hidden",
                                    "hover:bg-[#FAFAFA] transition-colors",
                                    isSwiped && "bg-[#FAFAFA]"
                                  )}
                                  onTouchStart={(e) => {
                                    const touch = e.touches[0];
                                    const startX = touch.clientX;
                                    let moved = false;

                                    const handleMove = (moveEvent: TouchEvent) => {
                                      const currentX = moveEvent.touches[0].clientX;
                                      const diff = startX - currentX;
                                      if (Math.abs(diff) > 10) {
                                        moved = true;
                                      }
                                      if (diff > 80) {
                                        setSwipedItemId(plan.expenseCategory.id);
                                      } else if (diff < -80) {
                                        setSwipedItemId(null);
                                      }
                                    };

                                    const handleEnd = () => {
                                      if (!moved && swipedItemId === plan.expenseCategory.id) {
                                        setSwipedItemId(null);
                                      }
                                      document.removeEventListener("touchmove", handleMove as EventListener);
                                      document.removeEventListener("touchend", handleEnd);
                                    };

                                    document.addEventListener("touchmove", handleMove as EventListener);
                                    document.addEventListener("touchend", handleEnd);
                                  }}
                                >
                                  <div className={cn(
                                    "absolute inset-y-0 right-0 flex items-center transition-transform duration-200 z-10",
                                    isSwiped ? "translate-x-0" : "translate-x-full"
                                  )}>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-full w-14 bg-[#3B82F6] hover:bg-[#2563EB] rounded-l-xl rounded-r-none"
                                      onClick={() => handleStartEdit({
                                        expenseCategoryId: plan.expenseCategory.id,
                                        plannedAmount: plan.plannedAmount,
                                      })}
                                    >
                                      <Pencil className="h-4 w-4 text-white" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-full w-14 bg-[#DC2626] hover:bg-[#B91C1C] rounded-r-xl rounded-l-none"
                                      onClick={() => handleDeletePlan(plan.expenseCategory.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-white" />
                                    </Button>
                                  </div>

                                  <div className={cn(
                                    "flex items-center gap-3 flex-1 transition-transform duration-200",
                                    isSwiped && "-translate-x-28"
                                  )}>
                                    <div
                                      className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-lg shadow-sm"
                                      style={{
                                        backgroundColor: `${plan.expenseCategory.color}15`,
                                      }}
                                    >
                                      {getCategoryIcon(plan.expenseCategory)}
                                    </div>

                                    <div className="flex-1 min-w-0 overflow-hidden">
                                      <p className="text-[15px] font-medium text-[#111111] truncate max-w-full">
                                        {plan.expenseCategory.name}
                                      </p>
                                      <p className="text-[12px] text-[#6B7280] truncate">{planPct.toFixed(1)}% de {bc.name}</p>
                                    </div>

                                    <div className="text-right shrink-0">
                                      <p
                                        className="text-[16px] font-bold text-[#111111] tabular-nums cursor-pointer hover:text-[#1C3D2E] transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStartEdit({
                                            expenseCategoryId: plan.expenseCategory.id,
                                            plannedAmount: plan.plannedAmount,
                                          });
                                        }}
                                      >
                                        {formatCurrency(plan.plannedAmount)}
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}

                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: allPlans.length * 0.03 }}
                              className="mt-3"
                            >
                              <BudgetExpensePlanForm
                                budgetId={budget.id}
                                expenseCategories={expenseCategories}
                                budgetCategories={budgetCategories}
                                filterBudgetCategoryId={bc.id}
                                existingPlanCategoryIds={existingPlanCategoryIds}
                                currentCategoryTotal={sectionTotal}
                                onPlanAdded={() => router.refresh()}
                              >
                                <div className="bg-[#F8F9FA] border-2 border-dashed border-[#E5E7EB] rounded-xl p-4 hover:bg-[#F3F4F6] transition-colors cursor-pointer">
                                  <div className="flex items-center justify-center gap-2 text-[#6B7280]">
                                    <Plus className="h-5 w-5" />
                                    <span className="text-[14px] font-medium">Agregar gasto</span>
                                  </div>
                                  <p className="text-[12px] text-[#9CA3AF] mt-1 text-center">Toca para agregar otro gasto a esta categoría</p>
                                </div>
                              </BudgetExpensePlanForm>
                            </motion.div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {editingPlan && (
        <BudgetExpensePlanForm
          budgetId={budget.id}
          expenseCategories={expenseCategories}
          budgetCategories={budgetCategories}
          filterBudgetCategoryId={expenseCategories.find((c) => c.id === editingPlan.expenseCategoryId)?.budgetCategory.id}
          existingPlanCategoryIds={existingPlanCategoryIds}
          currentCategoryTotal={(() => {
            const budgetCatId = expenseCategories.find((c) => c.id === editingPlan.expenseCategoryId)?.budgetCategory.id;
            if (!budgetCatId) return 0;
            return budget.expensePlans
              .filter((p) => p.expenseCategory.budgetCategory.id === budgetCatId)
              .reduce((sum, p) => sum + p.plannedAmount, 0);
          })()}
          editingPlan={{
            expenseCategoryId: editingPlan.expenseCategoryId,
            plannedAmount: editingPlan.plannedAmount,
          }}
          open={editingPlan !== null}
          onOpenChange={(open) => {
            if (!open) {
              setEditingPlan(null);
            }
          }}
          onPlanAdded={() => {
            setEditingPlan(null);
            router.refresh();
          }}
        >
          <span className="sr-only" />
        </BudgetExpensePlanForm>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F3F4F6] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[12px] text-[#6B7280] mb-0.5">Total asignado</p>
              <p className="text-[20px] font-bold text-[#111111]">{formatCurrency(totalPlanned)}</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-[#6B7280] mb-0.5">Disponible</p>
              <p className={cn(
                "text-[20px] font-bold",
                remaining >= 0 ? "text-[#10B981]" : "text-[#DC2626]"
              )}>
                {formatCurrency(Math.abs(remaining))}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
