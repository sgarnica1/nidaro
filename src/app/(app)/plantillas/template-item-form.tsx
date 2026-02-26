"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  /** When set, only expense categories from this budget category are shown */
  filterBudgetCategoryId?: string;
  children: React.ReactNode;
  onItemAdded?: () => void;
};

export function TemplateItemForm({
  templateId,
  expenseCategories: initialExpenseCategories,
  budgetCategories,
  filterBudgetCategoryId,
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

  const filteredCategories = filterBudgetCategoryId
    ? expenseCategories.filter((c) => c.categoryId === filterBudgetCategoryId)
    : expenseCategories;

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
        toast.error(result.error);
        return;
      }
      const budgetCat = budgetCategories.find((b) => b.id === newCatBudgetId)!;
      const newCat: ExpenseCategoryWithRelations = {
        ...result.data,
        budgetCategory: budgetCat,
        subcategory: null,
      };
      setExpenseCategories((prev) => [...prev, newCat]);
      form.setValue("expenseCategoryId", newCat.id, { shouldValidate: true });
      setShowNewCat(false);
      setNewCatName("");
      setNewCatColor(EXPENSE_COLORS[0].value);
      setNewCatBudgetId(filterBudgetCategoryId ?? "");
      toast.success(`Categoría "${newCat.name}" creada y seleccionada`);
    });
  }

  async function onSubmit(values: FormValues) {
    const result = await upsertTemplateItem(templateId, values);
    if (result.success) {
      toast.success("Partida agregada");
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Agregar partida{activeBudgetCatName ? ` · ${activeBudgetCatName}` : ""}
          </DialogTitle>
        </DialogHeader>

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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
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
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                {showNewCat ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
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
                    <Select
                      value={newCatBudgetId}
                      onValueChange={setNewCatBudgetId}
                      disabled={creatingCat}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Grupo (Necesidades, Gustos, Ahorro)" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgetCategories.map((bc) => (
                          <SelectItem key={bc.id} value={bc.id}>
                            {bc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    {EXPENSE_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        title={c.name}
                        disabled={creatingCat}
                        onClick={() => setNewCatColor(c.value)}
                        className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110"
                        style={{
                          backgroundColor: c.value,
                          borderColor: newCatColor === c.value ? "white" : "transparent",
                          outline: newCatColor === c.value ? `2px solid ${c.value}` : "none",
                        }}
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
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || filteredCategories.length === 0}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : null}
                Agregar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
