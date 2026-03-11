"use client";

import { useTransition, useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ChevronDown, Pencil, MoreVertical, Copy, FileEdit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { deleteTemplate, deleteTemplateItem, duplicateTemplate, updateTemplate, type TemplateWithItems } from "@/lib/actions/templates";
import type { ExpenseCategoryWithRelations, BudgetCategoryWithSubs } from "@/lib/actions/expense-categories";
import { TemplateItemForm } from "./template-item-form";
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

const CATEGORY_COLORS: Record<string, string> = {
  Necesidades: "#3B82F6",
  Gustos: "#F59E0B",
  Ahorro: "#10B981",
};

export function TemplateCard({
  template,
  expenseCategories,
  budgetCategories,
  totalIncome,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [actionsSheetOpen, setActionsSheetOpen] = useState(false);
  const [duplicateSheetOpen, setDuplicateSheetOpen] = useState(false);
  const [renameSheetOpen, setRenameSheetOpen] = useState(false);
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
  const [duplicateName, setDuplicateName] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [editingItem, setEditingItem] = useState<{ id: string; expenseCategoryId: string; plannedAmount: number } | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const totalPlanned = template.items.reduce((sum, i) => sum + Number(i.plannedAmount), 0);
  const remaining = totalIncome - totalPlanned;

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

  function handleDuplicate() {
    setActionsSheetOpen(false);
    setDuplicateName(`${template.name} (Copia)`);
    setDuplicateSheetOpen(true);
  }

  function handleRename() {
    setActionsSheetOpen(false);
    setRenameValue(template.name);
    setRenameSheetOpen(true);
  }

  function handleDelete() {
    setActionsSheetOpen(false);
    setDeleteSheetOpen(true);
  }

  function handleConfirmDuplicate() {
    if (!duplicateName.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }
    setDuplicateSheetOpen(false);
    startTransition(async () => {
      const result = await duplicateTemplate(template.id, duplicateName.trim());
      if (result.success) {
        setDuplicateName("");
        router.refresh();
        setTimeout(() => {
          if (cardRef.current) {
            cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      } else {
        toast.error(result.error || "Error al duplicar la plantilla");
      }
    });
  }

  function handleConfirmRename() {
    if (!renameValue.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }
    if (renameValue.trim() === template.name) {
      setRenameSheetOpen(false);
      return;
    }
    setRenameSheetOpen(false);
    startTransition(async () => {
      const result = await updateTemplate(template.id, renameValue.trim());
      if (result.success) {
        setRenameValue("");
        router.refresh();
      } else {
        toast.error(result.error || "Error al renombrar la plantilla");
      }
    });
  }

  function handleConfirmDelete() {
    setDeleteSheetOpen(false);
    startTransition(async () => {
      const result = await deleteTemplate(template.id);
      if (result.success) {
        router.refresh();
      } else {
        toast.error(result.error || "Error al eliminar la plantilla");
      }
    });
  }

  function handleDeleteItem(itemId: string) {
    setSwipedItemId(null);
    startTransition(async () => {
      await deleteTemplateItem(itemId);
    });
  }

  function handleStartEdit(item: { id: string; expenseCategoryId: string; plannedAmount: number }) {
    setSwipedItemId(null);
    setEditingItem(item);
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

  useEffect(() => {
    if (expandedSections.size === 0) {
      const necesidadesCategory = budgetCategories.find((bc) => bc.name === "Necesidades");
      if (necesidadesCategory) {
        const items = template.items.filter((i) => i.expenseCategory.budgetCategory.id === necesidadesCategory.id);
        const gastosFijosItems = items.filter((i) => i.expenseCategory.subcategory?.name === "Gastos Fijos");
        if (gastosFijosItems.length > 0) {
          setTimeout(() => {
            setExpandedSections(new Set([`${necesidadesCategory.id}-gastos-fijos`]));
          }, 0);
          return;
        }
      }
      const firstWithData = budgetCategories.find((bc) => {
        const items = template.items.filter((i) => i.expenseCategory.budgetCategory.id === bc.id);
        return items.length > 0;
      });
      if (firstWithData) {
        setTimeout(() => {
          setExpandedSections(new Set([firstWithData.id]));
        }, 0);
      }
    }
  }, [expandedSections.size, budgetCategories, template.items]);

  const existingCategoryIds = template.items.map((i) => i.expenseCategory.id);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className="pb-6"
    >
      {/* Budget Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] p-6 mb-6"
      >
        <div className="mb-5 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-[20px] font-bold text-[#111111] mb-1">{template.name}</h2>
            <p className="text-[14px] text-[#6B7280]">Total asignado</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setActionsSheetOpen(true)}
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#F3F4F6] transition-colors shrink-0 ml-2"
          >
            <MoreVertical className="h-5 w-5 text-[#6B7280]" />
          </motion.button>
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

          {/* Category Progress Bars */}
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

      {/* Category Cards */}
      <div className="space-y-4">
        {budgetCategories.map((bc) => {
          const allItems = template.items.filter((i) => i.expenseCategory.budgetCategory.id === bc.id);
          const sectionTotal = categoryTotals[bc.id] ?? 0;
          const categoryColor = CATEGORY_COLORS[bc.name] || "#6B7280";
          const categoryPercentage = categoryPercentages[bc.id] ?? 0;

          const shouldSplitBySubcategory = bc.name === "Necesidades";

          if (shouldSplitBySubcategory) {
            const gastosFijosItems = allItems.filter((i) => i.expenseCategory.subcategory?.name === "Gastos Fijos");
            const gastosVariablesItems = allItems.filter((i) => i.expenseCategory.subcategory?.name === "Gastos Variables Necesarios");
            const itemsWithoutSubcategory = allItems.filter((i) => !i.expenseCategory.subcategory);

            const gastosFijosTotal = gastosFijosItems.reduce((sum, i) => sum + Number(i.plannedAmount), 0);
            const gastosVariablesTotal = gastosVariablesItems.reduce((sum, i) => sum + Number(i.plannedAmount), 0);
            const itemsWithoutSubcategoryTotal = itemsWithoutSubcategory.reduce((sum, i) => sum + Number(i.plannedAmount), 0);

            const subcategories = [
              {
                id: "gastos-fijos",
                name: "Gastos Fijos",
                items: gastosFijosItems,
                total: gastosFijosTotal,
                order: 1,
              },
              {
                id: "gastos-variables",
                name: "Gastos Variables Necesarios",
                items: gastosVariablesItems,
                total: gastosVariablesTotal,
                order: 2,
              },
            ].filter((sub) => sub.items.length > 0 || sub.total > 0);

            if (itemsWithoutSubcategory.length > 0) {
              subcategories.push({
                id: "sin-subcategoria",
                name: "Sin subcategoría",
                items: itemsWithoutSubcategory,
                total: itemsWithoutSubcategoryTotal,
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
                                {subcat.items.length > 0 && (
                                  <span className="text-[12px] text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full">
                                    {subcat.items.length} {subcat.items.length === 1 ? "gasto" : "gastos"}
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
                                {subcat.items.length === 0 ? (
                                  <div className="py-8 text-center">
                                    <p className="text-[14px] text-[#6B7280] mb-4">No hay gastos en esta subcategoría</p>
                                    <TemplateItemForm
                                      templateId={template.id}
                                      expenseCategories={expenseCategories}
                                      budgetCategories={budgetCategories}
                                      filterBudgetCategoryId={bc.id}
                                      existingItemCategoryIds={existingCategoryIds}
                                      currentCategoryTotal={subcat.total}
                                      onItemAdded={() => router.refresh()}
                                    >
                                      <div className="bg-[#F8F9FA] border-2 border-dashed border-[#E5E7EB] rounded-xl p-4 hover:bg-[#F3F4F6] transition-colors cursor-pointer">
                                        <div className="flex items-center justify-center gap-2 text-[#6B7280]">
                                          <Plus className="h-5 w-5" />
                                          <span className="text-[14px] font-medium">Agregar gasto</span>
                                        </div>
                                        <p className="text-[12px] text-[#9CA3AF] mt-1 text-center">Toca para agregar un gasto a esta subcategoría</p>
                                      </div>
                                    </TemplateItemForm>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    {subcat.items.map((item, index) => {
                                      const itemPct = subcat.total > 0 ? (Number(item.plannedAmount) / subcat.total) * 100 : 0;
                                      const isSwiped = swipedItemId === item.id;

                                      return (
                                        <motion.div
                                          key={item.id}
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          transition={{ duration: 0.2, delay: index * 0.03 }}
                                          data-item-id={item.id}
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
                                          <div className={cn(
                                            "absolute inset-y-0 right-0 flex items-center transition-transform duration-200 z-10",
                                            isSwiped ? "translate-x-0" : "translate-x-full"
                                          )}>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-full w-14 bg-[#3B82F6] hover:bg-[#2563EB] rounded-l-xl rounded-r-none"
                                              onClick={() => handleStartEdit({
                                                id: item.id,
                                                expenseCategoryId: item.expenseCategory.id,
                                                plannedAmount: Number(item.plannedAmount),
                                              })}
                                            >
                                              <Pencil className="h-4 w-4 text-white" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-full w-14 bg-[#DC2626] hover:bg-[#B91C1C] rounded-r-xl rounded-l-none"
                                              onClick={() => handleDeleteItem(item.id)}
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
                                                backgroundColor: `${item.expenseCategory.color}15`,
                                              }}
                                            >
                                              {getCategoryIcon(item.expenseCategory)}
                                            </div>

                                            <div className="flex-1 min-w-0 overflow-hidden">
                                              <p className="text-[15px] font-medium text-[#111111] truncate max-w-full">
                                                {item.expenseCategory.name}
                                              </p>
                                              <p className="text-[12px] text-[#6B7280] truncate">{itemPct.toFixed(1)}% de {subcat.name}</p>
                                            </div>

                                            <div className="text-right shrink-0">
                                              <p
                                                className="text-[16px] font-bold text-[#111111] tabular-nums cursor-pointer hover:text-[#1C3D2E] transition-colors"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleStartEdit({
                                                    id: item.id,
                                                    expenseCategoryId: item.expenseCategory.id,
                                                    plannedAmount: Number(item.plannedAmount),
                                                  });
                                                }}
                                              >
                                                {formatCurrency(Number(item.plannedAmount))}
                                              </p>
                                            </div>
                                          </div>
                                        </motion.div>
                                      );
                                    })}

                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: subcat.items.length * 0.03 }}
                                      className="mt-3"
                                    >
                                      <TemplateItemForm
                                        templateId={template.id}
                                        expenseCategories={expenseCategories}
                                        budgetCategories={budgetCategories}
                                        filterBudgetCategoryId={bc.id}
                                        existingItemCategoryIds={existingCategoryIds}
                                        currentCategoryTotal={subcat.total}
                                        onItemAdded={() => router.refresh()}
                                      >
                                        <div className="bg-[#F8F9FA] border-2 border-dashed border-[#E5E7EB] rounded-xl p-4 hover:bg-[#F3F4F6] transition-colors cursor-pointer">
                                          <div className="flex items-center justify-center gap-2 text-[#6B7280]">
                                            <Plus className="h-5 w-5" />
                                            <span className="text-[14px] font-medium">Agregar gasto</span>
                                          </div>
                                          <p className="text-[12px] text-[#9CA3AF] mt-1 text-center">Toca para agregar otro gasto a esta subcategoría</p>
                                        </div>
                                      </TemplateItemForm>
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
              {/* Category Card */}
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
                        {allItems.length > 0 && (
                          <span className="text-[12px] text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full">
                            {allItems.length} {allItems.length === 1 ? "gasto" : "gastos"}
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

                {/* Expanded Content */}
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
                        {allItems.length === 0 ? (
                          <div className="py-8 text-center">
                            <p className="text-[14px] text-[#6B7280] mb-4">No hay gastos en esta categoría</p>
                            <TemplateItemForm
                              templateId={template.id}
                              expenseCategories={expenseCategories}
                              budgetCategories={budgetCategories}
                              filterBudgetCategoryId={bc.id}
                              existingItemCategoryIds={existingCategoryIds}
                              currentCategoryTotal={sectionTotal}
                              onItemAdded={() => router.refresh()}
                            >
                              <div className="bg-[#F8F9FA] border-2 border-dashed border-[#E5E7EB] rounded-xl p-4 hover:bg-[#F3F4F6] transition-colors cursor-pointer">
                                <div className="flex items-center justify-center gap-2 text-[#6B7280]">
                                  <Plus className="h-5 w-5" />
                                  <span className="text-[14px] font-medium">Agregar gasto</span>
                                </div>
                                <p className="text-[12px] text-[#9CA3AF] mt-1 text-center">Toca para agregar un gasto a esta categoría</p>
                              </div>
                            </TemplateItemForm>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {allItems.map((item, index) => {
                              const itemPct = sectionTotal > 0 ? (Number(item.plannedAmount) / sectionTotal) * 100 : 0;
                              const isSwiped = swipedItemId === item.id;

                              return (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.2, delay: index * 0.03 }}
                                  data-item-id={item.id}
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
                                      className="h-full w-14 bg-[#3B82F6] hover:bg-[#2563EB] rounded-l-xl rounded-r-none"
                                      onClick={() => handleStartEdit({
                                        id: item.id,
                                        expenseCategoryId: item.expenseCategory.id,
                                        plannedAmount: Number(item.plannedAmount),
                                      })}
                                    >
                                      <Pencil className="h-4 w-4 text-white" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-full w-14 bg-[#DC2626] hover:bg-[#B91C1C] rounded-r-xl rounded-l-none"
                                      onClick={() => handleDeleteItem(item.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-white" />
                                    </Button>
                                  </div>

                                  {/* Main Row Content */}
                                  <div className={cn(
                                    "flex items-center gap-3 flex-1 transition-transform duration-200",
                                    isSwiped && "-translate-x-28"
                                  )}>
                                    {/* Icon Avatar */}
                                    <div
                                      className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-lg shadow-sm"
                                      style={{
                                        backgroundColor: `${item.expenseCategory.color}15`,
                                      }}
                                    >
                                      {getCategoryIcon(item.expenseCategory)}
                                    </div>

                                    {/* Name and Percentage */}
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                      <p className="text-[15px] font-medium text-[#111111] truncate max-w-full">
                                        {item.expenseCategory.name}
                                      </p>
                                      <p className="text-[12px] text-[#6B7280] truncate">{itemPct.toFixed(1)}% de {bc.name}</p>
                                    </div>

                                    {/* Amount */}
                                    <div className="text-right shrink-0">
                                      <p
                                        className="text-[16px] font-bold text-[#111111] tabular-nums cursor-pointer hover:text-[#1C3D2E] transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStartEdit({
                                            id: item.id,
                                            expenseCategoryId: item.expenseCategory.id,
                                            plannedAmount: Number(item.plannedAmount),
                                          });
                                        }}
                                      >
                                        {formatCurrency(Number(item.plannedAmount))}
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}

                            {/* Add Expense CTA */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: allItems.length * 0.03 }}
                              className="mt-3"
                            >
                              <TemplateItemForm
                                templateId={template.id}
                                expenseCategories={expenseCategories}
                                budgetCategories={budgetCategories}
                                filterBudgetCategoryId={bc.id}
                                existingItemCategoryIds={existingCategoryIds}
                                currentCategoryTotal={sectionTotal}
                                onItemAdded={() => router.refresh()}
                              >
                                <div className="bg-[#F8F9FA] border-2 border-dashed border-[#E5E7EB] rounded-xl p-4 hover:bg-[#F3F4F6] transition-colors cursor-pointer">
                                  <div className="flex items-center justify-center gap-2 text-[#6B7280]">
                                    <Plus className="h-5 w-5" />
                                    <span className="text-[14px] font-medium">Agregar gasto</span>
                                  </div>
                                  <p className="text-[12px] text-[#9CA3AF] mt-1 text-center">Toca para agregar otro gasto a esta categoría</p>
                                </div>
                              </TemplateItemForm>
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

      {/* Edit Item Sheet */}
      {editingItem && (
        <TemplateItemForm
          templateId={template.id}
          expenseCategories={expenseCategories}
          budgetCategories={budgetCategories}
          filterBudgetCategoryId={expenseCategories.find((c) => c.id === editingItem.expenseCategoryId)?.budgetCategory.id}
          existingItemCategoryIds={existingCategoryIds}
          currentCategoryTotal={(() => {
            const budgetCatId = expenseCategories.find((c) => c.id === editingItem.expenseCategoryId)?.budgetCategory.id;
            if (!budgetCatId) return 0;
            return template.items
              .filter((i) => i.expenseCategory.budgetCategory.id === budgetCatId)
              .reduce((sum, i) => sum + Number(i.plannedAmount), 0);
          })()}
          editingItem={{
            expenseCategoryId: editingItem.expenseCategoryId,
            plannedAmount: editingItem.plannedAmount,
          }}
          open={editingItem !== null}
          onOpenChange={(open) => {
            if (!open) {
              setEditingItem(null);
            }
          }}
          onItemAdded={() => {
            setEditingItem(null);
            router.refresh();
          }}
        >
          <span className="sr-only" />
        </TemplateItemForm>
      )}

      {/* Actions Sheet */}
      <ResponsiveSheet open={actionsSheetOpen} onOpenChange={setActionsSheetOpen} title={template.name}>
        <div className="px-6 pb-6 space-y-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleDuplicate}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-[#F3F4F6] transition-colors text-left"
          >
            <Copy className="h-5 w-5 text-[#6B7280]" />
            <span className="text-[15px] font-medium text-[#111111]">Duplicar plantilla</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleRename}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-[#F3F4F6] transition-colors text-left"
          >
            <FileEdit className="h-5 w-5 text-[#6B7280]" />
            <span className="text-[15px] font-medium text-[#111111]">Renombrar plantilla</span>
          </motion.button>
          <Separator className="my-2" />
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleDelete}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-[#FEE2E2] transition-colors text-left"
          >
            <Trash2 className="h-5 w-5 text-[#DC2626]" />
            <span className="text-[15px] font-medium text-[#DC2626]">Eliminar plantilla</span>
          </motion.button>
        </div>
        <div className="px-6 pb-6">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setActionsSheetOpen(false)}
            className="w-full h-12 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] transition-colors text-[15px] font-medium text-[#111111]"
          >
            Cancelar
          </motion.button>
        </div>
      </ResponsiveSheet>

      {/* Duplicate Sheet */}
      <ResponsiveSheet open={duplicateSheetOpen} onOpenChange={setDuplicateSheetOpen} title="Duplicar plantilla">
        <div className="px-6 pb-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[14px] font-medium text-[#111111]">Nombre de la plantilla</label>
            <Input
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              placeholder="Nombre de la plantilla"
              className="h-12 text-[15px]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirmDuplicate();
                }
              }}
            />
          </div>
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setDuplicateSheetOpen(false)}
              className="flex-1 h-12 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] transition-colors text-[15px] font-medium text-[#111111]"
            >
              Cancelar
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleConfirmDuplicate}
              disabled={pending || !duplicateName.trim()}
              className="flex-1 h-12 rounded-xl bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white transition-colors text-[15px] font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear duplicado
            </motion.button>
          </div>
        </div>
      </ResponsiveSheet>

      {/* Rename Sheet */}
      <ResponsiveSheet open={renameSheetOpen} onOpenChange={setRenameSheetOpen} title="Renombrar plantilla">
        <div className="px-6 pb-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[14px] font-medium text-[#111111]">Nombre de la plantilla</label>
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Nombre de la plantilla"
              className="h-12 text-[15px]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirmRename();
                }
              }}
            />
          </div>
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setRenameSheetOpen(false)}
              className="flex-1 h-12 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] transition-colors text-[15px] font-medium text-[#111111]"
            >
              Cancelar
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleConfirmRename}
              disabled={pending || !renameValue.trim()}
              className="flex-1 h-12 rounded-xl bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white transition-colors text-[15px] font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar
            </motion.button>
          </div>
        </div>
      </ResponsiveSheet>

      {/* Delete Sheet */}
      <ResponsiveSheet open={deleteSheetOpen} onOpenChange={setDeleteSheetOpen} title="Eliminar plantilla">
        <div className="px-6 pb-6 space-y-6">
          <div className="space-y-3">
            <p className="text-[15px] text-[#111111]">
              ¿Estás seguro de que quieres eliminar esta plantilla?
            </p>
            <div className="p-4 bg-[#FEF3C7] border border-[#FCD34D] rounded-xl">
              <p className="text-[14px] font-medium text-[#92400E]">
                &quot;{template.name}&quot;
              </p>
            </div>
            <p className="text-[13px] text-[#DC2626] font-medium">
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setDeleteSheetOpen(false)}
              className="flex-1 h-12 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] transition-colors text-[15px] font-medium text-[#111111]"
            >
              Cancelar
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleConfirmDelete}
              disabled={pending}
              className="flex-1 h-12 rounded-xl bg-[#DC2626] hover:bg-[#DC2626]/90 text-white transition-colors text-[15px] font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Eliminar plantilla
            </motion.button>
          </div>
        </div>
      </ResponsiveSheet>

      {/* Bottom Summary Bar */}
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
          <Button
            className="w-full h-12 bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white rounded-xl font-medium"
            onClick={handleUseTemplate}
          >
            Crear presupuesto
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
