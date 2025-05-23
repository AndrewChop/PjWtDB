const config = require('./config');

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { PrismaClient, TransactionType, Category, EventType } = require('@prisma/client');
const cors = require('cors');

const http = require('http');
const WebSocket = require('ws');

const multer = require('multer');
const fs = require('fs');
const path = require('path');

const nodemailer = require('nodemailer');
const escape = require('escape-html');
//const crypto = require('crypto');
const verificationTokens = {};

const app = express();
const prisma = new PrismaClient();
const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;

// MIDDLEWARE

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
    origin: config.serverUrl,
    methods: ['GET', 'POST'],
    credentials: true
}));

// WEBSOCKET AND OTHERS

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public/assets/profile');
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
    //console.log('New connection WebSocket');

    ws.on('message', (message) => {
        //console.log('Message received:', message);
    });

    ws.on('close', () => {
        //console.log('Connection WebSocket closed');
    });

    ws.send('Welcome in the server WebSocket!');

    ws.on('error', (error) => {
        //console.error('WebSocket error:', error);
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

// AUTHENTICATION AND REGISTRATION

app.post('/api/auth/send-verification-email', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !email.endsWith('@esnpisa.it')) {
        return res.status(400).send('Invalid email domain!');
    }
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).send('Email already in use!');
        }

        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
        verificationTokens[email] = { token, password };

        const verificationLink = `${req.protocol}://${req.get('host')}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify Your Email - SWEN Platform',
            html: `
                <div style="font-family: 'Lato', 'Roboto'; line-height: 1.6; color: #000000;">
                    <h2 style="color: #4e73df;">Welcome to ESN Pisa!</h2>
                    <p>Dear user,</p>
                    <p>Thank you for registering on our platform.</p> 
                    <p>To complete your registration, please verify your email address by clicking the button below:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${escape(verificationLink)}" 
                           style="background-color: #4e73df; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                           Verify Your Email
                        </a>
                    </div>
                    <p>For security reasons, this link will expire in 24 hours.</p>
                    <p>If you did not register on our platform, please ignore this email.</p>
                    <p>For any issues or questions, feel free to contact our support team:</p>
                    <p>📧 support@esnpisa.it</p>
                    <hr style="border: none; border-top: 1px solid #ddd;">
                    <p style="font-size: 14px; color: #777;">The SWEN Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).send('Verification email sent');
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Failed to send email');
    }
});

app.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        const email = decoded.email;
        const record = verificationTokens[email];

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered! Please log in or use another email.' });
        }

        if (!record || record.token !== token) {
            return res.status(400).send('Invalid or expired token.');
        }

        const hashedPassword = await bcrypt.hash(record.password, saltRounds);

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'VOLUNTEER',
                isVerified: true,
                name: 'TBD',
                surname: 'TBD',
                gender: 'NONE',
                birthDate: new Date('2000-01-01'),
                nationality: 'TBD',
                phoneNumber: 'TBD',
                studyField: 'TBD',
                originUniversity: 'TBD',
                studentNumber: 'TBD',
                countryOfOrigin: 'TBD',
                cityOfOrigin: 'TBD',
                addressCityOfOrigin: 'TBD',
                documentType: 'NONE',
                documentNumber: 'TBD',
                documentExpiration: new Date('2099-12-31'),
                documentIssuer: 'TBD'
            }
        });

        delete verificationTokens[email];

        const sessionToken = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '24h' });

        res.redirect(`/pages/complete-profile.html?token=${sessionToken}`);
    } catch (error) {
        console.error('Error during email verification:', error.message);
        res.status(500).send('Failed to verify email.');
    }
});

app.post('/api/verify-token', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        if (!decoded.userId) {
            console.error('Invalid token:', decoded);
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
        res.status(200).json({ message: 'Token is valid', decoded });
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).json({ message: 'Unauthorized: Token invalid or expired' });
    }
});

function verifyToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorised access: header authorisation missing.' });
    }
    const token = authHeader.split(' ')[1];

    if (!token || token === 'null') {
        return res.status(401).send('Unauthorised access. Token not provided.');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.error('Token expired:', error);
            return res.status(401).json({ message: 'Token expired! Please log in again.' });
        }
        console.error('Invalid token:', error);
        return res.status(401).json({ message: 'Unauthorized access! Invalid token.' });
    }
}

app.post('/api/login', async (req, res) => {
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

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Detailed error when logging in:', error);
        res.status(500).json({ message: 'Error when logging in' });
    }
});

// USER PROFILE MANAGEMENT

