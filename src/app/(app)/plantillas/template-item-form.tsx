"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { CategoryForm } from "@/app/(app)/categorias/category-form";
import { cn } from "@/lib/utils";
import { upsertTemplateItem } from "@/lib/actions/templates";
import type {
  ExpenseCategoryWithRelations,
  BudgetCategoryWithSubs,
} from "@/lib/actions/expense-categories";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const schema = z.object({
  expenseCategoryId: z.string().min(1, "Selecciona una categoría"),
  plannedAmount: z.coerce.number().positive("El monto debe ser positivo"),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  templateId: string;
  expenseCategories: ExpenseCategoryWithRelations[];
  budgetCategories: BudgetCategoryWithSubs[];
  filterBudgetCategoryId?: string;
  existingItemCategoryIds?: string[];
  children: React.ReactNode;
  onItemAdded?: () => void;
  editingItem?: {
    expenseCategoryId: string;
    plannedAmount: number;
  } | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  currentCategoryTotal?: number;
};

export function TemplateItemForm({
  templateId,
  expenseCategories: initialExpenseCategories,
  budgetCategories,
  filterBudgetCategoryId,
  existingItemCategoryIds = [],
  children,
  onItemAdded,
  editingItem = null,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  currentCategoryTotal = 0,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (val: boolean) => {
    if (controlledOnOpenChange) {
      controlledOnOpenChange(val);
    } else {
      setInternalOpen(val);
    }
  };
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);

  // First filter by budget category, then exclude already added categories (unless editing)
  const filteredCategories = (filterBudgetCategoryId
    ? initialExpenseCategories.filter((c) => c.budgetCategory.id === filterBudgetCategoryId)
    : initialExpenseCategories
  ).filter((c) => {
    // If editing, include the current category; otherwise exclude existing ones
    if (editingItem && c.id === editingItem.expenseCategoryId) return true;
    return !existingItemCategoryIds.includes(c.id);
  });

  const form = useForm<FormValues, unknown, FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      expenseCategoryId: editingItem?.expenseCategoryId ?? "",
      plannedAmount: editingItem?.plannedAmount ?? 0,
    },
  });

  const amount = useWatch({ control: form.control, name: "plannedAmount" });
  const selectedCategoryId = useWatch({ control: form.control, name: "expenseCategoryId" });
  const [amountInputValue, setAmountInputValue] = useState<string>("");

  const previewTotal = useMemo(() => {
    if (editingItem) {
      return currentCategoryTotal - editingItem.plannedAmount + amount;
    }
    return currentCategoryTotal + amount;
  }, [currentCategoryTotal, amount, editingItem]);

  useEffect(() => {
    if (open) {
      // Reset form with editing item data when opening
      if (editingItem) {
        form.reset({
          expenseCategoryId: editingItem.expenseCategoryId,
          plannedAmount: editingItem.plannedAmount,
        });
        setAmountInputValue(editingItem.plannedAmount > 0 ? editingItem.plannedAmount.toString() : "");
      } else {
        setAmountInputValue("");
      }
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    } else {
      form.reset({
        expenseCategoryId: "",
        plannedAmount: 0,
      });
      setAmountInputValue("");
    }
  }, [open, editingItem, form]);

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) {
      form.reset();
    }
  }

  // When new category is created, refresh the list
  // The CategoryForm will handle creation and we'll get updated list via parent refresh

  async function onSubmit(values: FormValues) {
    const result = await upsertTemplateItem(templateId, values);
    if (result.success) {
      onItemAdded?.();
      handleOpenChange(false);
    }
  }

  const activeBudgetCat = filterBudgetCategoryId
    ? budgetCategories.find((b) => b.id === filterBudgetCategoryId)
    : undefined;

  const canSubmit = amount > 0 && selectedCategoryId && !form.formState.isSubmitting;

  return (
    <>
      <ResponsiveSheet
        open={open}
        onOpenChange={handleOpenChange}
        title=""
        trigger={children}
        showDragHandle={true}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
            {/* Custom Header */}
            <div className="px-4 pt-5 pb-0">
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-[18px] font-bold text-[#111111]">
                  {editingItem ? "Editar gasto" : "Agregar gasto"}
                </h2>
                {activeBudgetCat && (
                  <span className="bg-[#EAF2EC] text-[#1C3D2E] text-[12px] font-medium px-[10px] py-1 rounded-[99px]">
                    {activeBudgetCat.name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Amount Hero Field */}
              <div className="pt-8 pb-6 px-4">
                <FormField
                  control={form.control}
                  name="plannedAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <motion.div
                            animate={{ scale: amountFocused ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-center"
                          >
                            <span className="text-[32px] text-[#6B7280] mr-3 font-medium">$</span>
                            <input
                              ref={amountInputRef}
                              type="text"
                              inputMode="decimal"
                              placeholder="0"
                              value={amountInputValue}
                              onFocus={() => {
                                setAmountFocused(true);
                                if (amount > 0 && amountInputValue === "") {
                                  setAmountInputValue(amount.toString());
                                }
                              }}
                              onBlur={() => {
                                setAmountFocused(false);
                                const numValue = parseFloat(amountInputValue) || 0;
                                field.onChange(numValue);
                                setAmountInputValue(numValue > 0 ? numValue.toString() : "");
                              }}
                              onChange={(e) => {
                                const rawValue = e.target.value;
                                if (rawValue === "" || /^\d*\.?\d*$/.test(rawValue)) {
                                  setAmountInputValue(rawValue);
                                  const numValue = parseFloat(rawValue) || 0;
                                  field.onChange(numValue);
                                }
                              }}
                              className={cn(
                                "w-full text-center bg-transparent border-none outline-none focus:outline-none",
                                "text-[56px] font-bold tabular-nums",
                                "placeholder:text-[#D1D5DB] placeholder:text-[56px]",
                                amountFocused ? "text-[#1C3D2E]" : "text-[#111111]",
                                "transition-colors"
                              )}
                            />
                            <span className="text-[14px] text-[#6B7280] ml-3 mt-4 font-medium">MXN</span>
                          </motion.div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Quick Amount Suggestions */}
                {!amountInputValue && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center gap-2 mt-6"
                  >
                    {[500, 1000, 2000].map((suggestion) => (
                      <motion.button
                        key={suggestion}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setAmountInputValue(suggestion.toString());
                          form.setValue("plannedAmount", suggestion);
                        }}
                        className="px-4 py-2 text-[14px] font-medium text-[#6B7280] bg-[#F3F4F6] rounded-xl hover:bg-[#E5E7EB] transition-colors"
                      >
                        ${suggestion.toLocaleString()}
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {/* Real-time Preview */}
                {amount > 0 && filterBudgetCategoryId && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-[#6B7280]">Total de {activeBudgetCat?.name}</span>
                      <div className="text-right">
                        <span className="text-[16px] font-bold text-[#111111]">{formatCurrency(previewTotal)}</span>
                        {currentCategoryTotal > 0 && (
                          <p className="text-[11px] text-[#6B7280] mt-0.5">
                            {amount > 0 && (
                              <span className={editingItem ? "text-[#3B82F6]" : "text-[#10B981]"}>
                                {editingItem ? "Actualizado" : "+"}{formatCurrency(editingItem ? amount - editingItem.plannedAmount : amount)}
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="h-px bg-[#F3F4F6]" />

              {/* Category Pills */}
              <div className="px-4 py-5">
                <p className="text-[12px] text-[#6B7280] font-medium mb-4">Selecciona una categoría</p>
                <div
                  className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  onTouchStart={() => {
                    // Dismiss keyboard when scrolling categories
                    amountInputRef.current?.blur();
                  }}
                >
                  {filteredCategories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          form.setValue("expenseCategoryId", cat.id);
                        }}
                        className={cn(
                          "h-9 px-[14px] rounded-[99px] flex items-center shrink-0 transition-all font-medium",
                          isSelected
                            ? "border border-current"
                            : "bg-[#F3F4F6] text-[#6B7280] border border-transparent"
                        )}
                        style={
                          isSelected
                            ? {
                              backgroundColor: `${cat.color}15`,
                              color: cat.color,
                              borderColor: cat.color,
                            }
                            : {}
                        }
                      >
                        <span className="text-sm">{cat.name}</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setNewCategoryOpen(true)}
                    className="h-9 px-[14px] rounded-[99px] flex items-center shrink-0 border border-dashed border-[#D1D5DB] text-[#6B7280] bg-transparent hover:bg-[#F3F4F6] transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span className="text-sm">Nueva</span>
                  </button>
                </div>
                <FormField
                  control={form.control}
                  name="expenseCategoryId"
                  render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="sticky bottom-0 bg-white border-t border-[#F3F4F6] px-4 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              <Button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "w-full h-[52px] text-base font-bold rounded-[14px] text-white transition-all",
                  canSubmit
                    ? "bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 active:scale-[0.98]"
                    : "bg-[#9CA3AF] opacity-50"
                )}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Agregando...
                  </>
                ) : (
                  editingItem ? "Guardar cambios" : "Agregar gasto"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </ResponsiveSheet>

      {/* New Category Sheet */}
      <CategoryForm
        budgetCategories={budgetCategories}
        defaultCategoryId={filterBudgetCategoryId}
        open={newCategoryOpen}
        onOpenChange={(isOpen) => {
          setNewCategoryOpen(isOpen);
          if (!isOpen) {
            // Refresh categories when new one is created
            // The CategoryForm will handle the creation and we'll get updated list via props
          }
        }}
      >
        <span className="sr-only" />
      </CategoryForm>
    </>
  );
}
