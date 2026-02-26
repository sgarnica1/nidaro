"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import type { ActionResult } from "@/types";
import type { BudgetCategory } from "@/generated/prisma/client";

export type CategoryWithPercentage = BudgetCategory & {
  userPercentage: number;
};

export async function getCategoriesWithPercentages(): Promise<CategoryWithPercentage[]> {
  const user = await getCurrentUser();

  const categories = await prisma.budgetCategory.findMany({
    orderBy: { order: "asc" },
    include: {
      userPercentages: { where: { userId: user.id } },
    },
  });

  return categories.map((cat) => ({
    ...cat,
    userPercentage:
      cat.userPercentages[0]?.percentage !== undefined
        ? Number(cat.userPercentages[0].percentage)
        : Number(cat.defaultPercentage),
  }));
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
