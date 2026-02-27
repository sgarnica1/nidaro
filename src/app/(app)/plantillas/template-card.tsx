"use client";

import { useTransition, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronDown, ChevronUp, Pencil, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TemplateItemForm } from "./template-item-form";
import { deleteTemplate, deleteTemplateItem, upsertTemplateItem, type TemplateWithItems } from "@/lib/actions/templates";
import type { ExpenseCategoryWithRelations, BudgetCategoryWithSubs } from "@/lib/actions/expense-categories";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  template: TemplateWithItems;
  expenseCategories: ExpenseCategoryWithRelations[];
  budgetCategories: BudgetCategoryWithSubs[];
  totalIncome: number;
};

function formatCurrency(amount: number, showDecimals = false) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
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

function darkenHex(hex: string, factor = 0.7): string {
  const clean = hex.replace("#", "");
  const r = Math.floor(parseInt(clean.substring(0, 2), 16) * factor);
  const g = Math.floor(parseInt(clean.substring(2, 4), 16) * factor);
  const b = Math.floor(parseInt(clean.substring(4, 6), 16) * factor);
  return `rgb(${r}, ${g}, ${b})`;
}

const CATEGORY_COLORS: Record<string, string> = {
  Necesidades: "#3B82F6",
  Gustos: "#F59E0B",
  Ahorro: "#10B981",
};

