"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { cn } from "@/lib/utils";
import { upsertTemplateItem } from "@/lib/actions/templates";
import { createExpenseCategory } from "@/lib/actions/expense-categories";
import type {
  ExpenseCategoryWithRelations,
  BudgetCategoryWithSubs,
} from "@/lib/actions/expense-categories";
import { EXPENSE_COLORS } from "@/lib/colors";

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
  existingItemCategoryIds?: string[]; // Expense category IDs already in the template
  children: React.ReactNode;
  onItemAdded?: () => void;
};

export function TemplateItemForm({
  templateId,
  expenseCategories: initialExpenseCategories,
  budgetCategories,
  filterBudgetCategoryId,
  existingItemCategoryIds = [],
  children,
  onItemAdded,
}: Props) {
  const [open, setOpen] = useState(false);
  const [showNewCat, setShowNewCat] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState(initialExpenseCategories);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(EXPENSE_COLORS[0].value);
  const [newCatBudgetId, setNewCatBudgetId] = useState(filterBudgetCategoryId ?? "");
  const [creatingCat, startCreatingCat] = useTransition();

  // First filter by budget category, then exclude already added categories
  const filteredCategories = (filterBudgetCategoryId
    ? expenseCategories.filter((c) => c.categoryId === filterBudgetCategoryId)
    : expenseCategories
  ).filter((c) => !existingItemCategoryIds.includes(c.id));

  const form = useForm<FormValues, unknown, FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: { expenseCategoryId: "", plannedAmount: 0 },
  });

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) {
      form.reset();
      setShowNewCat(false);
      setNewCatName("");
      setNewCatColor(EXPENSE_COLORS[0].value);
      setNewCatBudgetId(filterBudgetCategoryId ?? "");
    }
  }

  function handleCreateCategory() {
    if (!newCatName.trim() || !newCatBudgetId) return;
    startCreatingCat(async () => {
      const result = await createExpenseCategory({
        name: newCatName.trim(),
        color: newCatColor,
        categoryId: newCatBudgetId,
      });
      if (!result.success) {
        return;
      }
      const budgetCat = budgetCategories.find((b) => b.id === newCatBudgetId)!;
      const newCat: ExpenseCategoryWithRelations = {
        ...result.data,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        budgetCategory: budgetCat as any,
        subcategory: null,
      };
      setExpenseCategories((prev) => [...prev, newCat]);
      form.setValue("expenseCategoryId", newCat.id, { shouldValidate: true });
      setShowNewCat(false);
      setNewCatName("");
      setNewCatColor(EXPENSE_COLORS[0].value);
      setNewCatBudgetId(filterBudgetCategoryId ?? "");
    });
  }

  async function onSubmit(values: FormValues) {
    const result = await upsertTemplateItem(templateId, values);
    if (result.success) {
      onItemAdded?.();
      handleOpenChange(false);
    } else {
      toast.error(result.error);
    }
  }

  const activeBudgetCatName = filterBudgetCategoryId
    ? budgetCategories.find((b) => b.id === filterBudgetCategoryId)?.name
    : undefined;

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={handleOpenChange}
      title={`Agregar gasto${activeBudgetCatName ? ` · ${activeBudgetCatName}` : ""}`}
      trigger={children}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="expenseCategoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría de gasto</FormLabel>
                {filteredCategories.length === 0 && !showNewCat ? (
                  <p className="text-sm text-muted-foreground">
                    No hay categorías de gasto{activeBudgetCatName ? ` en ${activeBudgetCatName}` : ""}.{" "}
                    <button
                      type="button"
                      className="underline text-foreground"
                      onClick={() => setShowNewCat(true)}
                    >
                      Crea una aquí
                    </button>
                  </p>
                ) : (
                  <div>
                    <Combobox
                      items={filteredCategories.map((c) => c.id)}
                      value={field.value || null}
                      onValueChange={(id: string | null) => {
                        if (id) {
                          field.onChange(id);
                        }
                      }}
                      itemToStringLabel={(id: string) => {
                        const cat = filteredCategories.find((c) => c.id === id);
                        return cat?.name || "";
                      }}
                      itemToStringValue={(id: string) => {
                        const cat = filteredCategories.find((c) => c.id === id);
                        return cat?.name || "";
                      }}
                    >
                      <ComboboxInput
                        placeholder="Buscar categoría..."
                        showClear
                        className="w-full"
                      />
                      <ComboboxContent className="z-100">
                        <ComboboxEmpty>No se encontraron categorías.</ComboboxEmpty>
                        <ComboboxList>
                          {(id: string) => {
                            const cat = filteredCategories.find((c) => c.id === id);
                            if (!cat) return null;
                            return (
                              <ComboboxItem
                                key={cat.id}
                                value={cat.id}
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className="h-3 w-3 rounded-full shrink-0"
                                    style={{ backgroundColor: cat.color }}
                                  />
                                  <span>{cat.name}</span>
                                  {!filterBudgetCategoryId && (
                                    <span className="text-muted-foreground text-xs">
                                      · {cat.budgetCategory.name}
                                    </span>
                                  )}
                                </div>
                              </ComboboxItem>
                            );
                          }}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {filteredCategories.length > 0 && (
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowNewCat((v) => !v)}
            >
              {showNewCat ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {showNewCat ? "Cancelar nueva categoría" : "+ Nueva categoría de gasto"}
            </button>
          )}

          {showNewCat && (
            <div className="rounded-lg border bg-muted/40 p-3 space-y-3">
              <p className="text-sm font-medium">Nueva categoría de gasto</p>
              <div className="space-y-2">
                <Input
                  placeholder="Nombre (ej: Alquiler, Netflix...)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  disabled={creatingCat}
                />
                {!filterBudgetCategoryId && (
                  <Select value={newCatBudgetId} onValueChange={setNewCatBudgetId} disabled={creatingCat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Grupo (Necesidades, Gustos, Ahorro)" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetCategories.map((bc) => (
                        <SelectItem key={bc.id} value={bc.id}>{bc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none pt-1">
                  {EXPENSE_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.name}
                      disabled={creatingCat}
                      onClick={() => setNewCatColor(c.value)}
                      className={cn(
                        "h-7 w-7 shrink-0 rounded-full border-2 transition-transform hover:scale-110",
                        newCatColor === c.value
                          ? "border-foreground scale-110"
                          : "border-transparent"
                      )}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleCreateCategory}
                disabled={creatingCat || !newCatName.trim() || !newCatBudgetId}
              >
                {creatingCat ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Plus className="h-4 w-4 mr-1" />
                )}
                Crear y seleccionar
              </Button>
            </div>
          )}

          <Separator />

          <FormField
            control={form.control}
            name="plannedAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto planeado</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0.00" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting || filteredCategories.length === 0}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : null}
            Agregar
          </Button>
        </form>
      </Form>
    </ResponsiveSheet>
  );
}
