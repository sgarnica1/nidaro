"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createExpense, updateExpense } from "@/lib/actions/expenses";
import type { ExpenseCategoryWithRelations } from "@/lib/actions/expense-categories";
import type { ExpenseWithCategory } from "@/lib/actions/expenses";
import { CategoryPickerSheet } from "./category-picker-sheet";
import { useIsMobile } from "@/hooks/use-is-mobile";

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
  const isMobile = useIsMobile();
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
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);

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

  useEffect(() => {
    if (!open && !expense) {
      form.reset({
        budgetId,
        expenseCategoryId: "",
        name: "",
        amount: 0,
        date: todayString(),
      });
      setAmountInputValue("");
    }
  }, [open, expense, budgetId, form]);

  const amount = form.watch("amount");
  const selectedCategoryId = form.watch("expenseCategoryId");
  const nameValue = form.watch("name");
  const sortedCategories = [...expenseCategories].sort((a, b) => a.name.localeCompare(b.name));

  // Smart category suggestions based on description
  useEffect(() => {
    if (!nameValue || nameValue.length < 2) {
      setSuggestedCategory(null);
      return;
    }

    const lowerName = nameValue.toLowerCase();
    const suggestions: Record<string, string[]> = {
      "Transporte": ["uber", "taxi", "metro", "bus", "transporte", "gasolina", "gas"],
      "Supermercado": ["costco", "walmart", "soriana", "chedraui", "super", "supermercado", "tienda"],
      "Salidas": ["restaurant", "restaurante", "cafe", "starbucks", "comida", "comer", "tacos", "sushi"],
      "Salud": ["farmacia", "doctor", "medico", "hospital", "clinica", "salud"],
      "Hogar": ["home", "depot", "liverpool", "palacio", "hogar", "casa"],
    };

    for (const [categoryName, keywords] of Object.entries(suggestions)) {
      if (keywords.some((keyword) => lowerName.includes(keyword))) {
        const category = sortedCategories.find((c) => c.name === categoryName);
        if (category && category.id !== selectedCategoryId) {
          setSuggestedCategory(category.id);
          return;
        }
      }
    }
    setSuggestedCategory(null);
  }, [nameValue, sortedCategories, selectedCategoryId]);

  // Limit to 3-4 visible categories, ensure selected is included
  let topCategories = sortedCategories.slice(0, 3);
  if (selectedCategoryId && !topCategories.find((c) => c.id === selectedCategoryId)) {
    const selectedCat = sortedCategories.find((c) => c.id === selectedCategoryId);
    if (selectedCat) {
      topCategories = [selectedCat, ...sortedCategories.filter((c) => c.id !== selectedCategoryId)].slice(0, 3);
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
        nameInputRef.current?.focus();
      }, 150);
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
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setOpen(false);
        if (!expense) {
          form.reset({
            budgetId,
            expenseCategoryId: "",
            name: "",
            amount: 0,
            date: todayString(),
          });
          setAmountInputValue("");
        }
        onClose?.();
      }, 500);
    }
  }

  const dateValue = form.watch("date") ? new Date(form.watch("date") + "T00:00:00") : undefined;
  const formattedDate = dateValue ? format(dateValue, "d MMM", { locale: es }) : "Selecciona fecha";

  return (
    <>
      <ResponsiveSheet
        open={open}
        onOpenChange={setOpen}
        title=""
        trigger={children}
        showDragHandle={true}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
            <AnimatePresence>
              {showSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex items-center justify-center"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mx-auto mb-3"
                    >
                      <Check className="w-6 h-6 text-primary-foreground" />
                    </motion.div>
                    <p className="text-base font-semibold text-foreground">Gasto guardado</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="flex-1 overflow-y-auto"
                >
                  <div className="px-6 pt-6 pb-8 space-y-5">
                    {/* Title Hierarchy */}
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold tracking-tight text-foreground">
                        {expense ? "Editar gasto" : "Nuevo gasto"}
                      </h2>
                      <p className="text-sm text-muted-foreground/70">
                        Agrega un gasto a tu presupuesto
                      </p>
                    </div>

                    {/* Description Input */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => {
                        const { ref, ...restField } = field;
                        return (
                          <FormItem>
                            <FormControl>
                              <Input
                                ref={(e) => {
                                  if (typeof ref === "function") {
                                    ref(e);
                                  } else if (ref) {
                                    (ref as React.MutableRefObject<HTMLInputElement | null>).current = e;
                                  }
                                  nameInputRef.current = e;
                                }}
                                placeholder="Ej: Café en Starbucks"
                                className="text-lg font-medium border-0 rounded-none focus-visible:ring-0 px-0 h-auto py-2"
                                {...restField}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    {/* Hero Amount Field */}
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="space-y-3">
                              <motion.div
                                animate={{
                                  scale: amountFocused ? 1.03 : 1,
                                }}
                                transition={{ duration: 0.15 }}
                                className="relative"
                              >
                                <div className="flex items-center justify-center gap-3">
                                  <span className="text-lg text-muted-foreground">$</span>
                                  <input
                                    ref={amountInputRef}
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0"
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
                                      if (rawValue === "" || /^\d*\.?\d*$/.test(rawValue)) {
                                        setAmountInputValue(rawValue);
                                        const numValue = parseFloat(rawValue) || 0;
                                        field.onChange(numValue);
                                        setAmountError(false);
                                      }
                                    }}
                                    className={cn(
                                      "text-5xl font-semibold tabular-nums bg-transparent border-none outline-none focus:outline-none text-center w-40",
                                      "placeholder:text-muted-foreground",
                                      amountError ? "text-destructive animate-[shake_0.5s]" : "text-foreground"
                                    )}
                                  />
                                  <span className="text-lg text-muted-foreground">MXN</span>
                                </div>
                              </motion.div>
                              {amountError && (
                                <p className="text-xs text-destructive text-center">Ingresa un monto</p>
                              )}
                              {/* Quick Amount Suggestions */}
                              {!amountInputValue && (
                                <div className="flex items-center justify-center gap-2">
                                  {[50, 100, 200].map((suggestion) => (
                                    <motion.button
                                      key={suggestion}
                                      type="button"
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => {
                                        setAmountInputValue(suggestion.toString());
                                        field.onChange(suggestion);
                                      }}
                                      className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                                    >
                                      ${suggestion}
                                    </motion.button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date Picker Row */}
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => {
                        if (isMobile) {
                          return (
                            <FormItem>
                              <FormControl>
                                <div className="flex items-center gap-2">
                                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                  <input
                                    type="date"
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    className="flex-1 text-base font-medium text-foreground bg-transparent border-0 outline-none focus:outline-none"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }
                        return (
                          <FormItem>
                            <FormControl>
                              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="w-full flex items-center gap-2 px-0 py-2 hover:opacity-70 transition-opacity"
                                  >
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-base font-medium text-foreground">
                                      {formattedDate}
                                    </span>
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 z-200" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={dateValue}
                                    onSelect={(day) => {
                                      if (day) {
                                        const year = day.getFullYear();
                                        const month = String(day.getMonth() + 1).padStart(2, "0");
                                        const date = String(day.getDate()).padStart(2, "0");
                                        field.onChange(`${year}-${month}-${date}`);
                                        setCalendarOpen(false);
                                      }
                                    }}
                                    initialFocus
                                    classNames={{
                                      day: "h-12 w-12 text-base",
                                      day_button: "h-12 w-12 text-base",
                                      month_caption: "h-12 text-lg mb-3 relative z-10",
                                      nav: "absolute top-0 inset-x-0 justify-between z-30",
                                      button_previous: "z-30",
                                      button_next: "z-30",
                                      caption_label: "text-lg font-semibold relative z-20",
                                      weekdays: "flex flex-row mb-2 mt-1",
                                      weekday: "h-10 text-sm text-center flex-1 flex items-center justify-center min-w-0",
                                      month: "gap-3",
                                      table: "w-full",
                                    }}
                                  />
                                </PopoverContent>
                              </Popover>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    {/* Category Selection */}
                    <div
                      className={cn(
                        "flex gap-2 overflow-x-auto pb-1 -mx-6 px-6",
                        categoryError && "bg-muted/40 rounded-lg p-2 transition-colors"
                      )}
                      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                      {topCategories.map((cat) => {
                        const isSelected = selectedCategoryId === cat.id;
                        const isSuggested = suggestedCategory === cat.id;
                        return (
                          <motion.button
                            key={cat.id}
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              form.setValue("expenseCategoryId", cat.id);
                              setCategoryError(false);
                              setSuggestedCategory(null);
                            }}
                            className={cn(
                              "rounded-full px-3 py-1 text-sm font-medium shrink-0 transition-colors",
                              isSelected
                                ? "bg-primary/10 text-primary"
                                : isSuggested
                                  ? "bg-primary/5 text-primary border border-primary/20"
                                  : "bg-muted/60 text-muted-foreground hover:bg-muted/80"
                            )}
                          >
                            {cat.name}
                          </motion.button>
                        );
                      })}
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCategoryPickerOpen(true)}
                        className="rounded-full px-3 py-1 text-sm font-medium bg-muted/60 text-muted-foreground hover:bg-muted/80 shrink-0 transition-colors"
                      >
                        + Más
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Action Area */}
            {!showSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="sticky bottom-0 bg-background border-t border-border/40 px-6 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] space-y-3"
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full text-sm text-muted-foreground text-center py-2"
                >
                  Cancelar
                </button>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting || amount === 0 || !selectedCategoryId || !form.watch("name")}
                    className="w-full h-12 rounded-xl font-medium disabled:opacity-50"
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar gasto"
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            )}
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
