"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import { cn } from "@/lib/utils";
import { EXPENSE_COLORS } from "@/lib/colors";
import { createExpenseCategory, updateExpenseCategory, type BudgetCategoryWithSubs, type ExpenseCategoryWithRelations } from "@/lib/actions/expense-categories";

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  color: z.string().min(1, "El color es requerido"),
  categoryId: z.string().min(1, "La categoría es requerida"),
  subcategoryId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  budgetCategories: BudgetCategoryWithSubs[];
  expenseCategory?: ExpenseCategoryWithRelations;
  children: React.ReactNode;
};

export function CategoryForm({ budgetCategories, expenseCategory, children }: Props) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: expenseCategory?.name ?? "",
      color: expenseCategory?.color ?? EXPENSE_COLORS[8].value,
      categoryId: expenseCategory?.categoryId ?? "",
      subcategoryId: expenseCategory?.subcategoryId ?? undefined,
    },
  });

  const selectedCategoryId = form.watch("categoryId");
  const selectedBudgetCat = budgetCategories.find((c) => c.id === selectedCategoryId);

  async function onSubmit(values: FormValues) {
    const result = expenseCategory
      ? await updateExpenseCategory(expenseCategory.id, values)
      : await createExpenseCategory(values);

    if (result.success) {
      toast.success(expenseCategory ? "Categoría actualizada" : "Categoría creada");
      setOpen(false);
      form.reset();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expenseCategory ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Supermercado, Renta..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría principal</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {budgetCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedBudgetCat && selectedBudgetCat.subcategories.length > 0 && (
              <FormField
                control={form.control}
                name="subcategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategoría (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sin subcategoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedBudgetCat.subcategories.map((sub: { id: string; name: string }) => (
                          <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-10 gap-2">
                      {EXPENSE_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          title={color.name}
                          onClick={() => field.onChange(color.value)}
                          className={cn(
                            "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                            field.value === color.value
                              ? "border-foreground scale-110"
                              : "border-transparent"
                          )}
                          style={{ backgroundColor: color.value }}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
