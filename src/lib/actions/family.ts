"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import type { ActionResult } from "@/types";
import type { FamilyGroup, FamilyMember, User } from "@/generated/prisma/client";

export type FamilyGroupWithMembers = FamilyGroup & {
  members: (FamilyMember & { user: Pick<User, "id" | "name" | "email"> })[];
};

export async function getMyFamilyGroups(): Promise<FamilyGroupWithMembers[]> {
  const user = await getCurrentUser();
  const memberships = await prisma.familyMember.findMany({
    where: { userId: user.id },
    include: {
      familyGroup: {
        include: {
          members: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
      },
    },
  });
  return memberships.map((m) => m.familyGroup);
}

export async function createFamilyGroup(name: string): Promise<ActionResult<FamilyGroup>> {
  try {
    const user = await getCurrentUser();
    z.string().min(1, "El nombre es requerido").parse(name);

    const group = await prisma.$transaction(async (tx) => {
      const g = await tx.familyGroup.create({
        data: { name, ownerId: user.id },
      });
      await tx.familyMember.create({
        data: { familyGroupId: g.id, userId: user.id, role: "OWNER" },
      });
      return g;
    });
    revalidatePath("/perfil/familia");
    return { success: true, data: group };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function inviteMemberByEmail(
  familyGroupId: string,
  email: string
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();

    const ownerMembership = await prisma.familyMember.findFirst({
      where: { familyGroupId, userId: currentUser.id, role: "OWNER" },
    });
    if (!ownerMembership) {
      return { success: false, error: "Solo el propietario puede invitar miembros" };
    }

    const invitedUser = await prisma.user.findUnique({ where: { email } });
    if (!invitedUser) {
      return { success: false, error: "No se encontró un usuario con ese correo" };
    }

    const existing = await prisma.familyMember.findFirst({
      where: { familyGroupId, userId: invitedUser.id },
    });
    if (existing) {
      return { success: false, error: "El usuario ya es miembro del grupo" };
    }

    await prisma.familyMember.create({
      data: { familyGroupId, userId: invitedUser.id, role: "EDITOR" },
    });
    revalidatePath("/perfil/familia");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function removeMember(familyGroupId: string, memberId: string): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();

    const ownerMembership = await prisma.familyMember.findFirst({
      where: { familyGroupId, userId: currentUser.id, role: "OWNER" },
    });
    if (!ownerMembership) {
      return { success: false, error: "Solo el propietario puede remover miembros" };
    }

    const memberToRemove = await prisma.familyMember.findUniqueOrThrow({ where: { id: memberId } });
    if (memberToRemove.role === "OWNER") {
      return { success: false, error: "No puedes remover al propietario" };
    }

    await prisma.familyMember.delete({ where: { id: memberId } });
    revalidatePath("/perfil/familia");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function leaveFamilyGroup(familyGroupId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    const membership = await prisma.familyMember.findFirst({
      where: { familyGroupId, userId: user.id },
    });
    if (!membership) return { success: false, error: "No eres miembro de este grupo" };
    if (membership.role === "OWNER") {
      return { success: false, error: "El propietario no puede abandonar el grupo. Elimínalo." };
    }
    await prisma.familyMember.delete({ where: { id: membership.id } });
    revalidatePath("/perfil/familia");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function deleteFamilyGroup(familyGroupId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    await prisma.familyGroup.delete({ where: { id: familyGroupId, ownerId: user.id } });
    revalidatePath("/perfil/familia");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}
