"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CategoryForm } from "./category-form";
import { deleteExpenseCategory, type ExpenseCategoryWithRelations, type BudgetCategoryWithSubs } from "@/lib/actions/expense-categories";

type Props = {
  categories: ExpenseCategoryWithRelations[];
  budgetCategories: BudgetCategoryWithSubs[];
};

export function CategoryList({ categories, budgetCategories }: Props) {
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleDelete(id: string) {
    setDeletingId(null);
    startTransition(async () => {
      const result = await deleteExpenseCategory(id);
      if (result.success) {
        toast.success("Categoría eliminada");
      } else {
        toast.error(result.error);
      }
    });
  }

  const grouped = budgetCategories.map((bc) => ({
    budgetCategory: bc,
    expenseCategories: categories.filter((c) => c.categoryId === bc.id),
  })).filter((g) => g.expenseCategories.length > 0);

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No tienes categorías de gastos aún.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Crea tu primera categoría para empezar a organizar tus gastos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map(({ budgetCategory, expenseCategories }) => (
        <Card key={budgetCategory.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{budgetCategory.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {expenseCategories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <p className="text-sm font-medium">{cat.name}</p>
                    {cat.subcategory && (
                      <Badge variant="secondary" className="text-xs mt-0.5">
                        {cat.subcategory.name}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <CategoryForm budgetCategories={budgetCategories} expenseCategory={cat}>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </CategoryForm>
                  <Dialog open={deletingId === cat.id} onOpenChange={(o) => !o && setDeletingId(null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingId(cat.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Eliminar categoría</DialogTitle>
                        <DialogDescription>
                          ¿Eliminar &quot;{cat.name}&quot;? Esta acción no se puede deshacer.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingId(null)}>Cancelar</Button>
                        <Button variant="destructive" disabled={pending} onClick={() => handleDelete(cat.id)}>Eliminar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
