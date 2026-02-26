"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import type { ActionResult } from "@/types";
import type { IncomeSource } from "@/generated/prisma/client";

const incomeSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  amount: z.coerce.number().positive("El monto debe ser positivo"),
});

export async function getIncomeSources(): Promise<IncomeSource[]> {
  const user = await getCurrentUser();
  return prisma.incomeSource.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
}

export async function createIncomeSource(
  data: z.infer<typeof incomeSchema>
): Promise<ActionResult<IncomeSource>> {
  try {
    const user = await getCurrentUser();
    const parsed = incomeSchema.parse(data);
    const source = await prisma.incomeSource.create({
      data: { userId: user.id, name: parsed.name, amount: parsed.amount },
    });
    revalidatePath("/ingresos");
    return { success: true, data: source };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function updateIncomeSource(
  id: string,
  data: z.infer<typeof incomeSchema>
): Promise<ActionResult<IncomeSource>> {
  try {
    const user = await getCurrentUser();
    const parsed = incomeSchema.parse(data);
    const source = await prisma.incomeSource.update({
      where: { id, userId: user.id },
      data: { name: parsed.name, amount: parsed.amount },
    });
    revalidatePath("/ingresos");
    return { success: true, data: source };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function toggleIncomeSource(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    const source = await prisma.incomeSource.findUniqueOrThrow({
      where: { id, userId: user.id },
    });
    await prisma.incomeSource.update({
      where: { id },
      data: { isActive: !source.isActive },
    });
    revalidatePath("/ingresos");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function deleteIncomeSource(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    await prisma.incomeSource.delete({ where: { id, userId: user.id } });
    revalidatePath("/ingresos");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}
