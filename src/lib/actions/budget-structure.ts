"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import type { ActionResult } from "@/types";
import type { BudgetCategory, BudgetSubcategory } from "@/generated/prisma/client";

export type CategoryWithPercentage = Omit<BudgetCategory, "defaultPercentage"> & {
  defaultPercentage: number;
  userPercentage: number;
  subcategories: BudgetSubcategory[];
};

export async function getCategoriesWithPercentages(): Promise<CategoryWithPercentage[]> {
  const user = await getCurrentUser();

  const categories = await prisma.budgetCategory.findMany({
    orderBy: { order: "asc" },
    include: {
      userPercentages: { where: { userId: user.id } },
      subcategories: { orderBy: { name: "asc" } },
    },
  });

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    order: cat.order,
    defaultPercentage: Number(cat.defaultPercentage),
    userPercentage:
      cat.userPercentages[0]?.percentage !== undefined
        ? Number(cat.userPercentages[0].percentage)
        : Number(cat.defaultPercentage),
    subcategories: cat.subcategories.map((sub) => ({
      id: sub.id,
      categoryId: sub.categoryId,
      name: sub.name,
    })),
  }));
}

export async function createBudgetSubcategory(
  categoryId: string,
  name: string
): Promise<ActionResult<BudgetSubcategory>> {
  try {
    const sub = await prisma.budgetSubcategory.create({
      data: { categoryId, name: name.trim() },
    });
    revalidatePath("/estructura");
    return { success: true, data: sub };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function deleteBudgetSubcategory(id: string): Promise<ActionResult> {
  try {
    await prisma.budgetSubcategory.delete({ where: { id } });
    revalidatePath("/estructura");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function updateCategoryPercentages(
  percentages: { categoryId: string; percentage: number }[]
): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();

    const total = percentages.reduce((sum, p) => sum + p.percentage, 0);
    if (Math.abs(total - 100) > 0.01) {
      return { success: false, error: "Los porcentajes deben sumar 100%" };
    }

    await prisma.$transaction(
      percentages.map((p) =>
        prisma.userCategoryPercentage.upsert({
          where: { userId_categoryId: { userId: user.id, categoryId: p.categoryId } },
          update: { percentage: p.percentage },
          create: { userId: user.id, categoryId: p.categoryId, percentage: p.percentage },
        })
      )
    );

    revalidatePath("/estructura");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}
