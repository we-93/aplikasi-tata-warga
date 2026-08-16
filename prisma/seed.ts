import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Check if super admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@tatawarga.com' }
  })

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: 'admin@tatawarga.com',
        password: hashedPassword,
        name: 'Super Admin',
        role: 'SUPER_ADMIN'
      }
    })
    console.log('Super admin created!')
  } else {
    console.log('Super admin already exists.')
  }

  // 2. Create a Mock RT Tenant and RT Admin for testing
  let tenant = await prisma.tenant.findFirst({
    where: { name: 'RT 01 Percontohan' }
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'RT 01 Percontohan',
        slug: 'rt-01-percontohan',
        aiChatCredits: 30,
        aiDocCredits: 5,
      }
    });
    console.log('Tenant RT 01 created!');
  }

  const existingRtAdmin = await prisma.user.findUnique({
    where: { email: 'rt@tatawarga.com' }
  });

  if (!existingRtAdmin) {
    await prisma.user.create({
      data: {
        email: 'rt@tatawarga.com',
        password: hashedPassword,
        name: 'Ketua RT 01',
        role: 'TENANT_ADMIN',
        tenantId: tenant.id
      }
    });
    console.log('RT Admin created! (email: rt@tatawarga.com, password: password123)');
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
