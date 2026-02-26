"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

type Props = {
  template: TemplateWithItems;
  expenseCategories: ExpenseCategoryWithRelations[];
  budgetCategories: BudgetCategoryWithSubs[];
  totalIncome: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

export function TemplateCard({
  template,
  expenseCategories: initialExpenseCategories,
  budgetCategories,
  totalIncome,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState<string>("");
  const expenseCategories = initialExpenseCategories;

  const totalPlanned = template.items.reduce((sum, i) => sum + Number(i.plannedAmount), 0);
  const percentOfIncome = totalIncome > 0 ? ((totalPlanned / totalIncome) * 100).toFixed(1) : "—";

  function handleDeleteTemplate() {
    setDeleteOpen(false);
    startTransition(async () => {
      const result = await deleteTemplate(template.id);
      if (!result.success) toast.error(result.error);
    });
  }

  function handleDeleteItem(itemId: string) {
    startTransition(async () => {
      const result = await deleteTemplateItem(itemId);
      if (!result.success) toast.error(result.error);
    });
  }

  function handleStartEdit(itemId: string, currentAmount: number) {
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
      toast.error("El monto debe ser un número positivo");
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
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{template.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Total: {formatCurrency(totalPlanned)}
              {totalIncome > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {percentOfIncome}% del ingreso
                </Badge>
              )}
            </p>
          </div>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4 text-destructive" />
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
      </CardHeader>

      <CardContent className="space-y-5">
        <Separator />
        {/* Get all expense category IDs already in the template */}
        {(() => {
          const existingCategoryIds = template.items.map((i) => i.expenseCategory.id);
          return budgetCategories.map((bc) => {
            const items = template.items.filter(
              (i) => i.expenseCategory.budgetCategory.id === bc.id
            );
            const sectionTotal = items.reduce((sum, i) => sum + Number(i.plannedAmount), 0);
            const sectionPercent =
              totalIncome > 0 ? ((sectionTotal / totalIncome) * 100).toFixed(1) : null;

            return (
              <div key={bc.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {bc.name}
                    </p>
                    {sectionTotal > 0 && (
                      <Badge variant="outline" className="text-xs font-normal">
                        {formatCurrency(sectionTotal)}
                        {sectionPercent && ` · ${sectionPercent}%`}
                      </Badge>
                    )}
                  </div>
                  <TemplateItemForm
                    templateId={template.id}
                    expenseCategories={expenseCategories}
                    budgetCategories={budgetCategories}
                    filterBudgetCategoryId={bc.id}
                    existingItemCategoryIds={existingCategoryIds}
                    onItemAdded={() => {
                      // The revalidation from the server action will refresh the page data
                    }}
                  >
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                      <Plus className="h-3.5 w-3.5 sm:mr-1" />
                      <span className="hidden sm:inline">Agregar</span>
                    </Button>
                  </TemplateItemForm>
                </div>

                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground pl-1">Sin gastos.</p>
                ) : (() => {
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
                  // Sort: subcategories first (alphabetically), then items without subcategory
                  groups.sort((a, b) => {
                    if (a.subcategoryId === null && b.subcategoryId !== null) return 1;
                    if (a.subcategoryId !== null && b.subcategoryId === null) return -1;
                    if (a.subcategoryName && b.subcategoryName) {
                      return a.subcategoryName.localeCompare(b.subcategoryName, "es-MX");
                    }
                    return 0;
                  });

                  // Sort items alphabetically within each group and calculate totals
                  groups.forEach((group) => {
                    group.items.sort((a, b) =>
                      a.expenseCategory.name.localeCompare(b.expenseCategory.name, "es-MX")
                    );
                    group.subcategoryTotal = group.items.reduce(
                      (sum, item) => sum + Number(item.plannedAmount),
                      0
                    );
                  });

                  const hasMultipleGroups = groups.length > 1 || groups[0]?.subcategoryId !== null;

                  return (
                    <div className="space-y-3">
                      {groups.map((group) => (
                        <div key={group.subcategoryId ?? "_none"}>
                          {hasMultipleGroups && group.subcategoryName && (
                            <div className="flex items-center justify-between mb-1.5 px-1">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {group.subcategoryName}
                              </p>
                              <Badge variant="outline" className="text-xs font-normal">
                                {formatCurrency(group.subcategoryTotal)}
                              </Badge>
                            </div>
                          )}
                          <div className="space-y-1">
                            {group.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 group"
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className="h-3 w-3 rounded-full shrink-0"
                                    style={{ backgroundColor: item.expenseCategory.color }}
                                  />
                                  <span className="text-sm">{item.expenseCategory.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
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
                                      className="h-7 w-24 text-sm"
                                      autoFocus
                                    />
                                  ) : (
                                    <span
                                      className="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
                                      onClick={() => handleStartEdit(item.id, Number(item.plannedAmount))}
                                    >
                                      {formatCurrency(Number(item.plannedAmount))}
                                    </span>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                    disabled={pending || editingItemId === item.id}
                                    onClick={() => handleDeleteItem(item.id)}
                                  >
                                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {bc !== budgetCategories[budgetCategories.length - 1] && (
                  <Separator className="mt-4" />
                )}
              </div>
            );
          });
        })()}
      </CardContent>
    </Card>
  );
}