app.post('/api/user/update', verifyToken, async (req, res) => {
    const userId = req.user.userId;

    // Recupera l'utente esistente dal database
    const existingUser = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!existingUser) {
        return res.status(404).json({ message: "User not found!" });
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

app.post('/api/user/delete', verifyToken, async (req, res) => {
    console.log('Request received on /api/user/delete', req.body);
    try {
        const userId = req.user.userId;
        if (!userId) {
            console.error('Invalid user ID:', userId);
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        console.log(`Deleting user with ID: ${userId}`);

        await prisma.user.delete({
            where: { id: userId }
        });
        console.log(`Account eliminato per l'utente con ID: ${userId}`);
        broadcast({ type: 'USER_DELETED', payload: { userId } });
        res.status(200).json({ message: 'Account successfully deleted.' });
    } catch (error) {
        console.error('Error while deleting the user:', error);
        res.status(500).json({ message: 'Error while deleting the account.', error: error.message });
    }
});

app.get('/api/user/data', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).send('User not found');
        }

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
            profileImage: user.profileImage || '/assets/profile/default.png'
        });
    } catch (error) {
        console.error('Error retrieving user data:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/api/upload-profile-image', verifyToken, upload.single('profileImage'), async (req, res) => {
    console.log('Request to upload profile image received');
    try {
        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const imageUrl = `/assets/profile/${req.file.filename}`;

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

// VOLUNTEER MANAGEMENT

app.get('/api/users/volunteers', verifyToken, async (req, res) => {
    try {
        const volunteers = await prisma.user.findMany({
            where: { role: 'VOLUNTEER' }
        });
        res.json(volunteers);
    } catch (error) {
        //console.log('Failed to retrieve volunteers:', error);
        res.status(500).send('Failed to retrieve volunteer data');
    }
});

// STUDENT MANAGEMENT

app.get('/api/users/students', verifyToken, async (req, res) => {
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

app.post('/api/student/add', verifyToken, async (req, res) => {

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
                password: null,
                phoneNumber,
            }
        });
        res.json(newStudent);
        broadcast({ type: 'ADD_STUDENT', payload: newStudent });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ message: 'Failed to add student', error: error.message });
    }
});

app.post('/api/student/update', verifyToken, async (req, res) => {
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
        res.json(updatedStudent);
        broadcast({ type: 'UPDATE_STUDENT', payload: updatedStudent });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Failed to update student' });
    }
});

app.post('/api/student/remove', verifyToken, async (req, res) => {
    const { cardNumber } = req.body;

    if (!cardNumber) {
        return res.status(400).json({ message: 'Invalid card number' });
    }

    try {
        const removedStudent = await prisma.user.delete({
            where: { cardNumber }
        });

        res.json(removedStudent);
        broadcast({ type: 'REMOVE_STUDENT', payload: removedStudent });
    } catch (error) {
        console.error('Error removing student:', error);
        res.status(500).json({ message: 'Error removing student', error: error.message });
    }
});

// EVENT MANAGEMENT

app.get('/api/events', verifyToken, async (req, res) => {
    try {
        const events = await prisma.event.findMany();
        res.json(events);
    } catch (error) {
        console.error('Failed to retrieve events:', error);
        res.status(500).send('Failed to retrieve events');
    }
});

app.post('/api/event/add', verifyToken, async (req, res) => {
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
        res.json(newEvent);
        broadcast({ type: 'ADD_EVENT', payload: newEvent });
    } catch (error) {
        console.error("Error: " + error);
        res.status(500).json({ message: 'Failed to add event' });
    }
});

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
            where: { id: parseInt(eventId) },
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
        res.json(updatedEvent);
        broadcast({ type: 'UPDATE_EVENT', payload: updatedEvent });
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ message: 'Failed to update event', error: error.message });
    }
});

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

// TRANSACTIONS MANAGEMENT

app.get('/api/transactions', verifyToken, async (req, res) => {
    try {
        const transactions = await prisma.treasury.findMany();
        res.json(transactions);
    } catch (error) {
        console.error('Failed to retrieve transactions:', error);
        res.status(500).send('Failed to retrieve transactions');
    }
});

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
        if (!name || !transactionType || !amount || !category || !channel || !date) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

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
        res.json(newTransaction);
        broadcast({ type: 'ADD_TRANSACTION', payload: newTransaction });
    } catch (error) {
        console.error('Failed to add transaction:', error.message);
        res.status(500).json({ message: 'Failed to add transaction', error: error.message });
    }
});

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

    const parsedTransactionId = parseInt(transactionId, 10);

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
        res.json(updatedTransaction);
        broadcast({ type: 'UPDATE_TRANSACTION', payload: updatedTransaction });
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ message: 'Failed to update transaction', error: error.message });
    }
});

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

// DISCOUNT MANAGEMENT

app.get('/api/discounts', verifyToken, async (req, res) => {
    try {
        const discounts = await prisma.discount.findMany();
        res.json(discounts);
    } catch (error) {
        console.error('Failed to retrieve discounts:', error);
        res.status(500).send('Failed to retrieve discounts');
    }
});

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
        broadcast({ type: 'ADD_DISCOUNT', payload: newDiscount });
    } catch (error) {
        console.error("Error: " + error);
        res.status(500).json({ message: 'Failed to add discount' });
    }
});

app.post('/api/discount/remove', verifyToken, async (req, res) => {
    const { discountId } = req.body;

    try {
        const removedDiscount = await prisma.discount.delete({
            where: { id: parseInt(discountId) }
        });
        res.json(removedDiscount);
        broadcast({ type: 'REMOVE_DISCOUNT', payload: removedDiscount });
    } catch (error) {
        console.error('Failed to remove event:', error);
        res.status(500).json({ message: 'Failed to remove event' });
    }
});

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
            where: { id: parseInt(eventId) },
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
        broadcast({ type: 'UPDATE_DISCOUNT', payload: updatedDiscount });
    } catch (error) {
        console.error('Failed to update discount:', error);
        res.status(500).json({ message: 'Failed to update discount' });
    }
});

// SOCKET.IO

server.listen(process.env.PORT || 3000, () => {
    //console.log(`Server running at ${config.serverUrl}`);
});


// MANAGEMENT OF GLOBAL ERRORS

app.use((err, req, res, next) => {
    console.error('Errore non gestito:', err.stack);
    if (!res.headersSent) {
        res.status(500).send('Errore interno del server');
    }
});