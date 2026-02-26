"use client";

import { useState, useTransition } from "react";
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
import type { ExpenseCategoryWithRelations } from "@/lib/actions/expense-categories";

type Props = {
  template: TemplateWithItems;
  expenseCategories: ExpenseCategoryWithRelations[];
  totalIncome: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

export function TemplateCard({ template, expenseCategories, totalIncome }: Props) {
  const [pending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const totalPlanned = template.items.reduce((sum, i) => sum + Number(i.plannedAmount), 0);
  const percentOfIncome = totalIncome > 0 ? ((totalPlanned / totalIncome) * 100).toFixed(1) : "—";

  function handleDeleteTemplate() {
    setDeleteOpen(false);
    startTransition(async () => {
      const result = await deleteTemplate(template.id);
      if (result.success) {
        toast.success("Plantilla eliminada");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDeleteItem(itemId: string) {
    startTransition(async () => {
      const result = await deleteTemplateItem(itemId);
      if (!result.success) toast.error(result.error);
    });
  }

  const grouped = Object.entries(
    template.items.reduce<Record<string, typeof template.items>>((acc, item) => {
      const key = item.expenseCategory.budgetCategory.name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {})
  );

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
          <div className="flex items-center gap-1">
            <TemplateItemForm templateId={template.id} expenseCategories={expenseCategories}>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </TemplateItemForm>
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
                  <Button variant="destructive" disabled={pending} onClick={handleDeleteTemplate}>Eliminar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      {template.items.length > 0 && (
        <CardContent>
          <Separator className="mb-4" />
          <div className="space-y-4">
            {grouped.map(([categoryName, items]) => (
              <div key={categoryName}>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  {categoryName}
                </p>
                <div className="space-y-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.expenseCategory.color }}
                        />
                        <span className="text-sm">{item.expenseCategory.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{formatCurrency(Number(item.plannedAmount))}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={pending}
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
        </CardContent>
      )}
    </Card>
  );
}
