require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');


const app = express();
app.use(express.json());
app.use(express.static('public'));


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error(err));


// Registration Schema
const registrationSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    whatsapp: String,
    college: String,
    year: Number,
    department: String,
    projectLink: String,
    paymentMode: String,
    ticketNumber: String,
    razorpay_payment_id: String,
    razorpay_order_id: String,
    razorpay_signature: String
});
const Registration = mongoose.model('Registration', registrationSchema);


// Razorpay Instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


// Nodemailer Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// Create Razorpay Order
app.post('/create-order', async (req, res) => {
    const options = {
        amount: req.body.amount,
        currency: 'INR',
        receipt: 'receipt#1'
    };
    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
});


// Save Registration and Send Email
app.post('/register', async (req, res) => {
    const registration = new Registration(req.body);
    await registration.save();


    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: req.body.email,
        subject: 'Event Registration Confirmation',
        text: `Dear ${req.body.name},\n\nYour registration is successful!\n\nDetails:\nName: ${req.body.name}\nEmail: ${req.body.email}\nPhone: ${req.body.phone}\nDepartment: ${req.body.department}\nPayment Mode: ${req.body.paymentMode}${
            req.body.ticketNumber ? `\nTicket Number: ${req.body.ticketNumber}` : ''
        }\n\nThank you for registering!`
    };


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.error(error);
        else console.log('Email sent: ' + info.response);
    });


    res.json({ message: 'Registration saved' });
});


app.listen(3000, () => console.log('Server running on port 3000'));