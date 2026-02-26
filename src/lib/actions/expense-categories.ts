"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import type { ActionResult } from "@/types";
import type { ExpenseCategory, BudgetCategory, BudgetSubcategory } from "@/generated/prisma/client";

const categorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  color: z.string().min(1, "El color es requerido"),
  categoryId: z.string().min(1, "La categoría es requerida"),
  subcategoryId: z.string().optional(),
});

export type ExpenseCategoryWithRelations = Omit<ExpenseCategory, never> & {
  budgetCategory: Omit<BudgetCategory, "defaultPercentage"> & { defaultPercentage: number };
  subcategory: BudgetSubcategory | null;
};

export type BudgetCategoryWithSubs = Omit<BudgetCategory, "defaultPercentage"> & {
  defaultPercentage: number;
  subcategories: BudgetSubcategory[];
};

export async function getExpenseCategories(): Promise<ExpenseCategoryWithRelations[]> {
  const user = await getCurrentUser();
  const rows = await prisma.expenseCategory.findMany({
    where: { userId: user.id },
    include: { budgetCategory: true, subcategory: true },
    orderBy: [{ categoryId: "asc" }, { name: "asc" }],
  });
  return rows.map((r) => ({
    ...r,
    budgetCategory: { ...r.budgetCategory, defaultPercentage: Number(r.budgetCategory.defaultPercentage) },
  }));
}

export async function getBudgetCategoriesWithSubs(): Promise<BudgetCategoryWithSubs[]> {
  const rows = await prisma.budgetCategory.findMany({
    include: { subcategories: true },
    orderBy: { order: "asc" },
  });
  return rows.map((r) => ({ ...r, defaultPercentage: Number(r.defaultPercentage) }));
}

export async function createExpenseCategory(
  data: z.infer<typeof categorySchema>
): Promise<ActionResult<ExpenseCategory>> {
  try {
    const user = await getCurrentUser();
    const parsed = categorySchema.parse(data);
    const cat = await prisma.expenseCategory.create({
      data: {
        userId: user.id,
        name: parsed.name,
        color: parsed.color,
        categoryId: parsed.categoryId,
        subcategoryId: parsed.subcategoryId || null,
      },
    });
    revalidatePath("/categorias");
    return { success: true, data: cat };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function updateExpenseCategory(
  id: string,
  data: z.infer<typeof categorySchema>
): Promise<ActionResult<ExpenseCategory>> {
  try {
    const user = await getCurrentUser();
    const parsed = categorySchema.parse(data);
    const cat = await prisma.expenseCategory.update({
      where: { id, userId: user.id },
      data: {
        name: parsed.name,
        color: parsed.color,
        categoryId: parsed.categoryId,
        subcategoryId: parsed.subcategoryId || null,
      },
    });
    revalidatePath("/categorias");
    return { success: true, data: cat };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function deleteExpenseCategory(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    await prisma.expenseCategory.delete({ where: { id, userId: user.id } });
    revalidatePath("/categorias");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}
