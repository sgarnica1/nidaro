"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import type { ActionResult } from "@/types";
import type { Expense, ExpenseCategory, BudgetCategory } from "@/generated/prisma/client";

const expenseSchema = z.object({
  budgetId: z.string().min(1),
  expenseCategoryId: z.string().min(1, "Selecciona una categoría"),
  name: z.string().min(1, "El nombre es requerido"),
  amount: z.coerce.number().positive("El monto debe ser positivo"),
  date: z.string().min(1, "La fecha es requerida"),
});

export type ExpenseWithCategory = Expense & {
  expenseCategory: ExpenseCategory & { budgetCategory: BudgetCategory };
};

export async function getExpensesByBudget(budgetId: string): Promise<ExpenseWithCategory[]> {
  const user = await getCurrentUser();
  return prisma.expense.findMany({
    where: { budgetId, userId: user.id },
    include: { expenseCategory: { include: { budgetCategory: true } } },
    orderBy: { date: "desc" },
  });
}

export async function createExpense(
  data: z.infer<typeof expenseSchema>
): Promise<ActionResult<Expense>> {
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
    return { success: true, data: expense };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function updateExpense(
  id: string,
  data: z.infer<typeof expenseSchema>
): Promise<ActionResult<Expense>> {
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
    return { success: true, data: expense };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    await prisma.expense.delete({ where: { id, userId: user.id } });
    revalidatePath("/dashboard");
    revalidatePath("/gastos");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}
