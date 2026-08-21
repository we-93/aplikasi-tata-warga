const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const doc = await prisma.knowledgeDocument.findFirst({
    orderBy: { createdAt: "desc" },
  });
  console.log("DB Error:", doc?.error);
}

main().finally(() => prisma.$disconnect());
