import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Check if super admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@tatawarga.com' }
  })

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: 'admin@tatawarga.com',
        // Note: In a real app, this should be a hashed password (e.g. bcrypt)
        password: 'password123',
        name: 'Super Admin',
        role: 'SUPER_ADMIN'
      }
    })
    console.log('Super admin created!')
  } else {
    console.log('Super admin already exists.')
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
