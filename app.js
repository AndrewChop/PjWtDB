require('dotenv').config(); // Deve essere la prima linea eseguita, serve a caricare le variabili d'ambiente

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {PrismaClient, Category, EventType} = require('@prisma/client');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const multer = require('multer');
const path = require('path');

// Verificare che la chiave sia stata caricata correttamente
console.log('The JWT secret key is:', process.env.JWT_SECRET);

const app = express();
const port = 3000;
const prisma = new PrismaClient();
const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;
const serverHost = process.env.SERVER_HOST || 'localhost';
const serverPort = process.env.SERVER_PORT || 3000;

// Middleware per analizzare i corpi JSON nelle richieste in arrivo
app.use(express.json());

app.get('/config', (req, res) => {
    res.json({
        "SERVER_HOST":serverHost,
        "SERVER_PORT":serverPort
    });
});

// Serve i file statici dalla cartella 'public'
app.use(express.static('public'));

// Configura il middleware CORS
app.use(cors({
    origin: `http://${serverHost}:${serverPort}`, // Permette solo richieste da questa origine
    methods: ['GET', 'POST'], // Metodi consentiti
    credentials: true // Permette credenziali come cookies, autorizzazione headers ecc.
}));

// Configurazione di multer per il caricamento dei file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/assets/profile/');
    },
    filename: function (req, file, cb) {
        // Usa l'ID dell'utente per il nome del file
        const userId = req.user.userId;
        cb(null, `${userId}_profile.jpg`);
    }
});

const upload = multer({storage: storage});

const server = http.createServer(app);
const wss = new WebSocket.Server({server});

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
    const {email, password, role: inputRole} = req.body;

    try {
        // Verifica se esiste già un utente con la stessa email
        const existingUser = await prisma.user.findUnique({where: {email}});
        if (existingUser) {
            // Se l'utente esiste, invia un messaggio di errore
            console.log('Existing user');
            return res.status(409).json({message: 'Email already used'});
        }

        // Hash della password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Calcola il ruolo da assegnare
        const userCount = await prisma.user.count();
        const assignedRole = userCount === 0 ? 'ADMIN' : inputRole || 'VOLUNTEER';

        // Crea l'utente 
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: assignedRole
                /* token: //passare token randomizzato */
            }
        });


        const token = jwt.sign({
            userId: newUser.id,
            role: newUser.role
        }, /* process.env. */JWT_SECRET/* , { expiresIn: '1h' } */);
        console.log('Token generated (API-REGISTER):', token);
        res.status(201).json({message: 'User registered successfully', user: newUser, token: token});
    } catch (error) {
        console.error('Detailed error in registration:', error);
        res.status(500).json({message: 'Error in registration', error: error.message});
    }
});

// Endpoint per il login
app.post('/api/login', async (req, res) => {
    console.log('Request received on /api/login', req.body);
    const {email, password} = req.body;

    try {
        const user = await prisma.user.findUnique({where: {email}});
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({message: 'Invalid credentials'});
        }

        /* if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET isn\'t defined');
            throw new Error('Internal server error');
        }  */
        const token = jwt.sign({userId: user.id, role: user.role}, /* process.env. */JWT_SECRET, {expiresIn: '3600m'});
        console.log('Token generated:', token);
        //document.cookie = `token=${token}`;
        res.json({token});
    } catch (error) {
        console.error('Detailed error when logging in:', error);
        res.status(500).json({message: 'Error when logging in'});
    }
});

// Endpoint per l'aggiornamento del profilo utente
app.post('/api/user/update', verifyToken, async (req, res) => {
    console.log('Request received on /api/user/update', req.body);
    const userId = req.user.userId; // ottenuto dal token JWT

    // Recupera l'utente esistente dal database
    const existingUser = await prisma.user.findUnique({
        where: {id: userId}
    });

    if (!existingUser) {
        return res.status(404).json({message: "User not found"});
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
            where: {id: userId},
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
        res.json({message: 'Profile successfully updated', user: updatedUser});
    } catch (error) {
        console.error('Detailed error when updating profile:', error);
        res.status(500).json({message: 'Error when updating profile', error: error.message});
    }
});

// Middleware per verificare il token JWT
function verifyToken(req, res, next) {
    console.log('Request received on /api/user/...', req.headers);
    console.log("JWT token verification...");

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({message: 'Unauthorised access: header authorisation missing.'});
    }
    const token = authHeader.split(' ')[1];
    console.log('Token received:', token);

    if (!token || token === 'null') {
        console.log('Token not provided');
        return res.status(401).send('Unauthorised access. Token not provided.');
    }

    try {
        const decoded = jwt.verify(token, /* process.env. */JWT_SECRET);
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
            where: {id: userId}
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
            where: {role: 'VOLUNTEER'}
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
            where: {role: 'STUDENT'}
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
                password: null // Ho aggiunto un valore predefinito per il campo facoltativo 'password'
            }
        });
        console.log('Student added successfully');
        res.json(newStudent);
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({message: 'Failed to add student'});
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
            where: {cardNumber: studentId},
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
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({message: 'Failed to update student'});
    }
});


