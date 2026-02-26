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
import { deleteTemplate, deleteTemplateItem, type TemplateWithItems } from "@/lib/actions/templates";
import type { ExpenseCategoryWithRelations, BudgetCategoryWithSubs } from "@/lib/actions/expense-categories";

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
        {budgetCategories.map((bc) => {
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
                  onItemAdded={() => {
                    // The revalidation from the server action will refresh the page data
                  }}
                >
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    Agregar
                  </Button>
                </TemplateItemForm>
              </div>

              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground pl-1">Sin partidas.</p>
              ) : (
                <div className="space-y-1">
                  {items.map((item) => (
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
                        <span className="text-sm font-medium">
                          {formatCurrency(Number(item.plannedAmount))}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={pending}
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {bc !== budgetCategories[budgetCategories.length - 1] && (
                <Separator className="mt-4" />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
