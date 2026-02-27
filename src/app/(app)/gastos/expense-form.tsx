"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronRight } from "lucide-react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createExpense, updateExpense } from "@/lib/actions/expenses";
import type { ExpenseCategoryWithRelations } from "@/lib/actions/expense-categories";
import type { ExpenseWithCategory } from "@/lib/actions/expenses";
import { CategoryPickerSheet } from "./category-picker-sheet";

const schema = z.object({
  budgetId: z.string().min(1),
  expenseCategoryId: z.string().min(1, "Selecciona una categoría"),
  name: z.string().min(1, "La descripción es requerida"),
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
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [amountError, setAmountError] = useState(false);
  const [categoryError, setCategoryError] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);
  const [amountInputValue, setAmountInputValue] = useState<string>("");
  const amountInputRef = useRef<HTMLInputElement>(null);

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

  const amount = form.watch("amount");
  const selectedCategoryId = form.watch("expenseCategoryId");
  const selectedCategory = expenseCategories.find((c) => c.id === selectedCategoryId);
  const sortedCategories = [...expenseCategories].sort((a, b) => a.name.localeCompare(b.name));

  // Ensure selected category is always in the top categories if it exists
  let topCategories = sortedCategories.slice(0, 6);
  if (selectedCategoryId && !topCategories.find((c) => c.id === selectedCategoryId)) {
    const selectedCat = sortedCategories.find((c) => c.id === selectedCategoryId);
    if (selectedCat) {
      topCategories = [selectedCat, ...sortedCategories.filter((c) => c.id !== selectedCategoryId)].slice(0, 6);
    }
  }

  useEffect(() => {
    if (open) {
      if (expense) {
        setAmountInputValue(Number(expense.amount) > 0 ? Number(expense.amount).toString() : "");
      } else {
        setAmountInputValue("");
      }
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    } else {
      setAmountInputValue("");
    }
  }, [open, expense]);

  async function onSubmit(values: FormValues) {
    if (values.amount === 0 || values.amount <= 0) {
      setAmountError(true);
      amountInputRef.current?.focus();
      setTimeout(() => setAmountError(false), 2000);
      return;
    }

    if (!values.expenseCategoryId) {
      setCategoryError(true);
      setTimeout(() => setCategoryError(false), 1000);
      return;
    }

    const result = expense
      ? await updateExpense(expense.id, values)
      : await createExpense(values);

    if (result.success) {
      setOpen(false);
      form.reset({ ...form.getValues(), name: "", amount: 0, date: todayString() });
      onClose?.();
    }
  }

  const dateValue = form.watch("date") ? new Date(form.watch("date") + "T12:00:00") : undefined;
  const formattedDate = dateValue ? format(dateValue, "d MMM yyyy", { locale: es }) : "Selecciona fecha";

  return (
    <>
      <ResponsiveSheet
        open={open}
        onOpenChange={setOpen}
        title={expense ? "Editar gasto" : "Nuevo gasto"}
        trigger={children}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <div className="pt-5 pb-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <div className="flex items-center justify-center">
                            <span className="text-[24px] text-[#6B7280] mr-2">$</span>
                            <input
                              ref={amountInputRef}
                              type="text"
                              inputMode="decimal"
                              placeholder="$0"
                              value={amountInputValue}
                              onFocus={() => {
                                setAmountFocused(true);
                                if (amount > 0 && amountInputValue === "") {
                                  setAmountInputValue(amount.toString());
                                }
                              }}
                              onBlur={() => {
                                setAmountFocused(false);
                                const numValue = parseFloat(amountInputValue) || 0;
                                field.onChange(numValue);
                                setAmountInputValue(numValue > 0 ? numValue.toString() : "");
                                setAmountError(false);
                              }}
                              onChange={(e) => {
                                const rawValue = e.target.value;
                                // Allow empty, numbers, and one decimal point
                                if (rawValue === "" || /^\d*\.?\d*$/.test(rawValue)) {
                                  setAmountInputValue(rawValue);
                                  const numValue = parseFloat(rawValue) || 0;
                                  field.onChange(numValue);
                                  setAmountError(false);
                                }
                              }}
                              className={cn(
                                "w-full text-center text-[42px] font-bold bg-transparent border-none outline-none focus:outline-none",
                                "placeholder:text-[#D1D5DB] placeholder:text-[42px]",
                                amountError ? "text-[#DC2626] animate-[shake_0.5s]" : amountFocused ? "text-[#1C3D2E]" : "text-[#111111]",
                                "transition-colors"
                              )}
                            />
                            <span className="text-[12px] text-[#6B7280] ml-2 mt-2">MXN</span>
                          </div>
                          <div
                            className={cn(
                              "absolute bottom-0 left-0 right-0 h-[2px] transition-transform duration-300 origin-center",
                              amountError
                                ? "bg-[#DC2626] scale-x-100"
                                : amount > 0 || amountFocused
                                  ? "bg-[#1C3D2E] scale-x-100"
                                  : "bg-[#1C3D2E] scale-x-0"
                            )}
                          />
                        </div>
                      </FormControl>
                      {amountError && (
                        <p className="text-[12px] text-[#DC2626] text-center mt-2">Ingresa un monto</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="h-[1px] bg-[#F3F4F6]" />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormControl>
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="w-full h-[52px] flex items-center px-4 border-b border-[#F3F4F6]"
                            >
                              <CalendarIcon className="h-5 w-5 text-[#1C3D2E] mr-3" />
                              <span className="flex-1 text-left text-[15px] font-medium text-[#111111]">
                                {formattedDate}
                              </span>
                              <ChevronRight className="h-5 w-5 text-[#6B7280]" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-200" align="start">
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <div className="h-[1px] bg-[#F3F4F6]" />

              <div className="px-4 py-3">
                <p className="text-[11px] uppercase text-[#6B7280] mb-3">Categoría</p>
                <div
                  className={cn(
                    "flex gap-2 overflow-x-auto pb-2 -mx-4 px-4",
                    categoryError && "bg-[#FEF3C7] rounded-lg p-2 transition-colors"
                  )}
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {topCategories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          form.setValue("expenseCategoryId", cat.id);
                          setCategoryError(false);
                        }}
                        className={cn(
                          "h-9 px-3 rounded-full flex items-center gap-2 shrink-0 transition-all font-medium",
                          isSelected
                            ? "border-2 bg-[#1C3D2E]/20 text-[#1C3D2E]"
                            : "bg-[#F3F4F6] text-[#6B7280] border-2 border-transparent"
                        )}
                        style={
                          isSelected
                            ? {
                              borderColor: "#1C3D2E",
                            }
                            : {}
                        }
                      >
                        <span className="text-sm">{cat.name}</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setCategoryPickerOpen(true)}
                    className="h-9 px-3 rounded-full bg-[#F3F4F6] text-[#6B7280] flex items-center shrink-0"
                  >
                    <span className="text-sm font-medium">Ver más</span>
                  </button>
                </div>
              </div>

              <div className="h-[1px] bg-[#F3F4F6]" />

              <div className="px-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción"
                          className="min-h-[100px] bg-[#F8F8F6] border-none rounded-xl px-[14px] py-[14px] text-[15px] leading-normal resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-[#F3F4F6] px-4 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-[#6B7280] mb-3 block w-full text-center"
              >
                Cancelar
              </button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || amount === 0 || !selectedCategoryId || !form.watch("name")}
                className="w-full h-[52px] text-base font-bold rounded-[14px] bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white disabled:bg-[#9CA3AF] disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                {form.formState.isSubmitting ? "Guardando..." : "Guardar gasto"}
              </Button>
            </div>
          </form>
        </Form>
      </ResponsiveSheet>

      <CategoryPickerSheet
        open={categoryPickerOpen}
        onOpenChange={setCategoryPickerOpen}
        categories={sortedCategories}
        selectedCategoryId={selectedCategoryId}
        onSelect={(id) => {
          form.setValue("expenseCategoryId", id);
          setCategoryError(false);
        }}
      />
    </>
  );
}