// Endpoint per rimuovere uno studente
app.post('/api/student/remove', verifyToken, async (req, res) => {
    console.log('Request received on /api/student/remove', req.body);
    const {cardNumber} = req.body;

    if (!cardNumber) {
        console.log('Invalid card number:', cardNumber);
        return res.status(400).json({message: 'Invalid card number'});
    }

    try {
        const removedStudent = await prisma.user.delete({
            where: {cardNumber}
        });

        console.log('Student removed successfully');
        res.json(removedStudent);
    } catch (error) {
        console.error('Error removing student:', error);
        res.status(500).json({message: 'Error removing student', error: error.message});
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
    console.error("EventType: " + EventType[type]);
    console.log("REQ: ")
    console.log(req.body);
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

                organizerId: req.user.userId // Associa l'evento all'organizzatore
            }
        });
        console.log("Trying to add " + newEvent);
        res.json(newEvent);
        console.log(req)
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
        type,
        price,
        numberParticipant
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
                eventType: EventType[type],
                price: parseFloat(price),
                participants: parseInt(numberParticipant)
            }
        });
        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({message: 'Failed to update event'});
    }
});

// Endpoint per rimuovere un evento
app.post('/api/event/remove', verifyToken, async (req, res) => {
    const {eventId} = req.body;

    try {
        const removedEvent = await prisma.event.delete({
            where: {id: parseInt(eventId)}
        });
        res.json(removedEvent);
    } catch (error) {
        res.status(500).json({message: 'Failed to remove event'});
    }
});

// Endpoint per aggiungere una transazione
app.post('/api/transaction/add', verifyToken, async (req, res) => {
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
        const newTransaction = await prisma.treasury.create({
            data: {
                name,
                transactionType,
                amount: parseFloat(amount),
                category,
                channel,
                date: new Date(date),
                note
            }
        });
        res.json(newTransaction);
    } catch (error) {
        res.status(500).json({message: 'Failed to add transaction'});
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
    console.log('Transaction ID:', transactionId);  // Verifica l'ID

    const parsedTransactionId = parseInt(transactionId, 10);

    // Verifica se l'ID è valido
    // if (isNaN(parsedTransactionId)) {
    //     return res.status(400).json({ message: 'Invalid transaction ID' });
    // }

    // Verifica se il record esiste
    const existingTransaction = await prisma.treasury.findUnique({
        where: {id: parsedTransactionId}
    });

    if (!existingTransaction) {
        return res.status(404).json({message: 'Transaction not found'});
    }

    try {
        const updatedTransaction = await prisma.treasury.update({
            where: {id: parsedTransactionId},
            data: {
                name,
                transactionType,
                amount: parseFloat(amount),  // Assicurati che amount sia un float
                category,
                channel,
                date: new Date(date),  // Assicurati che date sia una data valida
                note: note || null  // Gestione delle note opzionali
            }
        });

        console.log('Transaction updated successfully:', updatedTransaction);

        // Trasmetti l'aggiornamento ai client connessi

        res.json(updatedTransaction);
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({message: 'Error updating transaction', error: error.message});
    }
});


// Endpoint per rimuovere una transazione
app.post('/api/transaction/remove', verifyToken, async (req, res) => {
    const {transactionId} = req.body;

    try {
        const removedTransaction = await prisma.treasury.delete({
            where: {id: parseInt(transactionId)}
        });
        res.json(removedTransaction);
    } catch (error) {
        res.status(500).json({message: 'Failed to remove transaction'});
    }
});


// Endpoint per caricare l'immagine del profilo
app.post('/api/upload-profile-image', verifyToken, upload.single('profileImage'), async (req, res) => {
    console.log('Request to upload profile image received');

    if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).send('No file uploaded.');
    }

    const imageUrl = `/assets/profile/${req.file.filename}`;
    console.log('Image URL:', imageUrl);

    try {
        const updatedUser = await prisma.user.update({
            where: {id: req.user.userId},
            data: {profileImage: imageUrl}
        });
        console.log('User profile image URL updated in database:', updatedUser);

        res.json({imageUrl});
    } catch (error) {
        console.error('Error updating profile image URL:', error);
        res.status(500).send('Error updating profile image URL');
    }
});

/* // Endpoint per rinnovare il token JWT
app.post('/api/renew-token', verifyToken, (req, res) => {
    const user = req.user;
    const newToken = jwt.sign({ userId: user.userId, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token: newToken });
}); */

server.listen(serverPort, serverHost, () => {
    console.log(`Server in ascolto su http://${serverHost}:${serverPort}`);
});
