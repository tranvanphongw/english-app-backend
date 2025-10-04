import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  const passwordHash = await hash('admin123', 10);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, role: 'ADMIN', nickname: 'Admin' }
  });
  console.log('Seeded admin:', email, 'pass=admin123');
}

main().finally(() => prisma.$disconnect());
