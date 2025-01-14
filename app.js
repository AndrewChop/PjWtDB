const config = require('./config');

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {PrismaClient, TransactionType, Category, EventType} = require('@prisma/client');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

console.log('The JWT secret key is:', process.env.JWT_SECRET);
console.log('Server URL:', config.serverUrl);
console.log('WebSocket URL:', config.webSocketUrl);

const app = express();
const prisma = new PrismaClient();
const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware per analizzare i corpi JSON nelle richieste in arrivo
app.use(express.json());

// Serve i file statici dalla cartella 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Configura il middleware CORS
app.use(cors({
    origin: config.serverUrl,
    methods: ['GET', 'POST'],
    credentials: true
}));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

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

    ws.send('Welcome in the server WebSocket!');

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
    const { email, password/* , role: inputRole  */} = req.body;

    try {
        // Verifica se esiste già un utente con la stessa email
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            // Se l'utente esiste, invia un messaggio di errore
            console.log('Existing user');
            return res.status(409).json({ message: 'Email already used' });
        }

        // Hash della password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        /* // Calcola il ruolo da assegnare
        const userCount = await prisma.user.count();
        const assignedRole = userCount === 0 ? 'ADMIN' : inputRole || 'VOLUNTEER'; 
        const assignedRole = 'VOLUNTEER';*/

        // Crea l'utente 
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                /* role: assignedRole */
                role: 'VOLUNTEER'
            }
        });


        const token = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET);
        console.log('Token generated (API-REGISTER):', token);
        res.status(201).json({ message: 'User registered successfully', user: newUser, token: token });
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

        /* if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET isn\'t defined');
            throw new Error('Internal server error');
        }  */
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
        console.log('Token generated:', token);
        res.json({ token });
    } catch (error) {
        console.error('Detailed error when logging in:', error);
        res.status(500).json({ message: 'Error when logging in' });
    }
});

// Endpoint per l'aggiornamento del profilo utente
app.post('/api/user/update', verifyToken, async (req, res) => {
    console.log('Request received on /api/user/update', req.body);
    const userId = req.user.userId; 

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
        broadcast({ type: 'UPDATE_USER', payload: updatedUser });
    } catch (error) {
        console.error('Detailed error when updating profile:', error);
        res.status(500).json({ message: 'Error when updating profile', error: error.message });
    }
});

// Elimina l'account dell'utente 
app.delete('/api/user/delete', verifyToken, async (req, res) => {
    console.log('Request received on /api/user/delete', req.body);
    try {
        const userId = req.user.userId; 
        console.log(`Deleting user with ID: ${userId}`);
        
        await prisma.user.delete({
            where: { id: userId }
        });
        console.log(`Account eliminato per l'utente con ID: ${userId}`);
        // Esegui il broadcast per notificare la rimozione
        broadcast({ type: 'USER_DELETED', payload: { userId } });
        res.status(200).json({ message: 'Account successfully deleted.' });
    } catch (error) {
        console.error('Error while deleting the user:', error);
        res.status(500).json({ message: 'Error while deleting the account.', error: error.message  });
    }
});

// Middleware per verificare il token JWT
function verifyToken(req, res, next) {
    console.log('Request received on /api/user/...', req.headers);
    console.log("JWT token verification...");

    const authHeader = req.headers.authorization;
    console.log('Authorization header:', req.headers.authorization);

    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorised access: header authorisation missing.' });
    }
    const token = authHeader.split(' ')[1];
    console.log('Token received:', token);

    if (!token || token === 'null') {
        console.log('Token not provided');
        return res.status(401).send('Unauthorised access. Token not provided.');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        console.log('JWT_SECRET:', JWT_SECRET);
        console.log('Token received for verification:', token);

        console.log('Token decoded:', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.error('Token expired:', error);
            return res.status(401).json({ message: 'Token expired. Please log in again.' });
        }
        console.error('Invalid token:', error);
        return res.status(401).json({ message: 'Unauthorized access. Invalid token.' });
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
            birthDate: user.birthDate,
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
            documentIssuer: user.documentIssuer,
            profileImage: user.profileImage
        });
    } catch (error) {
        console.error('Error retrieving user data:', error);
        res.status(500).send('Internal server error');
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

// Endpoint per ottenere tutti gli eventi
app.get('/api/events', async (req, res) => {
    try {
        const events = await prisma.event.findMany();
        res.json(events);
    } catch (error) {
        console.error('Failed to retrieve events:', error);
        res.status(500).send('Failed to retrieve events');
    }
});

// Endpoint per ottenere tutte le transazioni
app.get('/api/transactions', async (req, res) => {
    try {
        const transactions = await prisma.treasury.findMany();
        res.json(transactions);
    } catch (error) {
        console.error('Failed to retrieve transactions:', error);
        res.status(500).send('Failed to retrieve transactions');
    }
});

// Endpoint per aggiungere uno studente
app.post('/api/student/add', verifyToken, async (req, res) => {
    console.log('Request received on /api/student/add', req.body);

    const {
        cardNumber,
        email,
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
        const newStudent = await prisma.user.create({
            data: {
                cardNumber,
                email,
                name,
                surname,
                gender,
                birthDate: new Date(birthDate),
                nationality,
                phoneNumber,
                studyField,
                originUniversity,
                hostUniversity,
                exchangeDuration: parseInt(exchangeDuration),
                studentNumber,
                countryOfOrigin,
                cityOfOrigin,
                addressCityOfOrigin,
                documentType,
                documentNumber,
                documentExpiration: new Date(documentExpiration),
                documentIssuer,
                role: 'STUDENT',
                password: null
            }
        });
        console.log('Student added successfully');
        res.json(newStudent);
        broadcast({ type: 'ADD_STUDENT', payload: newStudent });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ message: 'Failed to add student' });
    }
});

