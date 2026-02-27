"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CategoryForm } from "./category-form";
import { useIsMobile } from "@/hooks/use-is-mobile";
import {
  deleteExpenseCategory,
  type ExpenseCategoryWithRelations,
  type BudgetCategoryWithSubs,
} from "@/lib/actions/expense-categories";

type Props = {
  categories: ExpenseCategoryWithRelations[];
  budgetCategories: BudgetCategoryWithSubs[];
  onAddCategory?: () => void;
};

type SubGroup = {
  subcategoryId: string | null;
  label: string | null;
  rows: ExpenseCategoryWithRelations[];
};

function groupBySubcategory(rows: ExpenseCategoryWithRelations[]): SubGroup[] {
  const sortedRows = [...rows].sort((a, b) => a.name.localeCompare(b.name, "es"));
  const map = new Map<string | null, ExpenseCategoryWithRelations[]>();
  for (const row of sortedRows) {
    const key = row.subcategoryId ?? null;
    const existing = map.get(key) ?? [];
    existing.push(row);
    map.set(key, existing);
  }
  return Array.from(map.entries())
    .map(([key, items]) => ({
      subcategoryId: key,
      label: items[0]?.subcategory?.name ?? null,
      rows: items,
    }))
    .sort((a, b) => {
      if (a.label === null && b.label === null) return 0;
      if (a.label === null) return 1;
      if (b.label === null) return -1;
      return a.label.localeCompare(b.label, "es");
    });
}

function TabContent({
  rows,
  budgetCategories,
}: {
  rows: ExpenseCategoryWithRelations[];
  budgetCategories: BudgetCategoryWithSubs[];
}) {
  const isMobile = useIsMobile();
  const [pending, startTransition] = useTransition();
  const [deletingCat, setDeletingCat] = useState<ExpenseCategoryWithRelations | null>(null);
  const [editingCat, setEditingCat] = useState<ExpenseCategoryWithRelations | null>(null);
  const [mobileActionCat, setMobileActionCat] = useState<ExpenseCategoryWithRelations | null>(null);

  function handleDelete(id: string) {
    setDeletingCat(null);
    startTransition(async () => {
      const result = await deleteExpenseCategory(id);
      if (result.success) {
        toast.success("Categoría eliminada");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleMobileEdit() {
    const cat = mobileActionCat;
    setMobileActionCat(null);
    setTimeout(() => setEditingCat(cat), 150);
  }

  function handleMobileDelete() {
    const cat = mobileActionCat;
    setMobileActionCat(null);
    setTimeout(() => setDeletingCat(cat), 150);
  }

  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Sin categorías en este grupo.
      </p>
    );
  }

  const groups = groupBySubcategory(rows);
  const showHeaders = groups.length > 1 || groups[0]?.subcategoryId !== null;

  return (
    <>
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.subcategoryId ?? "_none"}>
            {showHeaders && group.label && (
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                {group.label}
              </p>
            )}
            <div className="divide-y rounded-lg border overflow-hidden">
              {group.rows.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/40 transition-colors"
                  role={isMobile ? "button" : undefined}
                  tabIndex={isMobile ? 0 : undefined}
                  onClick={isMobile ? () => setMobileActionCat(cat) : undefined}
                  onKeyDown={
                    isMobile
                      ? (e) => e.key === "Enter" && setMobileActionCat(cat)
                      : undefined
                  }
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm font-medium truncate">{cat.name}</span>
                  </div>

                  {!isMobile && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingCat(cat)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeletingCat(cat)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Programmatic edit form (desktop three-dot or mobile action) */}
      {editingCat && (
        <CategoryForm
          budgetCategories={budgetCategories}
          expenseCategory={editingCat}
          open={!!editingCat}
          onOpenChange={(o) => !o && setEditingCat(null)}
        >
          <span className="sr-only" />
        </CategoryForm>
      )}

      {/* Mobile action sheet */}
      <Sheet
        open={!!mobileActionCat}
        onOpenChange={(o) => !o && setMobileActionCat(null)}
      >
        <SheetContent side="bottom" className="rounded-t-2xl pb-8 px-4">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2 text-base">
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: mobileActionCat?.color }}
              />
              {mobileActionCat?.name}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 text-base"
              onClick={handleMobileEdit}
            >
              <Pencil className="h-5 w-5" />
              Editar
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 text-base text-destructive hover:text-destructive"
              onClick={handleMobileDelete}
            >
              <Trash2 className="h-5 w-5" />
              Eliminar
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <Dialog open={!!deletingCat} onOpenChange={(o) => !o && setDeletingCat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar categoría</DialogTitle>
            <DialogDescription>
              ¿Eliminar &quot;{deletingCat?.name}&quot;? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="h-12 text-base flex-1" onClick={() => setDeletingCat(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              className="h-12 text-base flex-1"
              onClick={() => deletingCat && handleDelete(deletingCat.id)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function CategoryList({ categories, budgetCategories, onAddCategory }: Props) {
  if (categories.length === 0) {
    return (
      <EmptyState
        icon={Tags}
        title="Crea tu primera categoría"
        description="Organiza tus gastos en categorías personalizadas para tener un mejor control de tus finanzas."
        action={
          onAddCategory
            ? {
                label: "Crear categoría",
                onClick: onAddCategory,
              }
            : undefined
        }
      />
    );
  }

  return (
    <Tabs defaultValue={budgetCategories[0]?.id}>
      <TabsList className="w-full">
        {budgetCategories.map((bc) => {
          const count = categories.filter((c) => c.categoryId === bc.id).length;
          return (
            <TabsTrigger key={bc.id} value={bc.id} className="flex-1">
              {bc.name}
              {count > 0 && (
                <span className="ml-1.5 text-xs text-muted-foreground">({count})</span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {budgetCategories.map((bc) => {
        const rows = categories.filter((c) => c.categoryId === bc.id);
        return (
          <TabsContent key={bc.id} value={bc.id} className="mt-4">
            <TabContent rows={rows} budgetCategories={budgetCategories} />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
