require('dotenv').config(); //Deve essere la prima linea eseguita

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

// Verificare che la chiave sia stata caricata correttamente
console.log('La chiave segreta JWT è:', process.env.JWT_SECRET);

const app = express();
const port = 3000;
const prisma = new PrismaClient();
const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;
//const JWT_SECRET = 'your_jwt_secret'; // Utilizza una variabile d'ambiente in produzione

// Middleware per analizzare i corpi JSON nelle richieste in arrivo
app.use(express.json());

// Serve i file statici dalla cartella 'public'
app.use(express.static('public'));

// Configura il middleware CORS
app.use(cors({
    origin: 'http://localhost:3000', // Permette solo richieste da questa origine
    methods: ['GET', 'POST'], // Metodi consentiti
    credentials: true // Permette credenziali come cookies, autorizzazione headers ecc.
}));    

// Definizioni delle Route
app.post('/api/register', async (req, res) => {
    console.log('Richiesta ricevuta su /api/register', req.body);
    const { email, password, role: inputRole} = req.body;

    try {
        // Verifica se esiste già un utente con la stessa email
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            // Se l'utente esiste, invia un messaggio di errore
            console.log('Utente esistente');
            return res.status(409).json({ message: 'Email già in uso' });
        }

        // Hash della password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Determina il ruolo in base al numero di utenti nel database
        const userCount = await prisma.user.count();
        const assignedRole = userCount === 0 ? 'ADMIN' : inputRole || 'VOLUNTEER';

        // Crea l'utente 
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: assignedRole
            }
        });

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Errore dettagliato nella registrazione:', error);
        res.status(500).json({ message: 'Errore nella registrazione', error: error.message });
    }
});

// Endpoint per il login
app.post('/api/login', async (req, res) => {
    console.log('Richiesta ricevuta su /api/login', req.body);
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Credenziali non valide' });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined');
            throw new Error('Internal server error');
        }
/*
        if (user.role === 'PENDING') {
            return res.status(403).json({ message: 'Utente in attesa di approvazione' });
        }

        if (user.role === 'REJECTED') {
            return res.status(403).json({ message: 'Utente rifiutato' });
        }
*/        
        const token = jwt.sign({ userId: user.id /*, role: user.role */}, process.env.JWT_SECRET);
        res.json({ token });
    } catch (error) {
        console.error('Errore dettagliato nel login:', error);
        res.status(500).json({ message: 'Errore nel login' });
    }
});

// Endpoint per l'aggiornamento del profilo utente (seconda fase)
app.post('/api/user/update', verifyToken, async (req, res) => {
    console.log('Richiesta ricevuta su /api/user/update', req.body);
    const userId = req.user.userId; // ottenuto dal token JWT

    // Recupera l'utente esistente dal database
    const existingUser = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!existingUser) {
        return res.status(404).json({ message: "Utente non trovato" });
    }

    const {
        cardNumber,
        role,
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
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                cardNumber: cardNumber || existingUser.cardNumber,
                role: role || existingUser.role,
                name: name || existingUser.name,
                surname: surname || existingUser.surname,
                gender: gender || existingUser.gender,
                birthDate: birthDate ? new Date(birthDate) : existingUser.birthDate,
                nationality: nationality || existingUser.nationality,
                phoneNumber: phoneNumber || existingUser.phoneNumber,
                studyField: studyField || existingUser.studyField,
                originUniversity: originUniversity || existingUser.originUniversity,
                hostUniversity: hostUniversity || existingUser.hostUniversity,
                exchangeDuration: exchangeDuration ? parseInt(exchangeDuration) : existingUser.exchangeDuration,
                studentNumber: studentNumber || existingUser.studentNumber,
                countryOfOrigin: countryOfOrigin || existingUser.countryOfOrigin,
                cityOfOrigin: cityOfOrigin || existingUser.cityOfOrigin,
                addressCityOfOrigin: addressCityOfOrigin || existingUser.addressCityOfOrigin,
                documentType: documentType || existingUser.documentType,
                documentNumber: documentNumber || existingUser.documentNumber,
                documentExpiration: documentExpiration ? new Date(documentExpiration) : existingUser.documentExpiration,
                documentIssuer: documentIssuer || existingUser.documentIssuer,
            }
        });
        res.json({ message: 'Profilo aggiornato con successo', user: updatedUser });
    } catch (error) {
        console.error('Errore dettagliato nell\'aggiornamento del profilo:', error);
        res.status(500).json({ message: 'Errore nell\'aggiornamento del profilo', error: error.message });
    }
});



// Middleware per verificare il token JWT
function verifyToken(req, res, next) {
    console.log('Richiesta ricevuta su /api/user/update', req.headers);
    console.log("Verifica del token JWT...");
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Token ricevuto:', token);

    if (!token) {
        console.log('Token non fornito');
        return next(new Error('Token not provided'));
        //return res.status(403).send('Token non fornito');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Token decodificato:', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token non valido:', error);
        res.status(401).send('Token non valido');
    }
}
/*
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
});*/

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
            console.log('Utente non trovato');
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

/*
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
*/

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

// Endpoint per ottenere tutti gli studenti
app.get('/api/users/students', async (req, res) => {
    try {
        const students = await prisma.user.findMany({
            where: { role: 'STUDENT' }
        });
        res.json(students);
    } catch (error) {
        console.error('Failed to retrieve students:', error);
        res.status(500).send('Failed to retrieve student data');
    }
});

// Endpoint per ottenere tutti i volontari
app.get('/api/users/volunteers', async (req, res) => {
    try {
        const volunteers = await prisma.user.findMany({
            where: { role: 'VOLUNTEER' }
        });
        res.json(volunteers);
    } catch (error) {
        console.log('Failed to retrieve volunteers:', error);
        res.status(500).send('Failed to retrieve volunteer data');
    }
});


app.listen(port, '0.0.0.0', () => {
    console.log(`Server in ascolto su http://192.168.1.38:${port}`);
});