const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const app = express();
const port = 3000;
const prisma = new PrismaClient();
const saltRounds = 10;
const JWT_SECRET = 'your_jwt_secret'; // Utilizza una variabile d'ambiente in produzione

// Middleware per analizzare i corpi JSON nelle richieste in arrivo
app.use(express.json());

// Serve i file statici dalla cartella 'public'
app.use(express.static('public'));

app.post('/api/register', async (req, res) => {
    console.log('Richiesta ricevuta su /api/register', req.body);
    const { email, password } = req.body;

    try {
        // Verifica se esiste già un utente con la stessa email
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            // Se l'utente esiste, invia un messaggio di errore
            return res.status(409).json({ message: 'Email già in uso' });
        }

        // Se non esiste, procedi con la creazione dell'utente
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'PENDING'
            }
        });

        // Crea e invia il token JWT
        const token = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, userId: newUser.id });
    } catch (error) {
        console.error('Errore dettagliato nella registrazione:', error);
        res.status(500).json({ message: 'Errore nella registrazione', error: error.message });
    }
});


// Endpoint per l'aggiornamento del profilo utente (seconda fase)
app.post('/api/user/update', verifyToken, async (req, res) => {
    console.log('Richiesta ricevuta su /api/user/update', req.body);
    const userId = req.user.userId; // ottenuto dal token JWT
    const {
        cardNumber,
        name,
        surname,
        gender,
        birthDate,
        nationality,
        phoneNumber,
        studyField,
        originUniversity,
        hostUniversity,
        exchangeDuration,
        studentNumber,
        countryOfOrigin,
        cityOfOrigin,
        addressCityOfOrigin,
        documentType,
        documentNumber,
        documentExpiration,
        documentIssuer
    } = req.body;

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                cardNumber,
                name,
                surname,
                gender,
                birthDate: birthDate ? new Date(birthDate) : null,
                nationality,
                phoneNumber,
                studyField,
                originUniversity,
                hostUniversity,
                exchangeDuration: exchangeDuration ? parseInt(exchangeDuration) : null,
                studentNumber,
                countryOfOrigin,
                cityOfOrigin,
                addressCityOfOrigin,
                documentType,
                documentNumber,
                documentExpiration: documentExpiration ? new Date(documentExpiration) : null,
                documentIssuer
            }
        });
        res.json({ message: 'Profilo aggiornato con successo' });
    } catch (error) {
        res.status(500).json({ message: 'Errore nell\'aggiornamento del profilo', error: error.message });
    }
});


// Endpoint per il login
app.post('/api/login', async (req, res) => {
    console.log('Richiesta ricevuta su /api/login', req.body);
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: 'Credenziali non valide' });
        }

        if (user.role === 'PENDING') {
            return res.status(403).json({ message: 'Utente in attesa di approvazione' });
        }

        if (user.role === 'REJECTED') {
            return res.status(403).json({ message: 'Utente rifiutato' });
        }
        
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Errore nel login' });
    }
});

// Middleware per verificare il token JWT
function verifyToken(req, res, next) {
    console.log('Richiesta ricevuta su /api/user/update', req.headers);
    console.log("Verifica del token JWT...");
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(403).send('Token non fornito');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).send('Token non valido');
    }
}

// Endpoint per l'aggiornamento del profilo utente (seconda fase)
app.post('/api/user/update', verifyToken, async (req, res) => {
    console.log('Richiesta di aggiornamento profilo ricevuta:', req.body);
    const userId = req.user.userId; // ottenuto dal token JWT
    const profileData = req.body;

    console.log('Inizio aggiornamento profilo per l\'utente con ID:', userId);
    console.log('Dati profilo:', profileData);

    try {
        console.log('Aggiornamento profilo per l\'utente con ID:', userId);
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: profileData
        });
        console.log('Profilo aggiornato con successo', updatedUser);
        res.json({ message: 'Profilo aggiornato con successo' });
    } catch (error) {
        console.error('Errore dettagliato nell\'aggiornamento del profilo:', error);
        res.status(500).json({ message: 'Errore nell\'aggiornamento del profilo', error: error.message });
    }    
});

