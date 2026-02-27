"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import type { ActionResult } from "@/types";
import type { BudgetTemplate, BudgetTemplateItem, ExpenseCategory, BudgetCategory, BudgetSubcategory } from "@/generated/prisma/client";

const templateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

const templateItemSchema = z.object({
  expenseCategoryId: z.string().min(1),
  plannedAmount: z.coerce.number().positive("El monto debe ser positivo"),
});

type SerializedBudgetCategory = Omit<BudgetCategory, "defaultPercentage"> & { defaultPercentage: number };
type SerializedTemplateItem = Omit<BudgetTemplateItem, "plannedAmount"> & {
  plannedAmount: number;
  expenseCategory: ExpenseCategory & { 
    budgetCategory: SerializedBudgetCategory;
    subcategory: BudgetSubcategory | null;
  };
};

export type TemplateItemWithCategory = SerializedTemplateItem;

export type TemplateWithItems = BudgetTemplate & {
  items: TemplateItemWithCategory[];
};

export async function getTemplates(): Promise<TemplateWithItems[]> {
  const user = await getCurrentUser();
  const rows = await prisma.budgetTemplate.findMany({
    where: { userId: user.id },
    include: {
      items: {
        include: { expenseCategory: { include: { budgetCategory: true, subcategory: true } } },
        orderBy: { expenseCategory: { name: "asc" } },
      },
    },
    orderBy: { name: "asc" },
  });

  return rows.map((template) => ({
    ...template,
    items: template.items.map((item) => ({
      ...item,
      plannedAmount: Number(item.plannedAmount),
      expenseCategory: {
        id: item.expenseCategory.id,
        userId: item.expenseCategory.userId,
        name: item.expenseCategory.name,
        color: item.expenseCategory.color,
        categoryId: item.expenseCategory.categoryId,
        subcategoryId: item.expenseCategory.subcategoryId,
        budgetCategory: {
          id: item.expenseCategory.budgetCategory.id,
          name: item.expenseCategory.budgetCategory.name,
          order: item.expenseCategory.budgetCategory.order,
          defaultPercentage: Number(item.expenseCategory.budgetCategory.defaultPercentage),
        },
        subcategory: item.expenseCategory.subcategory
          ? {
              id: item.expenseCategory.subcategory.id,
              categoryId: item.expenseCategory.subcategory.categoryId,
              name: item.expenseCategory.subcategory.name,
            }
          : null,
      },
    })),
  }));
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

type SerializedTemplateItemBasic = Omit<BudgetTemplateItem, "plannedAmount"> & { plannedAmount: number };

export async function upsertTemplateItem(
  templateId: string,
  data: z.infer<typeof templateItemSchema>
): Promise<ActionResult<SerializedTemplateItemBasic>> {
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
    return { success: true, data: { ...item, plannedAmount: Number(item.plannedAmount) } };
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
