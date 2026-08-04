const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function fix() {
  const result = await prisma.tenant.updateMany({
    where: { subscriptionPlan: { contains: "Topup" } },
    data: { subscriptionPlan: "Pro" } // Mengembalikan ke nama aslinya
  });
  console.log(`Berhasil memperbaiki nama paket untuk ${result.count} RT!`);
}
fix().finally(() => process.exit(0));
