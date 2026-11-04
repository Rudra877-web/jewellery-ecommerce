import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const prods = await prisma.product.findMany({
    select: { id: true, sku: true, name: true, images: true, categoryId: true },
    orderBy: { sku: 'asc' }
  });
  console.log(`Total products in DB: ${prods.length}`);
  
  for (const p of prods) {
    console.log(`[${p.sku}] ${p.name} -> ${p.images}`);
  }
}

main().finally(() => prisma.$disconnect());
