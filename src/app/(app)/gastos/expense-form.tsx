"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { createExpense, updateExpense } from "@/lib/actions/expenses";
import type { ExpenseCategoryWithRelations } from "@/lib/actions/expense-categories";
import type { ExpenseWithCategory } from "@/lib/actions/expenses";

const schema = z.object({
  budgetId: z.string().min(1),
  expenseCategoryId: z.string().min(1, "Selecciona una categoría"),
  name: z.string().min(1, "El nombre es requerido"),
  amount: z.coerce.number().positive("El monto debe ser positivo"),
  date: z.string().min(1, "La fecha es requerida"),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  budgetId: string;
  expenseCategories: ExpenseCategoryWithRelations[];
  expense?: ExpenseWithCategory;
  children: React.ReactNode;
  onClose?: () => void;
};

function todayString() {
  return new Date().toISOString().split("T")[0];
}

export function ExpenseForm({ budgetId, expenseCategories, expense, children, onClose }: Props) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues, unknown, FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      budgetId,
      expenseCategoryId: expense?.expenseCategoryId ?? "",
      name: expense?.name ?? "",
      amount: expense ? Number(expense.amount) : 0,
      date: expense ? new Date(expense.date).toISOString().split("T")[0] : todayString(),
    },
  });

  async function onSubmit(values: FormValues) {
    const result = expense
      ? await updateExpense(expense.id, values)
      : await createExpense(values);

    if (result.success) {
      toast.success(expense ? "Gasto actualizado" : "Gasto registrado");
      setOpen(false);
      form.reset({ ...form.getValues(), name: "", amount: 0, date: todayString() });
      onClose?.();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="h-auto pb-8">
        <SheetHeader className="mb-4">
          <SheetTitle>{expense ? "Editar gasto" : "Nuevo gasto"}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="expenseCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Compra supermercado..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
