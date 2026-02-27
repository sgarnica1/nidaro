"use client";

import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { cn } from "@/lib/utils";
import { EXPENSE_COLORS } from "@/lib/colors";
import {
  createExpenseCategory,
  updateExpenseCategory,
  type BudgetCategoryWithSubs,
  type ExpenseCategoryWithRelations,
} from "@/lib/actions/expense-categories";

const schema = z
  .object({
    name: z.string().min(1, "El nombre es requerido"),
    color: z.string().min(1, "El color es requerido"),
    categoryId: z.string().min(1, "La categoría es requerida"),
    subcategoryId: z.string().optional(),
    _requiresSub: z.boolean().optional(),
  })
  .superRefine((val, ctx) => {
    if (val._requiresSub && !val.subcategoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La subcategoría es requerida",
        path: ["subcategoryId"],
      });
    }
  });

type FormValues = z.infer<typeof schema>;

type Props = {
  budgetCategories: BudgetCategoryWithSubs[];
  expenseCategory?: ExpenseCategoryWithRelations;
  defaultCategoryId?: string;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CategoryForm({ budgetCategories, expenseCategory, defaultCategoryId, children, open: controlledOpen, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (val: boolean) => {
    setInternalOpen(val);
    onOpenChange?.(val);
  };

  const resolvedCategoryId = expenseCategory?.categoryId ?? defaultCategoryId ?? "";
  const defaultBudgetCat = budgetCategories.find((c) => c.id === resolvedCategoryId);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: expenseCategory?.name ?? "",
      color: expenseCategory?.color ?? EXPENSE_COLORS[0].value,
      categoryId: resolvedCategoryId,
      subcategoryId: expenseCategory?.subcategoryId ?? undefined,
      _requiresSub: (defaultBudgetCat?.subcategories.length ?? 0) > 0,
    },
  });

  const selectedCategoryId = form.watch("categoryId");
  const selectedBudgetCat = budgetCategories.find((c) => c.id === selectedCategoryId);
  const hasSubs = (selectedBudgetCat?.subcategories.length ?? 0) > 0;

  function handleCategoryChange(val: string) {
    form.setValue("categoryId", val);
    form.setValue("subcategoryId", undefined);
    const cat = budgetCategories.find((c) => c.id === val);
    form.setValue("_requiresSub", (cat?.subcategories.length ?? 0) > 0);
  }

  async function onSubmit(values: FormValues) {
    const payload = {
      name: values.name,
      color: values.color,
      categoryId: values.categoryId,
      subcategoryId: values.subcategoryId,
    };
    const result = expenseCategory
      ? await updateExpenseCategory(expenseCategory.id, payload)
      : await createExpenseCategory(payload);

    if (result.success) {
      toast.success(expenseCategory ? "Categoría actualizada" : "Categoría creada");
      setOpen(false);
      form.reset();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={setOpen}
      title={expenseCategory ? "Editar categoría" : "Nueva categoría"}
      trigger={children}
    >
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
                <Select onValueChange={handleCategoryChange} value={field.value}>
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

          {hasSubs && (
            <FormField
              control={form.control}
              name="subcategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Subcategoría <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una subcategoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedBudgetCat!.subcategories.map((sub) => (
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
                  <div className="flex gap-2.5 overflow-x-auto px-2 py-5 scrollbar-none">
                    {EXPENSE_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        title={color.name}
                        onClick={() => field.onChange(color.value)}
                        className={cn(
                          "h-8 w-8 shrink-0 rounded-full border-2 transition-transform hover:scale-110",
                          field.value === color.value
                            ? "border-foreground scale-110 ring-2 ring-offset-2 ring-foreground/30"
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

          <Button type="submit" className="w-full mt-6 bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      </Form>
    </ResponsiveSheet>
  );
}
