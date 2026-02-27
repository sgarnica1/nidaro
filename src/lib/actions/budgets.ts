"use server";

import { revalidatePath, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import type { ActionResult } from "@/types";
import type { Budget, BudgetExpensePlan, IncomeDeduction, BudgetIncome, ExpenseCategory, BudgetCategory, BudgetSubcategory } from "@/generated/prisma/client";

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

type SerializedBudget = Omit<Budget, "totalIncome" | "totalPlanned"> & {
  totalIncome: number;
  totalPlanned: number;
};

type SerializedIncomeDeduction = Omit<IncomeDeduction, "value"> & { value: number };

type SerializedBudgetExpensePlan = Omit<BudgetExpensePlan, "plannedAmount"> & {
  plannedAmount: number;
  expenseCategory: ExpenseCategory & {
    budgetCategory: Omit<BudgetCategory, "defaultPercentage"> & { defaultPercentage: number };
    subcategory: BudgetSubcategory | null;
  };
};

export type BudgetWithDetails = SerializedBudget & {
  incomes: (BudgetIncome & { incomeSource: { name: string; amount: number } })[];
  deductions: SerializedIncomeDeduction[];
  expensePlans: SerializedBudgetExpensePlan[];
};

export async function getBudgets(): Promise<SerializedBudget[]> {
  const user = await getCurrentUser();
  const budgets = await prisma.budget.findMany({
    where: { userId: user.id },
    orderBy: { startDate: "desc" },
  });
  return budgets.map((b) => ({
    ...b,
    totalIncome: Number(b.totalIncome),
    totalPlanned: Number(b.totalPlanned),
  }));
}

export async function getActiveBudget(): Promise<BudgetWithDetails | null> {
  const user = await getCurrentUser();

  if (process.env.NODE_ENV === "production") {
    return getActiveBudgetCached(user.id);
  }

  const today = new Date();
  const budget = await prisma.budget.findFirst({
    where: {
      userId: user.id,
      startDate: { lte: today },
      endDate: { gte: today },
    },
    include: {
      incomes: { include: { incomeSource: { select: { name: true, amount: true } } } },
      deductions: true,
      expensePlans: {
        include: { expenseCategory: { include: { budgetCategory: true, subcategory: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!budget) return null;

  return {
    ...budget,
    totalIncome: Number(budget.totalIncome),
    totalPlanned: Number(budget.totalPlanned),
    incomes: budget.incomes.map((inc) => ({
      ...inc,
      incomeSource: {
        ...inc.incomeSource,
        amount: Number(inc.incomeSource.amount),
      },
    })),
    deductions: budget.deductions.map((d) => ({
      ...d,
      value: Number(d.value),
    })),
    expensePlans: budget.expensePlans.map((p) => ({
      ...p,
      plannedAmount: Number(p.plannedAmount),
      expenseCategory: {
        ...p.expenseCategory,
        budgetCategory: {
          ...p.expenseCategory.budgetCategory,
          defaultPercentage: Number(p.expenseCategory.budgetCategory.defaultPercentage),
        },
      },
    })),
  };
}

async function getActiveBudgetCached(userId: string): Promise<BudgetWithDetails | null> {
  return unstable_cache(
    async () => {
      return getActiveBudgetUncached(userId);
    },
    [`active-budget-${userId}`],
    { revalidate: 30, tags: [`budget-${userId}`] }
  )();
}

async function getActiveBudgetUncached(userId: string): Promise<BudgetWithDetails | null> {
  const today = new Date();
  const budget = await prisma.budget.findFirst({
    where: {
      userId,
      startDate: { lte: today },
      endDate: { gte: today },
    },
    include: {
      incomes: { include: { incomeSource: { select: { name: true, amount: true } } } },
      deductions: true,
      expensePlans: {
        include: { expenseCategory: { include: { budgetCategory: true, subcategory: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!budget) return null;

  return {
    ...budget,
    totalIncome: Number(budget.totalIncome),
    totalPlanned: Number(budget.totalPlanned),
    incomes: budget.incomes.map((inc) => ({
      ...inc,
      incomeSource: {
        ...inc.incomeSource,
        amount: Number(inc.incomeSource.amount),
      },
    })),
    deductions: budget.deductions.map((d) => ({
      ...d,
      value: Number(d.value),
    })),
    expensePlans: budget.expensePlans.map((p) => ({
      ...p,
      plannedAmount: Number(p.plannedAmount),
      expenseCategory: {
        ...p.expenseCategory,
        budgetCategory: {
          ...p.expenseCategory.budgetCategory,
          defaultPercentage: Number(p.expenseCategory.budgetCategory.defaultPercentage),
        },
      },
    })),
  };
}

export async function getBudgetById(id: string): Promise<BudgetWithDetails | null> {
  const user = await getCurrentUser();
  const budget = await prisma.budget.findUnique({
    where: { id, userId: user.id },
    include: {
      incomes: { include: { incomeSource: { select: { name: true, amount: true } } } },
      deductions: true,
      expensePlans: {
        include: { expenseCategory: { include: { budgetCategory: true, subcategory: true } } },
      },
    },
  });

  if (!budget) return null;

  return {
    ...budget,
    totalIncome: Number(budget.totalIncome),
    totalPlanned: Number(budget.totalPlanned),
    incomes: budget.incomes.map((inc) => ({
      ...inc,
      incomeSource: {
        ...inc.incomeSource,
        amount: Number(inc.incomeSource.amount),
      },
    })),
    deductions: budget.deductions.map((d) => ({
      ...d,
      value: Number(d.value),
    })),
    expensePlans: budget.expensePlans.map((p) => ({
      ...p,
      plannedAmount: Number(p.plannedAmount),
      expenseCategory: {
        ...p.expenseCategory,
        budgetCategory: {
          ...p.expenseCategory.budgetCategory,
          defaultPercentage: Number(p.expenseCategory.budgetCategory.defaultPercentage),
        },
      },
    })),
  };
}

export async function createBudget(
  data: z.infer<typeof budgetCreateSchema>
): Promise<ActionResult<SerializedBudget>> {
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
    return {
      success: true,
      data: {
        ...budget,
        totalIncome: Number(budget.totalIncome),
        totalPlanned: Number(budget.totalPlanned),
      },
    };
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

const budgetExpensePlanSchema = z.object({
  budgetId: z.string().min(1),
  expenseCategoryId: z.string().min(1),
  plannedAmount: z.coerce.number().positive(),
});

export async function upsertBudgetExpensePlan(
  data: z.infer<typeof budgetExpensePlanSchema>
): Promise<ActionResult<{ id: string; plannedAmount: number; expenseCategoryId: string }>> {
  try {
    const user = await getCurrentUser();
    const parsed = budgetExpensePlanSchema.parse(data);

    const budget = await prisma.budget.findFirst({
      where: { id: parsed.budgetId, userId: user.id },
    });

    if (!budget) {
      return { success: false, error: "Presupuesto no encontrado" };
    }

    const expenseCategory = await prisma.expenseCategory.findFirst({
      where: { id: parsed.expenseCategoryId, userId: user.id },
    });

    if (!expenseCategory) {
      return { success: false, error: "Categoría de gasto no encontrada" };
    }

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.budgetExpensePlan.findUnique({
        where: {
          budgetId_expenseCategoryId: {
            budgetId: parsed.budgetId,
            expenseCategoryId: parsed.expenseCategoryId,
          },
        },
      });

      let plan;
      if (existing) {
        plan = await tx.budgetExpensePlan.update({
          where: { id: existing.id },
          data: { plannedAmount: parsed.plannedAmount },
        });
      } else {
        plan = await tx.budgetExpensePlan.create({
          data: {
            budgetId: parsed.budgetId,
            expenseCategoryId: parsed.expenseCategoryId,
            plannedAmount: parsed.plannedAmount,
          },
        });
      }

      const allPlans = await tx.budgetExpensePlan.findMany({
        where: { budgetId: parsed.budgetId },
      });
      const totalPlanned = allPlans.reduce((sum, p) => sum + Number(p.plannedAmount), 0);
      await tx.budget.update({
        where: { id: parsed.budgetId },
        data: { totalPlanned },
      });

      return plan;
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      data: {
        id: result.id,
        plannedAmount: Number(result.plannedAmount),
        expenseCategoryId: result.expenseCategoryId,
      },
    };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function deleteBudgetExpensePlan(
  budgetId: string,
  expenseCategoryId: string
): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();

    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId: user.id },
    });

    if (!budget) {
      return { success: false, error: "Presupuesto no encontrado" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.budgetExpensePlan.delete({
        where: {
          budgetId_expenseCategoryId: {
            budgetId,
            expenseCategoryId,
          },
        },
      });

      const allPlans = await tx.budgetExpensePlan.findMany({
        where: { budgetId },
      });
      const totalPlanned = allPlans.reduce((sum, p) => sum + Number(p.plannedAmount), 0);
      await tx.budget.update({
        where: { id: budgetId },
        data: { totalPlanned },
      });
    });

    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}
