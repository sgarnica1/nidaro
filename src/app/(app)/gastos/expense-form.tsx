"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function todayString() {
  return new Date().toISOString().split("T")[0];
}

export function ExpenseForm({ budgetId, expenseCategories, expense, children, onClose, open: controlledOpen, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (val: boolean) => {
    setInternalOpen(val);
    onOpenChange?.(val);
  };
  const [calendarOpen, setCalendarOpen] = useState(false);

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
      if (expense) toast.success("Gasto actualizado");
      setOpen(false);
      form.reset({ ...form.getValues(), name: "", amount: 0, date: todayString() });
      onClose?.();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={setOpen}
      title={expense ? "Editar gasto" : "Nuevo gasto"}
      trigger={children}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => {
                const dateValue = field.value ? new Date(field.value + "T12:00:00") : undefined;
                return (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateValue
                              ? format(dateValue, "d MMM yyyy", { locale: es })
                              : "Selecciona"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[200]" align="start">
                        <Calendar
                          mode="single"
                          selected={dateValue}
                          onSelect={(day) => {
                            if (day) {
                              field.onChange(day.toISOString().split("T")[0]);
                              setCalendarOpen(false);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                );
              }}
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
                <Combobox
                  items={expenseCategories.map((c) => c.id)}
                  value={field.value || null}
                  onValueChange={(id: string | null) => { if (id) field.onChange(id); }}
                  itemToStringLabel={(id: string) => expenseCategories.find((c) => c.id === id)?.name ?? ""}
                  itemToStringValue={(id: string) => expenseCategories.find((c) => c.id === id)?.name ?? ""}
                >
                  <ComboboxInput placeholder="Buscar categoría..." showClear className="w-full" />
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

          <div className="sticky bottom-0 bg-background pt-4 pb-2 -mx-4 px-4 border-t mt-6 flex gap-2 md:static md:border-t-0 md:pt-2 md:pb-0 md:mx-0">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveSheet>
  );
}
