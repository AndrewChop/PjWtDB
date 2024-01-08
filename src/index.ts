import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const newUser = await prisma.user.create({
    data: {
      email: 'alice@prisma.io',
      name: 'Alice',
      cardNumber: '123456789',
      surname: '',
      birthDate: '',
      nationality: '',
      countryOfOrigin: 'Country',
      cityOfOrigin: 'City',

      // Add other missing properties here
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
