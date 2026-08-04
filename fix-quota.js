const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function fix() {
  const result = await prisma.tenant.updateMany({
    where: { maxWarga: 1 },
    data: { maxWarga: -1 }
  });
  console.log(`Sukses! ${result.count} RT yang tersangkut kuota 1 warga kini telah menjadi Unlimited (-1).`);
}
fix().finally(() => process.exit(0));
