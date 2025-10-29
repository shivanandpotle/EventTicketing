const express = require('express');
const session = require('express-session');
const path = require('path');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongodb');
require('dotenv').config();

const { connectToDatabase, getDb } = require('./database');
const { sendTicketEmail } = require('./email');

const app = express();
const PORT = process.env.PORT;

// --- Razorpay Instance ---
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Session ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'a-very-strong-secret-key-for-sambhav-club',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 3600000 } // set secure: true in production (https)
}));

// --- THIS BLOCK IS NOW CORRECT ---
const ADMIN_USERS = [
    { username: 'Shiva', password: 'ShivaSambhav' },
    { username: 'Vikram', password: 'VikramSambhav' },
    { username: 'Pranav', password: 'PranavSambhav' },
    { username: 'Sanika', password: 'SanikaSambhav' },
    { username: 'Tejas', password: 'TejasSambhav' },
    { username: 'Siddharth', password: 'SiddharthSambhav' },
    { username: 'Smita', password: 'SmitaSambhav' }
];
// --- END OF CORRECTION ---

const requireLogin = (req, res, next) => {
    if (req.session && req.session.userId) return next();
    res.redirect('/login');
};

// --- HTML Routes ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/admin', requireLogin, (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// --- API Routes ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const foundUser = ADMIN_USERS.find(user => user.username === username && user.password === password);
    if (foundUser) {
        req.session.userId = foundUser.username;
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.get('/api/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

// Get ALL tickets for admin panel
app.get('/api/bookings', requireLogin, async (req, res) => {
    try {
        const db = getDb();
        const tickets = await db.collection('tickets').find().sort({ transaction_id: -1 }).toArray();
        res.status(200).json(tickets);
    } catch (error) {
        console.error("Failed to load tickets:", error);
        res.status(500).json({ message: 'Failed to load tickets' });
    }
});

app.post('/api/create-order', async (req, res) => {
    const { amount } = req.body;
    if (typeof amount !== 'number' || amount < 1) {
        return res.status(400).json({ success: false, message: 'A valid amount is required.' });
    }
    try {
        const options = {
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `receipt_order_${new Date().getTime()}`,
        };
        const order = await razorpay.orders.create(options);
        res.json({ success: true, order });
    } catch (error) {
        console.error("Razorpay order creation error:", error);
        res.status(500).json({ success: false, message: 'Could not create order.' });
    }
});

// Verify Payment and Create Individual Tickets
app.post('/api/verify-payment', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingDetails } = req.body;

    if (!bookingDetails || !bookingDetails.attendees || bookingDetails.attendees.length === 0) {
        return res.status(400).json({ success: false, message: 'Booking details are missing.' });
    }

    let isPaymentVerified = false;
    if (razorpay_payment_id === 'N/A_free_event') {
        isPaymentVerified = true;
    } else if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest('hex');
        if (expectedSignature === razorpay_signature) {
            isPaymentVerified = true;
        }
    }

    if (isPaymentVerified) {
        try {
            const db = getDb();
            const transactionId = uuidv4();
            
            const transactionData = {
                _id: transactionId,
                purchaser_email: bookingDetails.purchaser_email,
                purchaser_phone: bookingDetails.purchaser_phone,
                event: bookingDetails.event,
                quantity: bookingDetails.quantity,
                total_amount: bookingDetails.total_amount,
                razorpay_payment_id: razorpay_payment_id !== 'N/A_free_event' ? razorpay_payment_id : null,
                razorpay_order_id: razorpay_order_id || null,
                transaction_date: new Date().toISOString()
            };
            await db.collection('transactions').insertOne(transactionData);

            for (const attendee of bookingDetails.attendees) {
                const ticketId = uuidv4();
                const ticketData = {
                    _id: ticketId,
                    transaction_id: transactionId,
                    name: attendee.name,
                    email: attendee.email,
                    whatsapp_number: attendee.whatsapp_number,
                    age_group: attendee.age_group,
                    event: bookingDetails.event,
                    status: 'confirmed', // Overall 'paid' status
                    status_day_1: 'pending', // NEW: Status for Day 1
                    status_day_2: 'pending', // NEW: Status for Day 2
                    is_student: bookingDetails.is_student ? 1 : 0,
                    prn_number: bookingDetails.prn_number || null
                };
                await db.collection('tickets').insertOne(ticketData);
                
                const emailTicketData = {
                    id: ticketId,
                    event: bookingDetails.event,
                    primary_name: attendee.name,
                    email: attendee.email,
                    additional_members: '[]',
                    quantity: 1
                };
                await sendTicketEmail(emailTicketData);
                console.log(`✅ Ticket sent to ${attendee.name} at ${attendee.email}`);
            }
            res.status(200).json({ success: true, message: 'Booking confirmed! Individual tickets have been sent.' });
        } catch (error) {
            console.error("❌ Error saving transaction/tickets or sending email:", error);
            res.status(500).json({ success: false, message: 'Server error while saving booking.' });
        }
    } else {
        res.status(400).json({ success: false, message: 'Payment verification failed.' });
    }
});

// Validate Individual Ticket
app.post('/api/validate-ticket/:id', requireLogin, async (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;
        const { day } = req.query; // Get the day from query param (e.g., ?day=1)

        if (!day || (day !== '1' && day !== '2')) {
            return res.status(400).json({ success: false, message: 'Please select a valid day (1 or 2).' });
        }

        const ticket = await db.collection('tickets').findOne({ _id: id });

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Invalid Ticket ID.' });
        }

        let updateField, statusField;
        if (day === '1') {
            statusField = 'status_day_1';
            updateField = { $set: { status_day_1: 'checked-in' } };
        } else { // day === '2'
            statusField = 'status_day_2';
            updateField = { $set: { status_day_2: 'checked-in' } };
        }

        // Check if already checked in for that specific day
        if (ticket[statusField] === 'checked-in') {
            return res.status(200).json({ 
                success: false, 
                message: `Ticket already checked in for Day ${day}.`, 
                ticket 
            });
        }

        // Perform the update
        await db.collection('tickets').updateOne({ _id: id }, updateField);
        
        const updatedTicket = await db.collection('tickets').findOne({ _id: id });
        
        res.status(200).json({ 
            success: true, 
            message: `Check-in Successful for Day ${day}!`, 
            ticket: updatedTicket 
        });

    } catch (error) {
        console.error("Ticket validation error:", error);
        res.status(500).json({ success: false, message: 'Server error during validation.' });
    }
});

// --- Server Start ---
connectToDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Server running at http://localhost:${PORT}`);
    });
});
