"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import type { ActionResult } from "@/types";
import type { Budget, BudgetExpensePlan, IncomeDeduction, BudgetIncome, ExpenseCategory, BudgetCategory } from "@/generated/prisma/client";

const deductionSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.coerce.number().positive(),
});

const budgetCreateSchema = z.object({
  name: z.string().optional(),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().min(1, "La fecha de fin es requerida"),
  templateId: z.string().optional(),
  incomeSourceIds: z.array(z.string()).min(1, "Selecciona al menos un ingreso"),
  deductions: z.array(deductionSchema).default([]),
});

export type BudgetWithDetails = Budget & {
  incomes: (BudgetIncome & { incomeSource: { name: string; amount: string | number } })[];
  deductions: IncomeDeduction[];
  expensePlans: (BudgetExpensePlan & {
    expenseCategory: ExpenseCategory & { budgetCategory: BudgetCategory };
  })[];
};

export async function getBudgets(): Promise<Budget[]> {
  const user = await getCurrentUser();
  return prisma.budget.findMany({
    where: { userId: user.id },
    orderBy: { startDate: "desc" },
  });
}

export async function getActiveBudget(): Promise<BudgetWithDetails | null> {
  const user = await getCurrentUser();
  const today = new Date();
  return prisma.budget.findFirst({
    where: {
      userId: user.id,
      startDate: { lte: today },
      endDate: { gte: today },
    },
    include: {
      incomes: { include: { incomeSource: { select: { name: true, amount: true } } } },
      deductions: true,
      expensePlans: {
        include: { expenseCategory: { include: { budgetCategory: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  }) as Promise<BudgetWithDetails | null>;
}

export async function getBudgetById(id: string): Promise<BudgetWithDetails | null> {
  const user = await getCurrentUser();
  return prisma.budget.findUnique({
    where: { id, userId: user.id },
    include: {
      incomes: { include: { incomeSource: { select: { name: true, amount: true } } } },
      deductions: true,
      expensePlans: {
        include: { expenseCategory: { include: { budgetCategory: true } } },
      },
    },
  }) as Promise<BudgetWithDetails | null>;
}

export async function createBudget(
  data: z.infer<typeof budgetCreateSchema>
): Promise<ActionResult<Budget>> {
  try {
    const user = await getCurrentUser();
    const parsed = budgetCreateSchema.parse(data);

    const incomeSources = await prisma.incomeSource.findMany({
      where: { id: { in: parsed.incomeSourceIds }, userId: user.id, isActive: true },
    });
    const grossIncome = incomeSources.reduce((sum, s) => sum + Number(s.amount), 0);

    const totalDeductions = parsed.deductions.reduce((sum, d) => {
      return d.type === "PERCENTAGE" ? sum + (grossIncome * d.value) / 100 : sum + d.value;
    }, 0);
    const availableIncome = grossIncome - totalDeductions;

    const budget = await prisma.$transaction(async (tx) => {
      const b = await tx.budget.create({
        data: {
          userId: user.id,
          name: parsed.name || null,
          startDate: new Date(parsed.startDate),
          endDate: new Date(parsed.endDate),
          totalIncome: availableIncome,
          createdFromTemplateId: parsed.templateId || null,
        },
      });

      await tx.budgetIncome.createMany({
        data: parsed.incomeSourceIds.map((id) => ({ budgetId: b.id, incomeSourceId: id })),
      });

      if (parsed.deductions.length > 0) {
        await tx.incomeDeduction.createMany({
          data: parsed.deductions.map((d) => ({
            budgetId: b.id,
            name: d.name,
            type: d.type,
            value: d.value,
          })),
        });
      }

      if (parsed.templateId) {
        const templateItems = await tx.budgetTemplateItem.findMany({
          where: { templateId: parsed.templateId },
        });
        if (templateItems.length > 0) {
          await tx.budgetExpensePlan.createMany({
            data: templateItems.map((item) => ({
              budgetId: b.id,
              expenseCategoryId: item.expenseCategoryId,
              plannedAmount: item.plannedAmount,
            })),
          });
          const totalPlanned = templateItems.reduce((s, i) => s + Number(i.plannedAmount), 0);
          await tx.budget.update({ where: { id: b.id }, data: { totalPlanned } });
        }
      }

      return b;
    });

    revalidatePath("/dashboard");
    revalidatePath("/presupuestos");
    return { success: true, data: budget };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function deleteBudget(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    await prisma.budget.delete({ where: { id, userId: user.id } });
    revalidatePath("/dashboard");
    redirect("/dashboard");
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}