export function TemplateCard({
  template,
  expenseCategories: initialExpenseCategories,
  budgetCategories,
  totalIncome,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState<string>("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null);

  // Close swipe on outside click
  useEffect(() => {
    if (swipedItemId) {
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest(`[data-item-id="${swipedItemId}"]`)) {
          setSwipedItemId(null);
        }
      };
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [swipedItemId]);
  const expenseCategories = initialExpenseCategories;

  const totalPlanned = template.items.reduce((sum, i) => sum + Number(i.plannedAmount), 0);
  const percentOfIncome = totalIncome > 0 ? (totalPlanned / totalIncome) * 100 : 0;
  const itemCount = template.items.length;

  // Calculate category totals and percentages
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    template.items.forEach((item) => {
      const catId = item.expenseCategory.budgetCategory.id;
      totals[catId] = (totals[catId] ?? 0) + Number(item.plannedAmount);
    });
    return totals;
  }, [template.items]);

  const categoryPercentages = useMemo(() => {
    const pcts: Record<string, number> = {};
    Object.entries(categoryTotals).forEach(([catId, amount]) => {
      pcts[catId] = totalPlanned > 0 ? (amount / totalPlanned) * 100 : 0;
    });
    return pcts;
  }, [categoryTotals, totalPlanned]);

  // Find highest expense amount
  const highestAmount = useMemo(() => {
    return Math.max(...template.items.map((i) => Number(i.plannedAmount)), 0);
  }, [template.items]);

  function handleDeleteTemplate() {
    setDeleteOpen(false);
    startTransition(async () => {
      await deleteTemplate(template.id);
    });
  }

  function handleDeleteItem(itemId: string) {
    setSwipedItemId(null);
    startTransition(async () => {
      await deleteTemplateItem(itemId);
    });
  }

  function handleStartEdit(itemId: string, currentAmount: number) {
    setSwipedItemId(null);
    setEditingItemId(itemId);
    setEditingAmount(currentAmount.toString());
  }

  function handleCancelEdit() {
    setEditingItemId(null);
    setEditingAmount("");
  }

  function handleSaveAmount(itemId: string, expenseCategoryId: string) {
    const amount = parseFloat(editingAmount);
    if (isNaN(amount) || amount <= 0) {
      handleCancelEdit();
      return;
    }

    startTransition(async () => {
      const result = await upsertTemplateItem(template.id, {
        expenseCategoryId,
        plannedAmount: amount,
      });
      if (result.success) {
        handleCancelEdit();
      }
    });
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

  function handleUseTemplate() {
    router.push(`/presupuestos/nuevo?templateId=${template.id}`);
  }

  // Initialize expanded sections
  useEffect(() => {
    if (expandedSections.size === 0) {
      const firstWithData = budgetCategories.find((bc) => {
        const items = template.items.filter((i) => i.expenseCategory.budgetCategory.id === bc.id);
        return items.length > 0;
      });
      if (firstWithData) {
        setExpandedSections(new Set([firstWithData.id]));
      }
    }
  }, [expandedSections.size, budgetCategories, template.items]);

  const existingCategoryIds = template.items.map((i) => i.expenseCategory.id);

  return (
    <div className="pb-24">
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] p-5 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-[18px] font-bold text-[#111111]">{template.name}</h2>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#DC2626] hover:text-[#DC2626] hover:bg-[#FEE2E2]">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Eliminar plantilla</DialogTitle>
                <DialogDescription>
                  ¿Eliminar &quot;{template.name}&quot;? Esta acción no se puede deshacer.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
                <Button variant="destructive" disabled={pending} onClick={handleDeleteTemplate}>
                  Eliminar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stat Pills */}
        <div className="flex gap-2 mb-4">
          <Badge className="bg-[#F3F4F6] text-[#111111] border-0 px-3 py-1.5 text-[13px] font-bold">
            {formatCurrency(totalPlanned)}
          </Badge>
          <Badge className="bg-[#F3F4F6] text-[#6B7280] border-0 px-3 py-1.5 text-[13px] font-medium">
            {itemCount} {itemCount === 1 ? "gasto" : "gastos"}
          </Badge>
          <Badge
            className={cn(
              "px-3 py-1.5 text-[13px] font-medium border-0",
              percentOfIncome > 50
                ? "bg-[#FEF3C7] text-[#92400E]"
                : percentOfIncome > 40
                ? "bg-[#FDE68A] text-[#78350F]"
                : "bg-[#D1FAE5] text-[#065F46]"
            )}
          >
            {percentOfIncome.toFixed(1)}%
          </Badge>
        </div>

        {/* Proportional Allocation Bar */}
        <div className="mb-3">
          <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden flex">
            {budgetCategories.map((bc) => {
              const pct = categoryPercentages[bc.id] ?? 0;
              const color = CATEGORY_COLORS[bc.name] || "#6B7280";
              return (
                <div
                  key={bc.id}
                  className="h-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: color,
                  }}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-[#6B7280] font-medium">
            {budgetCategories.map((bc) => {
              const pct = categoryPercentages[bc.id] ?? 0;
              const shortName = bc.name === "Necesidades" ? "Nec." : bc.name === "Gustos" ? "Gus." : "Aho.";
              return (
                <span key={bc.id}>
                  {shortName} {pct.toFixed(1)}%
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {budgetCategories.map((bc) => {
          const items = template.items.filter((i) => i.expenseCategory.budgetCategory.id === bc.id);
          const sectionTotal = categoryTotals[bc.id] ?? 0;
          const isExpanded = expandedSections.has(bc.id);
          const categoryColor = CATEGORY_COLORS[bc.name] || "#6B7280";

          // Group items by subcategory
          const groupedBySubcategory = items.reduce((acc, item) => {
            const subcategoryId = item.expenseCategory.subcategory?.id ?? null;
            const subcategoryName = item.expenseCategory.subcategory?.name ?? null;
            const key = subcategoryId ?? "_none";

            if (!acc[key]) {
              acc[key] = {
                subcategoryId,
                subcategoryName,
                items: [],
                subcategoryTotal: 0,
              };
            }
            acc[key].items.push(item);
            return acc;
          }, {} as Record<string, { subcategoryId: string | null; subcategoryName: string | null; items: typeof items; subcategoryTotal: number }>);

          const groups = Object.values(groupedBySubcategory);
          groups.sort((a, b) => {
            if (a.subcategoryId === null && b.subcategoryId !== null) return 1;
            if (a.subcategoryId !== null && b.subcategoryId === null) return -1;
            if (a.subcategoryName && b.subcategoryName) {
              return a.subcategoryName.localeCompare(b.subcategoryName, "es-MX");
            }
            return 0;
          });

          groups.forEach((group) => {
            group.items.sort((a, b) =>
              a.expenseCategory.name.localeCompare(b.expenseCategory.name, "es-MX")
            );
            group.subcategoryTotal = group.items.reduce((sum, item) => sum + Number(item.plannedAmount), 0);
          });

          const hasMultipleGroups = groups.length > 1 || groups[0]?.subcategoryId !== null;

          return (
            <div key={bc.id}>
              {/* Section Header */}
              <button
                type="button"
                className="flex items-center justify-between w-full h-12 px-4 bg-[#F8F8F6] rounded-xl mb-3 hover:bg-[#F3F4F6] transition-colors"
                onClick={() => toggleSection(bc.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-2 w-2 rounded-sm"
                    style={{ backgroundColor: categoryColor }}
                  />
                  <span className="text-[11px] font-bold text-[#111111] uppercase tracking-wider">
                    {bc.name}
                  </span>
                  {items.length > 0 && (
                    <Badge className="bg-white text-[#6B7280] border border-[#E5E7EB] px-2 py-0.5 text-[11px] font-medium">
                      {items.length}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-[#111111]">
                    {formatCurrency(sectionTotal)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-[#6B7280]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#6B7280]" />
                  )}
                </div>
              </button>

              {/* Section Content */}
              {isExpanded && (
                <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden mb-4">
                  {items.length === 0 ? (
                    <div className="py-12 px-5 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F3F4F6] mb-3">
                        <AlertCircle className="h-6 w-6 text-[#6B7280]" />
                      </div>
                      <p className="text-[13px] text-[#6B7280] mb-4">Sin gastos en esta categoría</p>
                      <TemplateItemForm
                        templateId={template.id}
                        expenseCategories={expenseCategories}
                        budgetCategories={budgetCategories}
                        filterBudgetCategoryId={bc.id}
                        existingItemCategoryIds={existingCategoryIds}
                        onItemAdded={() => {}}
                      >
                        <Button
                          variant="outline"
                          className="h-11 w-full border-dashed border-[#D1D5DB] text-[#6B7280] hover:bg-[#F3F4F6]"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar gasto
                        </Button>
                      </TemplateItemForm>
                    </div>
                  ) : (
                    <>
                      {groups.map((group) => (
                        <div key={group.subcategoryId ?? "_none"}>
                          {hasMultipleGroups && group.subcategoryName && (
                            <div className="flex items-center justify-between h-8 px-4 bg-white">
                              <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
                                {group.subcategoryName}
                              </p>
                              <span className="text-[11px] text-[#9CA3AF] font-medium">
                                {formatCurrency(group.subcategoryTotal)}
                              </span>
                            </div>
                          )}
                          {group.items.map((item, index) => {
                            const isHighest = Number(item.plannedAmount) === highestAmount;
                            const itemPct = sectionTotal > 0 ? (Number(item.plannedAmount) / sectionTotal) * 100 : 0;
                            const isSwiped = swipedItemId === item.id;

                            return (
                              <div
                                key={item.id}
                                data-item-id={item.id}
                                className={cn(
                                  "relative flex items-center gap-4 h-14 px-4 overflow-hidden",
                                  index % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]",
                                  isHighest && "border-l-[3px] border-[#F59E0B]"
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
                                      setSwipedItemId(item.id);
                                    } else if (diff < -80) {
                                      setSwipedItemId(null);
                                    }
                                  };

                                  const handleEnd = () => {
                                    if (!moved && swipedItemId === item.id) {
                                      setSwipedItemId(null);
                                    }
                                    document.removeEventListener("touchmove", handleMove as EventListener);
                                    document.removeEventListener("touchend", handleEnd);
                                  };

                                  document.addEventListener("touchmove", handleMove as EventListener);
                                  document.addEventListener("touchend", handleEnd);
                                }}
                              >
                                {/* Swipe Actions */}
                                <div className={cn(
                                  "absolute inset-y-0 right-0 flex items-center transition-transform duration-200 z-10",
                                  isSwiped ? "translate-x-0" : "translate-x-full"
                                )}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-full w-16 bg-[#3B82F6] hover:bg-[#2563EB] rounded-l-lg rounded-r-none"
                                    onClick={() => handleStartEdit(item.id, Number(item.plannedAmount))}
                                  >
                                    <Pencil className="h-4 w-4 text-white" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-full w-16 bg-[#DC2626] hover:bg-[#B91C1C] rounded-r-lg rounded-l-none"
                                    onClick={() => handleDeleteItem(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-white" />
                                  </Button>
                                </div>

                                {/* Main Row Content */}
                                <div className={cn(
                                  "flex items-center gap-4 flex-1 transition-transform duration-200",
                                  isSwiped && "-translate-x-32"
                                )}>
                                  <div
                                    className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 text-lg"
                                    style={{
                                      backgroundColor: `${item.expenseCategory.color}1F`,
                                    }}
                                  >
                                    {getCategoryIcon(item.expenseCategory)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[15px] font-medium text-[#111111] truncate">
                                      {item.expenseCategory.name}
                                    </p>
                                    {hasMultipleGroups && (
                                      <p className="text-[11px] text-[#6B7280]">
                                        {group.subcategoryName || "Gasto Variable"}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right shrink-0">
                                    {editingItemId === item.id ? (
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={editingAmount}
                                        onChange={(e) => setEditingAmount(e.target.value)}
                                        onBlur={() => handleSaveAmount(item.id, item.expenseCategory.id)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            handleSaveAmount(item.id, item.expenseCategory.id);
                                          } else if (e.key === "Escape") {
                                            handleCancelEdit();
                                          }
                                        }}
                                        className="h-8 w-24 text-sm"
                                        autoFocus
                                      />
                                    ) : (
                                      <>
                                        <p
                                          className="text-[16px] font-bold text-[#111111] tabular-nums cursor-pointer hover:text-[#1C3D2E] transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartEdit(item.id, Number(item.plannedAmount));
                                          }}
                                        >
                                          {formatCurrency(Number(item.plannedAmount))}
                                        </p>
                                        <p className="text-[11px] text-[#22C55E] font-medium">
                                          {itemPct.toFixed(1)}%
                                        </p>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}

                      {/* Add Expense Button */}
                      <div className="p-4 border-t border-[#F3F4F6]">
                        <TemplateItemForm
                          templateId={template.id}
                          expenseCategories={expenseCategories}
                          budgetCategories={budgetCategories}
                          filterBudgetCategoryId={bc.id}
                          existingItemCategoryIds={existingCategoryIds}
                          onItemAdded={() => {}}
                        >
                          <Button
                            variant="outline"
                            className="h-11 w-full border-dashed border-[#D1D5DB] text-[#6B7280] hover:bg-[#F3F4F6]"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar gasto {hasMultipleGroups ? (groups[0]?.subcategoryName ? "fijo" : "variable") : ""}
                          </Button>
                        </TemplateItemForm>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Fixed Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F3F4F6] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[13px] text-[#6B7280] mb-0.5">Total</p>
            <p className="text-[18px] font-bold text-[#111111]">{formatCurrency(totalPlanned)}</p>
          </div>
          <Button
            className="h-9 bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white rounded-xl px-6"
            onClick={handleUseTemplate}
          >
            Usar plantilla
          </Button>
        </div>
      </div>
    </div>
  );
}
