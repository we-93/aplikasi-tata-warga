import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = [
    {
      name: 'TRIAL',
      slug: 'trial',
      price: 0,
      billingPeriod: 'TRIAL',
      maxWarga: 50,
      maxSurat: 5,
      maxAiChat: 10
    },
    {
      name: 'STARTER',
      slug: 'starter',
      price: 49000,
      billingPeriod: 'MONTHLY',
      maxWarga: 150,
      maxSurat: 20,
      maxAiChat: 50
    },
    {
      name: 'PRO',
      slug: 'pro',
      price: 99000,
      billingPeriod: 'MONTHLY',
      maxWarga: 500,
      maxSurat: 50,
      maxAiChat: 150
    },
    {
      name: 'PREMIUM',
      slug: 'premium',
      price: 149000,
      billingPeriod: 'MONTHLY',
      maxWarga: 1000,
      maxSurat: 100,
      maxAiChat: 300
    },
    {
      name: 'PLATINUM',
      slug: 'platinum',
      price: 299000,
      billingPeriod: 'MONTHLY',
      maxWarga: 0, // unlimited
      maxSurat: 0, // unlimited
      maxAiChat: 1000
    }
  ];

  console.log('Seeding products...');
  for (const prod of products) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: prod,
    });
  }
  console.log('Products seeded successfully.');
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
