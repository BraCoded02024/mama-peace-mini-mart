import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2] ?? "admin";
  const password = process.argv[3] ?? "mamapeace123";

  const passwordHash = await hashPassword(password);

  await prisma.admin.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });

  console.log(`Admin user "${username}" ready.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