// Endpoint per aggiornare uno studente
app.post('/api/student/update', verifyToken, async (req, res) => {
    console.log('Request received on /api/student/update', req.body);
    const {
        studentId,
        cardNumber,
        email,
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
        const updatedStudent = await prisma.user.update({
            where: { cardNumber: studentId },
            data: {
                cardNumber,
                email,
                name,
                surname,
                gender,
                birthDate: new Date(birthDate),
                nationality,
                phoneNumber,
                studyField,
                originUniversity,
                hostUniversity,
                exchangeDuration: parseInt(exchangeDuration),
                studentNumber,
                countryOfOrigin,
                cityOfOrigin,
                addressCityOfOrigin,
                documentType,
                documentNumber,
                documentExpiration: new Date(documentExpiration),
                documentIssuer
            }
        });
        console.log('Student updated successfully');
        res.json(updatedStudent);
        broadcast({ type: 'UPDATE_STUDENT', payload: updatedStudent });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Failed to update student' });
    }
});


// Endpoint per rimuovere uno studente
app.post('/api/student/remove', verifyToken, async (req, res) => {
    console.log('Request received on /api/student/remove', req.body);
    const { cardNumber } = req.body;

    if (!cardNumber) {
        console.log('Invalid card number:', cardNumber);
        return res.status(400).json({ message: 'Invalid card number' });
    }

    try {
        const removedStudent = await prisma.user.delete({
            where: { cardNumber }
        });

        console.log('Student removed successfully');
        res.json(removedStudent);
        broadcast({ type: 'REMOVE_STUDENT', payload: removedStudent });
    } catch (error) {
        console.error('Error removing student:', error);
        res.status(500).json({ message: 'Error removing student', error: error.message });
    }
});

// Endpoint per aggiungere un evento
app.post('/api/event/add', verifyToken, async (req, res) => {
    console.log("Sto aggiungendo un evento");
    console.error("User ID: " + req.user.userId);
    const {
        name,
        place,
        address,
        date,
        time,
        description,
        type,
        price,
        numberParticipant
    } = req.body;

    try {
        const newEvent = await prisma.event.create({
            data: {
                name,
                place,
                address,
                date: new Date(date),
                time,
                description,
                eventType: EventType[type],
                price: parseFloat(price),
                participants: parseInt(numberParticipant),

                organizerId: req.user.userId
            }
        });
        console.log("Trying to add " + newEvent);
        res.json(newEvent);
        console.log(req)
        broadcast({ type: 'ADD_EVENT', payload: newEvent });
    } catch (error) {
        console.error("Error: " + error);
        res.status(500).json({message: 'Failed to add event'});
    }
});

// Endpoint per aggiornare un evento
app.post('/api/event/update', verifyToken, async (req, res) => {
    const {
        eventId,
        name,
        place,
        address,
        date,
        time,
        description,
        eventType,
        price,
        participants
    } = req.body;

    try {
        const updatedEvent = await prisma.event.update({
            where: {id: parseInt(eventId)},
            data: {
                name,
                place,
                address,
                date: new Date(date),
                time,
                description,
                eventType,
                price: parseFloat(price),
                participants
            }
        });
        console.log("Event updated:", updatedEvent);
        res.json(updatedEvent);
        broadcast({ type: 'UPDATE_EVENT', payload: updatedEvent });
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({message: 'Failed to update event', error: error.message });
    }
});

// Endpoint per rimuovere un evento
app.post('/api/event/remove', verifyToken, async (req, res) => {
    const { eventId } = req.body;

    try {
        const removedEvent = await prisma.event.delete({
            where: { id: parseInt(eventId) }
        });
        res.json(removedEvent);
        broadcast({ type: 'REMOVE_EVENT', payload: removedEvent });
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove event' });
    }
});

