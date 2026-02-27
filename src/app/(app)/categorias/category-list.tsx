"use client";

import { useState, useTransition } from "react";
import { ChevronRight, Pencil, Trash2, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CategoryForm } from "./category-form";
import {
  deleteExpenseCategory,
  type ExpenseCategoryWithRelations,
  type BudgetCategoryWithSubs,
} from "@/lib/actions/expense-categories";
import { cn } from "@/lib/utils";

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
  const [pending, startTransition] = useTransition();
  const [deletingCat, setDeletingCat] = useState<ExpenseCategoryWithRelations | null>(null);
  const [editingCat, setEditingCat] = useState<ExpenseCategoryWithRelations | null>(null);
  const [pressedRow, setPressedRow] = useState<string | null>(null);

  function handleDelete(id: string) {
    setDeletingCat(null);
    startTransition(async () => {
      await deleteExpenseCategory(id);
    });
  }

  function handleRowPress(id: string) {
    setPressedRow(id);
    setTimeout(() => setPressedRow(null), 150);
    setTimeout(() => setEditingCat(rows.find((c) => c.id === id) ?? null), 150);
  }

  if (rows.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-[15px] text-[#6B7280]">Sin categorías en este grupo.</p>
      </div>
    );
  }

  const groups = groupBySubcategory(rows);
  const showHeaders = groups.length > 1 || groups[0]?.subcategoryId !== null;

  return (
    <>
      <div className="space-y-8">
        {groups.map((group) => (
          <div key={group.subcategoryId ?? "_none"}>
            {showHeaders && group.label && (
              <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.8px] mb-6 mt-6 first:mt-0">
                {group.label}
              </p>
            )}
            <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden">
              {group.rows.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleRowPress(cat.id)}
                  className={cn(
                    "w-full flex items-center justify-between h-14 px-5 transition-colors",
                    pressedRow === cat.id ? "bg-[#F3F4F6]" : "bg-white hover:bg-[#F3F4F6]"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${cat.color}26`,
                      }}
                    >
                      <div
                        className="h-4 w-4 rounded"
                        style={{ backgroundColor: cat.color }}
                      />
                    </div>
                    <span className="text-[15px] font-medium text-[#111111] truncate">
                      {cat.name}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#6B7280] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

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

      <Dialog open={!!deletingCat} onOpenChange={(o) => !o && setDeletingCat(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[22px] font-semibold">Eliminar categoría</DialogTitle>
            <DialogDescription className="text-[15px] text-[#6B7280]">
              ¿Eliminar &quot;{deletingCat?.name}&quot;? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-6">
            <Button
              variant="outline"
              className="h-12 text-base flex-1 rounded-xl"
              onClick={() => setDeletingCat(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              className="h-12 text-base flex-1 rounded-xl bg-[#DC2626] hover:bg-[#DC2626]/90"
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
    <Tabs defaultValue={budgetCategories[0]?.id} className="w-full">
      <TabsList className="w-full bg-[#F3F4F6] p-1 h-auto rounded-2xl">
        {budgetCategories.map((bc) => {
          const count = categories.filter((c) => c.categoryId === bc.id).length;
          return (
            <TabsTrigger
              key={bc.id}
              value={bc.id}
              className="flex-1 rounded-xl h-10 text-[13px] font-medium data-[state=active]:bg-[#1C3D2E] data-[state=active]:text-white transition-all duration-200"
            >
              {bc.name}
              {count > 0 && (
                <span className="ml-1.5 text-xs opacity-70">({count})</span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {budgetCategories.map((bc) => {
        const rows = categories.filter((c) => c.categoryId === bc.id);
        return (
          <TabsContent key={bc.id} value={bc.id} className="mt-8">
            <TabContent rows={rows} budgetCategories={budgetCategories} />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
