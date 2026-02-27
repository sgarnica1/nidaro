"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { upsertBudgetExpensePlan } from "@/lib/actions/budgets";
import type { ExpenseCategoryWithRelations } from "@/lib/actions/expense-categories";

const schema = z.object({
  expenseCategoryId: z.string().min(1, "Selecciona una categoría"),
  plannedAmount: z.number().positive("El monto debe ser positivo"),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  budgetId: string;
  expenseCategories: ExpenseCategoryWithRelations[];
  existingCategoryIds?: string[];
  children: React.ReactNode;
  onPlanAdded?: () => void;
};

export function BudgetExpensePlanForm({
  budgetId,
  expenseCategories,
  existingCategoryIds = [],
  children,
  onPlanAdded,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const filteredCategories = expenseCategories.filter(
    (c) => !existingCategoryIds.includes(c.id)
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { expenseCategoryId: "", plannedAmount: 0 },
  });

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) {
      form.reset();
    }
  }

  async function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await upsertBudgetExpensePlan({
        budgetId,
        expenseCategoryId: values.expenseCategoryId,
        plannedAmount: values.plannedAmount,
      });
      if (result.success) {
        toast.success("Categoría agregada al presupuesto");
        onPlanAdded?.();
        handleOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <ResponsiveSheet open={open} onOpenChange={handleOpenChange} title="Agregar categoría al presupuesto" trigger={children}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="expenseCategoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría de gasto</FormLabel>
                {filteredCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Todas las categorías ya están en el presupuesto
                  </p>
                ) : (
                  <Combobox
                    items={filteredCategories.map((c) => c.id)}
                    value={field.value || null}
                    onValueChange={(id: string | null) => {
                      if (id) field.onChange(id);
                    }}
                    itemToStringLabel={(id: string) => expenseCategories.find((c) => c.id === id)?.name ?? ""}
                    itemToStringValue={(id: string) => expenseCategories.find((c) => c.id === id)?.name ?? ""}
                  >
                    <FormControl>
                      <ComboboxInput placeholder="Buscar categoría..." showClear className="w-full" />
                    </FormControl>
                    <ComboboxContent className="z-[200]">
                      <ComboboxEmpty>No se encontraron categorías.</ComboboxEmpty>
                      <ComboboxList>
                        {(id: string) => {
                          const cat = expenseCategories.find((c) => c.id === id);
                          if (!cat) return null;
                          return (
                            <ComboboxItem key={cat.id} value={cat.id}>
                              <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                                <span>{cat.name}</span>
                                <span className="text-muted-foreground text-xs">· {cat.budgetCategory.name}</span>
                              </div>
                            </ComboboxItem>
                          );
                        }}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="plannedAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto planeado</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-3 pt-4 sticky bottom-0 bg-background border-t -mx-4 -mb-4 px-4 pb-4 mt-auto">
            <Button type="submit" disabled={pending} className="w-full h-12 text-base">
              {pending ? "Agregando..." : "Agregar"}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveSheet>
  );
}
