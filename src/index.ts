import { PrismaClient } from '@prisma/client';
import app from '../app'; // Importa app da app.js

const prisma = new PrismaClient();
const port = 3000;

async function main() {
    // La logica esistente con Prisma...
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Avvia il server
app.listen(port, () => {
  console.log(`Server in ascolto su http://localhost:${port}`);
});

