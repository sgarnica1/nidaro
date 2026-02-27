"use server";

import { revalidatePath, unstable_cache } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import type { ActionResult } from "@/types";
import type { Expense, ExpenseCategory, BudgetCategory, BudgetSubcategory } from "@/generated/prisma/client";

const expenseSchema = z.object({
  budgetId: z.string().min(1),
  expenseCategoryId: z.string().min(1, "Selecciona una categoría"),
  name: z.string().min(1, "El nombre es requerido"),
  amount: z.coerce.number().positive("El monto debe ser positivo"),
  date: z.string().min(1, "La fecha es requerida"),
});

export type ExpenseWithCategory = Omit<Expense, "amount"> & {
  amount: number;
  expenseCategory: ExpenseCategory & {
    budgetCategory: Omit<BudgetCategory, "defaultPercentage"> & { defaultPercentage: number };
    subcategory: BudgetSubcategory | null;
  };
};

export async function getExpensesByBudget(budgetId: string): Promise<ExpenseWithCategory[]> {
  const user = await getCurrentUser();
  
  if (process.env.NODE_ENV === "production") {
    return getExpensesByBudgetCached(budgetId, user.id);
  }
  
  return getExpensesByBudgetUncached(budgetId, user.id);
}

async function getExpensesByBudgetCached(budgetId: string, userId: string): Promise<ExpenseWithCategory[]> {
  return unstable_cache(
    async () => {
      return getExpensesByBudgetUncached(budgetId, userId);
    },
    [`expenses-${budgetId}-${userId}`],
    { revalidate: 10, tags: [`expenses-${budgetId}`] }
  )();
}

async function getExpensesByBudgetUncached(budgetId: string, userId: string): Promise<ExpenseWithCategory[]> {
  const rows = await prisma.expense.findMany({
    where: { budgetId, userId },
    include: { expenseCategory: { include: { budgetCategory: true, subcategory: true } } },
    orderBy: { date: "desc" },
  });
  return rows.map((r) => ({
    ...r,
    amount: Number(r.amount),
    expenseCategory: {
      ...r.expenseCategory,
      budgetCategory: {
        ...r.expenseCategory.budgetCategory,
        defaultPercentage: Number(r.expenseCategory.budgetCategory.defaultPercentage),
      },
    },
  }));
}

type SerializedExpense = Omit<Expense, "amount"> & { amount: number };

export async function createExpense(
  data: z.infer<typeof expenseSchema>
): Promise<ActionResult<SerializedExpense>> {
  try {
    const user = await getCurrentUser();
    const parsed = expenseSchema.parse(data);
    const expense = await prisma.expense.create({
      data: {
        userId: user.id,
        budgetId: parsed.budgetId,
        expenseCategoryId: parsed.expenseCategoryId,
        name: parsed.name,
        amount: parsed.amount,
        date: new Date(parsed.date),
      },
    });
    revalidatePath("/dashboard");
    revalidatePath("/gastos");
    return { success: true, data: { ...expense, amount: Number(expense.amount) } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function updateExpense(
  id: string,
  data: z.infer<typeof expenseSchema>
): Promise<ActionResult<SerializedExpense>> {
  try {
    const user = await getCurrentUser();
    const parsed = expenseSchema.parse(data);
    const expense = await prisma.expense.update({
      where: { id, userId: user.id },
      data: {
        expenseCategoryId: parsed.expenseCategoryId,
        name: parsed.name,
        amount: parsed.amount,
        date: new Date(parsed.date),
      },
    });
    revalidatePath("/dashboard");
    revalidatePath("/gastos");
    return { success: true, data: { ...expense, amount: Number(expense.amount) } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    const expense = await prisma.expense.findUnique({ where: { id, userId: user.id }, select: { budgetId: true } });
    await prisma.expense.delete({ where: { id, userId: user.id } });
    revalidatePath("/dashboard");
    revalidatePath("/gastos");
    if (expense) {
      revalidatePath(`/gastos?budgetId=${expense.budgetId}`);
    }
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}
