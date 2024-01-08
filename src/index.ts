import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const newUser = await prisma.user.create({
    data: {
      email: 'alice@prisma.io',
      name: 'Alice',
    },
  });
  console.log('Nuovo utente:', newUser);
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
