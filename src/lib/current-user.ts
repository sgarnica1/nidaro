import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/prisma/client";

export async function getCurrentUser(): Promise<User> {
  const { userId } = await auth();
  if (!userId) throw new Error("No autenticado");

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existing) return existing;

  // Auto-create user on first login (fallback when webhook is not configured)
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("No autenticado");

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    email;

  return prisma.user.create({
    data: { clerkId: userId, name, email },
  });
}
