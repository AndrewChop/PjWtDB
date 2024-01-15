const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDatabase() {
    await prisma.user.deleteMany({});
    // Aggiungi qui ulteriori comandi per altre tabelle se necessario
    console.log('Database resettato!');
}

resetDatabase()
    .catch(e => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