// Endpoint per aggiungere una transazione
app.post('/api/transaction/add', verifyToken, async (req, res) => {
    console.log("Adding transaction...");
    const {
        name,
        transactionType,
        amount,
        category,
        channel,
        date,
        note
    } = req.body;

    try {
        /* if (!name || !transactionType || !amount || !category || !channel || !date) {
            return res.status(400).json({ message: 'All fields are required.' });
        } */

        const newTransaction = await prisma.treasury.create({
            data: {
                name,
                transactionType: TransactionType[transactionType],
                amount: parseFloat(amount),
                category: Category[category],
                channel,
                date: new Date(date),
                note
            }
        });
        console.log('Transaction added successfully:', newTransaction);
        res.json(newTransaction);
        broadcast({ type: 'ADD_TRANSACTION', payload: newTransaction });
    } catch (error) {
        console.error('Failed to add transaction:', error.message);
        res.status(500).json({ message: 'Failed to add transaction', error: error.message});
    }
});

// Endpoint per aggiornare una transazione
app.post('/api/transaction/update', verifyToken, async (req, res) => {
    const {
        id,
        name,
        transactionType,
        amount,
        category,
        channel,
        date,
        note
    } = req.body;

    transactionId = id;
    console.log('Check ID: done');
    console.log('Transaction ID:', transactionId);

    const parsedTransactionId = parseInt(transactionId, 10);

    // Verifica se il record esiste
    const existingTransaction = await prisma.treasury.findUnique({
        where: { id: parsedTransactionId }
    });

    if (!existingTransaction) {
        return res.status(404).json({ message: 'Transaction not found' });
    }

    try {
        const updatedTransaction = await prisma.treasury.update({
            where: { id: parsedTransactionId },
            data: {
                name,
                transactionType,
                amount: parseFloat(amount),
                category,
                channel,
                date: new Date(date),
                note: note || null
            }
        });
        console.log('Transaction updated successfully:', updatedTransaction);
        res.json(updatedTransaction);
        broadcast({ type: 'UPDATE_TRANSACTION', payload: updatedTransaction });
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ message: 'Failed to update transaction', error: error.message});
    }
});

// Endpoint per rimuovere una transazione
app.post('/api/transaction/remove', verifyToken, async (req, res) => {
    const { transactionId } = req.body;

    try {
        const removedTransaction = await prisma.treasury.delete({
            where: { id: parseInt(transactionId) }
        });
        res.json(removedTransaction);
        broadcast({ type: 'REMOVE_TRANSACTION', payload: removedTransaction });
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove transaction' });
    }
});

// Endpoint per ottenere tutti gli sconti
app.get('/api/discounts', async (req, res) => {
    try {
        const discounts = await prisma.discount.findMany();
        res.json(discounts);
    } catch (error) {
        console.error('Failed to retrieve discounts:', error);
        res.status(500).send('Failed to retrieve discounts');
    }
});

// Endpoint per aggiungere un evento
app.post('/api/discount/add', verifyToken, async (req, res) => {
    const {
        code,
        name,
        discountType,
        rate,
        expirationDate,
        description,
        link
    } = req.body;
    try {
        const newDiscount = await prisma.discount.create({
            data: {
                code,
                name,
                discountType,
                rate: parseFloat(rate),
                expirationDate: new Date(expirationDate),
                description,
                link

            }
        });
        res.json(newDiscount);
    } catch (error) {
        console.error("Error: " + error);
        res.status(500).json({message: 'Failed to add discount'});
    }
});


// Endpoint per rimuovere un discount
app.post('/api/discount/remove', verifyToken, async (req, res) => {
    const {discountId} = req.body;

    try {
        const removedEvent = await prisma.discount.delete({
            where: {id: parseInt(discountId)}
        });
        res.json(removedEvent);
    } catch (error) {
        console.error('Failed to remove event:', error);
        res.status(500).json({message: 'Failed to remove event'});
    }
});


// Endpoint per aggiornare uno sconto
app.post('/api/discount/update', verifyToken, async (req, res) => {
    const {
        eventId,
        code,
        name,
        type,
        rate,
        date,
        description,
        link
    } = req.body;

    try {
        const updatedDiscount = await prisma.discount.update({
            where: {id: parseInt(eventId)},
            data: {
                code,
                name,
                discountType: type,
                rate: parseFloat(rate),
                expirationDate: new Date(date),
                description,
                link
            }
        });
        res.json(updatedDiscount);
    } catch (error) {
        console.error('Failed to update discount:', error);
        res.status(500).json({message: 'Failed to update discount'});
    }
});

app.post('/api/upload-profile-image', verifyToken, upload.single('profileImage'), async (req, res) => {
    console.log('Request to upload profile image received');
    try {
        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Genera l'URL pubblico per l'immagine
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        // Salva l'URL nel database
        await prisma.user.update({
            where: { id: req.user.userId },
            data: { profileImage: imageUrl },
        });

        console.log('User profile image URL updated in database:');
        res.json({ message: 'Image uploaded successfully', imageUrl });
    } catch (error) {
        console.error('Error uploading profile image:', error);
        res.status(500).json({ message: 'Failed to upload profile image' });
    }
});

server.listen(process.env.PORT || 3000, () => {
    console.log(`Server running at ${config.serverUrl}`);
});
