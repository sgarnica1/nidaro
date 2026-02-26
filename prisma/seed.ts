import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const categories = [
    { name: "Necesidades", defaultPercentage: 50, order: 1 },
    { name: "Gustos", defaultPercentage: 30, order: 2 },
    { name: "Ahorro", defaultPercentage: 20, order: 3 },
  ];

  for (const cat of categories) {
    await prisma.budgetCategory.upsert({
      where: { id: cat.name.toLowerCase() },
      update: {},
      create: {
        id: cat.name.toLowerCase(),
        name: cat.name,
        defaultPercentage: cat.defaultPercentage,
        order: cat.order,
      },
    });
  }

  const necesidades = await prisma.budgetCategory.findUniqueOrThrow({
    where: { id: "necesidades" },
  });

  const subcategories = [
    { categoryId: necesidades.id, name: "Gastos Fijos" },
    { categoryId: necesidades.id, name: "Gastos Variables Necesarios" },
  ];

  for (const sub of subcategories) {
    const existing = await prisma.budgetSubcategory.findFirst({
      where: { categoryId: sub.categoryId, name: sub.name },
    });
    if (!existing) {
      await prisma.budgetSubcategory.create({ data: sub });
    }
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
