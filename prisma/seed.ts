import { PrismaClient } from '../lib/generated/prisma/client';
import { CATEGORIES } from '../lib/data/products';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: { label: category.label, stepIndex: category.stepIndex },
      create: { id: category.id, label: category.label, stepIndex: category.stepIndex },
    });

    for (const [position, product] of category.products.entries()) {
      await prisma.product.upsert({
        where: { id: product.id },
        update: {
          name: product.name,
          description: product.description,
          image: product.image,
          badge: product.badge ?? null,
          compareAtPrice: product.compareAtPrice ?? null,
          price: product.price,
          learnMoreUrl: product.learnMoreUrl ?? null,
          position,
        },
        create: {
          id: product.id,
          categoryId: category.id,
          name: product.name,
          description: product.description,
          image: product.image,
          badge: product.badge ?? null,
          compareAtPrice: product.compareAtPrice ?? null,
          price: product.price,
          learnMoreUrl: product.learnMoreUrl ?? null,
          position,
        },
      });

      for (const variant of product.variants ?? []) {
        await prisma.variant.upsert({
          where: { id: variant.id },
          update: { label: variant.label, color: variant.color },
          create: {
            id: variant.id,
            productId: product.id,
            label: variant.label,
            color: variant.color,
          },
        });
      }
    }
  }

  console.log(`✅ Seeded ${CATEGORIES.length} categories`);
  console.log(`✅ Seeded ${CATEGORIES.flatMap((c) => c.products).length} products`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
