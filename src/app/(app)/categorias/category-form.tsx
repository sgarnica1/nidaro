"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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
  const selectedColor = form.watch("color");

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

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
      setOpen(false);
      form.reset();
      toast.success(expenseCategory ? "Categoría actualizada" : "Categoría creada", {
        duration: 2500,
        style: {
          backgroundColor: "#10B981",
          color: "white",
        },
      });
    }
  }

  const selectedCategory = budgetCategories.find((c) => c.id === selectedCategoryId);
  const selectedSubcategory = selectedCategory?.subcategories.find((s) => s.id === form.watch("subcategoryId"));

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={setOpen}
      title={expenseCategory ? "Editar categoría" : "Nueva categoría"}
      trigger={children}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Nombre de la categoría"
                        className="h-[52px] bg-[#F8F8F6] border-none rounded-xl px-[14px] text-[15px] focus-visible:ring-0 focus-visible:ring-offset-0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="h-[1px] bg-[#F3F4F6]" />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={handleCategoryChange} value={field.value}>
                      <SelectTrigger className="h-[52px] border-none border-b border-[#F3F4F6] rounded-none px-4">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[15px] font-medium text-[#111111]">
                            {selectedCategory ? selectedCategory.name : "Categoría principal"}
                          </span>
                          <ChevronRight className="h-5 w-5 text-[#6B7280]" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {budgetCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {hasSubs && (
              <>
                <div className="h-[1px] bg-[#F3F4F6]" />
                <FormField
                  control={form.control}
                  name="subcategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <SelectTrigger className="h-[52px] border-none border-b border-[#F3F4F6] rounded-none px-4">
                            <div className="flex items-center justify-between w-full">
                              <span className="text-[15px] font-medium text-[#111111]">
                                {selectedSubcategory ? selectedSubcategory.name : "Subcategoría"}
                              </span>
                              <ChevronRight className="h-5 w-5 text-[#6B7280]" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {selectedBudgetCat!.subcategories.map((sub) => (
                              <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="h-[1px] bg-[#F3F4F6]" />

            <div className="px-4 py-4">
              <p className="text-[11px] uppercase text-[#6B7280] mb-3">Color</p>
              <div className="flex gap-3 overflow-x-auto py-2 -mx-4 px-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {EXPENSE_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    title={color.name}
                    onClick={() => form.setValue("color", color.value)}
                    className={cn(
                      "h-10 w-10 shrink-0 rounded-full border-2 transition-all",
                      selectedColor === color.value
                        ? "border-[#1C3D2E] scale-110 ring-2 ring-[#1C3D2E]/30"
                        : "border-[#F3F4F6]"
                    )}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
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
              disabled={form.formState.isSubmitting || !form.watch("name") || !form.watch("categoryId")}
              className="w-full h-[52px] text-base font-bold rounded-[14px] bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white disabled:bg-[#9CA3AF] disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {form.formState.isSubmitting ? "Guardando..." : expenseCategory ? "Guardar cambios" : "Crear categoría"}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveSheet>
  );
}
