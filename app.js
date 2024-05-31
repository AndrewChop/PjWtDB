require('dotenv').config(); //Deve essere la prima linea eseguita

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');


// Verificare che la chiave sia stata caricata correttamente
console.log('The JWT secret key is:', process.env.JWT_SECRET);

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

/*// Configura il middleware CORS
app.use(cors({
    origin: 'http://192.168.1.38:3000', // Permette solo richieste da questa origine
    methods: ['GET', 'POST'], // Metodi consentiti
    credentials: true // Permette credenziali come cookies, autorizzazione headers ecc.
}));    
*/



const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('New connection WebSocket');
    ws.on('message', (message) => {
        console.log('Message received:', message);
    });

    ws.on('close', () => {
        console.log('Connection WebSocket closed');
    });

    ws.send('Welcome in the server Websocket!');
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

function broadcast(data) {
    try {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    } catch (error) {
        console.error('Error during data transmission:', error);
    }
}






// Definizioni delle Route
app.post('/api/register', async (req, res) => {
    console.log('Request received on /api/register', req.body);
    const { email, password, role: inputRole} = req.body;

    try {
        // Verifica se esiste già un utente con la stessa email
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            // Se l'utente esiste, invia un messaggio di errore
            console.log('Existing user');
            return res.status(409).json({ message: 'Email already used' });
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
        console.error('Detailed error in registration:', error);
        res.status(500).json({ message: 'Error in registration', error: error.message });
    }
});

// Endpoint per il login
app.post('/api/login', async (req, res) => {
    console.log('Request received on /api/login', req.body);
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET isn\'t defined');
            throw new Error('Internal server error');
        }    
        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET);
        res.json({ token });
    } catch (error) {
        console.error('Detailed error when logging in:', error);
        res.status(500).json({ message: 'Error when logging in' });
    }
});

// Endpoint per l'aggiornamento del profilo utente (seconda fase)
app.post('/api/user/update', verifyToken, async (req, res) => {
    console.log('Request received on /api/user/update', req.body);
    const userId = req.user.userId; // ottenuto dal token JWT

    // Recupera l'utente esistente dal database
    const existingUser = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
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
        res.json({ message: 'Profile successfully updated', user: updatedUser });
        broadcast({ type: 'UPDATE_USER', payload: updatedUser});
    } catch (error) {
        console.error('Detailed error when updating profile:', error);
        res.status(500).json({ message: 'Error when updating profile', error: error.message });
    }
});

// Middleware per verificare il token JWT
function verifyToken(req, res, next) {
    console.log('Request received on /api/user/update', req.headers);
    console.log("JWT token verification...");
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorised access: header authorisation missing.' });
    }
    const token = authHeader.split(' ')[1];
    console.log('Token received:', token);

    if (!token) {
        console.log('Token not provided');
        return res.status(401).send('Unauthorised access. Token not provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded:', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Invalid token:', error);
        return res.status(401).send('Unauthorised access. Invalid token');
    }
}

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
            console.log('User not found');
            return res.status(404).send('User not found');
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
        console.error('Error retrieving user data:', error);
        res.status(500).send('Internal server error');
    }
});

// Endpoint per ottenere e filtrare gli utenti basato sul ruolo dell'utente autenticato
app.get('/api/users', verifyToken, async (req, res) => {
    try {
        let users;
        if (req.user.role === 'ADMIN') {
            // Se l'utente è admin, ritorna tutti gli utenti
            users = await prisma.user.findMany();
        } else {
            // Se l'utente non è admin, ritorna solo l'utente autenticato e altri utenti non admin
            users = await prisma.user.findMany({
                where: {
                    OR: [
                        { id: req.user.userId }, // Include l'utente autenticato
                        { role: 'VOLUNTEER' } // Include altri utenti con ruolo 'VOLUNTEER'
                    ]
                }
            });
        }
        res.json(users);
    } catch (error) {
        console.error('Error retrieving user data:', error);
        res.status(500).json({ message: 'Error retrieving user data', error: error.message });
    }
});

// Endpoint per ottenere il ruolo dell'utente
app.get('/api/user/role', verifyToken, (req, res) => {
    console.log('Request received on /api/user/role');
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


server.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://192.168.1.38:${port}`);
});