// Endpoint per ottenere i dati dell'utente
app.get('/api/user/data', verifyToken, async (req, res) => {
    try {
        // Ottieni l'ID dell'utente dal token JWT
        const userId = req.user.userId;

        // Trova l'utente nel database
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).send('Utente non trovato');
        }

        // Invia i dati dell'utente al client
        res.json({
            cardNumber: user.cardNumber,
            email: user.email,
            role: user.role,
            name: user.name,
            surname: user.surname,
            gender: user.gender,
            birthdate: user.birthDate,
            nationality: user.nationality,
            phoneNumber: user.phoneNumber,
            studyField: user.studyField,
            originUniversity: user.originUniversity,
            hostUniversity: user.hostUniversity,
            exchangeDuration: user.exchangeDuration,
            studentNumber: user.studentNumber,
            countryOfOrigin: user.countryOfOrigin,
            cityOfOrigin: user.cityOfOrigin,
            addressCityOfOrigin: user.addressCityOfOrigin,
            documentType: user.documentType,
            documentNumber: user.documentNumber,
            documentExpiration: user.documentExpiration,
            documentIssuer: user.documentIssuer
        });
    } catch (error) {
        console.error('Errore nel recupero dei dati utente:', error);
        res.status(500).send('Errore interno del server');
    }
});

// Endpoint per ottenere i dati degli utenti in attesa di approvazione
app.get('/api/users/pending', verifyToken, async (req, res) => {
    console.log('Richiesta ricevuta su /api/users/pending');
    if (['ADMIN', 'VOLUNTEER'].includes(req.user.role)) {
        const pendingUsers = await prisma.user.findMany({
            where: { role: 'PENDING' }
        });
        res.json(pendingUsers);
    } else {
        res.status(403).send('Accesso non autorizzato');
    }
});

// Endpoint per approvare o rifiutare un utente
app.post('/api/users/approve', verifyToken, async (req, res) => {
    console.log('Richiesta ricevuta su /api/users/approve', req.body);
    const { userId, newRole } = req.body;
    if (['ADMIN', 'VOLUNTEER'].includes(req.user.role)) {
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole }
        });
        res.json({ message: 'Utente approvato con successo' });
        // Qui potresti inviare una notifica all'utente
    } else {
        res.status(403).send('Accesso non autorizzato');
    }
});

// Endpoint per rifiutare un utente
app.post('/api/users/reject', verifyToken, async (req, res) => {
    console.log('Richiesta ricevuta su /api/users/reject', req.body);
    const { userId } = req.body;
    if (['ADMIN', 'VOLUNTEER'].includes(req.user.role)) {
        await prisma.user.update({
            where: { id: userId },
            data: { role: 'REJECTED' }
        });
        res.json({ message: 'Utente rifiutato con successo' });
        // Qui potresti inviare una notifica all'utente
    } else {
        res.status(403).send('Accesso non autorizzato');
    }
})


// Endpoint per ottenere e filtrare gli utenti
app.get('/api/users', verifyToken, async (req, res) => {
    const roleFilter = req.query.role;

    try {
        let queryOptions = {};
        if (['ADMIN', 'VOLUNTEER'].includes(req.user.role)) {
            if (roleFilter) {
                queryOptions.where = { role: roleFilter };
            }
        } else {
            return res.status(403).send('Accesso non autorizzato');
        }

        const users = await prisma.user.findMany(queryOptions);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero degli utenti' });
    }
});

// Endpoint per ottenere il ruolo dell'utente
app.get('/api/user/role', verifyToken, (req, res) => {
    console.log('Richiesta ricevuta su /api/user/role');
    res.json({ role: req.user.role });
});

app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
});