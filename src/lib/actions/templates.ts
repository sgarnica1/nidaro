"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import type { ActionResult } from "@/types";
import type { BudgetTemplate, BudgetTemplateItem, ExpenseCategory, BudgetCategory } from "@/generated/prisma/client";

const templateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

const templateItemSchema = z.object({
  expenseCategoryId: z.string().min(1),
  plannedAmount: z.coerce.number().positive("El monto debe ser positivo"),
});

export type TemplateItemWithCategory = BudgetTemplateItem & {
  expenseCategory: ExpenseCategory & { budgetCategory: BudgetCategory };
};

export type TemplateWithItems = BudgetTemplate & {
  items: TemplateItemWithCategory[];
};

export async function getTemplates(): Promise<TemplateWithItems[]> {
  const user = await getCurrentUser();
  return prisma.budgetTemplate.findMany({
    where: { userId: user.id },
    include: {
      items: {
        include: { expenseCategory: { include: { budgetCategory: true } } },
        orderBy: { expenseCategory: { name: "asc" } },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function createTemplate(name: string): Promise<ActionResult<BudgetTemplate>> {
  try {
    const user = await getCurrentUser();
    const parsed = templateSchema.parse({ name });
    const template = await prisma.budgetTemplate.create({
      data: { userId: user.id, name: parsed.name },
    });
    revalidatePath("/plantillas");
    return { success: true, data: template };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function updateTemplate(id: string, name: string): Promise<ActionResult<BudgetTemplate>> {
  try {
    const user = await getCurrentUser();
    const parsed = templateSchema.parse({ name });
    const template = await prisma.budgetTemplate.update({
      where: { id, userId: user.id },
      data: { name: parsed.name },
    });
    revalidatePath("/plantillas");
    return { success: true, data: template };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function deleteTemplate(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    await prisma.budgetTemplate.delete({ where: { id, userId: user.id } });
    revalidatePath("/plantillas");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function upsertTemplateItem(
  templateId: string,
  data: z.infer<typeof templateItemSchema>
): Promise<ActionResult<BudgetTemplateItem>> {
  try {
    const user = await getCurrentUser();
    await prisma.budgetTemplate.findUniqueOrThrow({ where: { id: templateId, userId: user.id } });
    const parsed = templateItemSchema.parse(data);

    const existing = await prisma.budgetTemplateItem.findFirst({
      where: { templateId, expenseCategoryId: parsed.expenseCategoryId },
    });

    let item: BudgetTemplateItem;
    if (existing) {
      item = await prisma.budgetTemplateItem.update({
        where: { id: existing.id },
        data: { plannedAmount: parsed.plannedAmount },
      });
    } else {
      item = await prisma.budgetTemplateItem.create({
        data: { templateId, expenseCategoryId: parsed.expenseCategoryId, plannedAmount: parsed.plannedAmount },
      });
    }
    revalidatePath("/plantillas");
    return { success: true, data: item };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function deleteTemplateItem(itemId: string): Promise<ActionResult> {
  try {
    await prisma.budgetTemplateItem.delete({ where: { id: itemId } });
    revalidatePath("/plantillas");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}
