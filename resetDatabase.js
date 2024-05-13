// resetDatabase.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDatabase() {
    try {
        // Elimina tutti gli utenti (o qualsiasi altra tabella che vuoi resettare)
        await prisma.user.deleteMany({});
        console.log('Database resettato con successo.');
    } catch (error) {
        console.error('Errore nel reset del database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetDatabase();
