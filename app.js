const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();  // Make sure to load environment variables

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

// MongoDB connection using Mongoose
const db = process.env.DB_URI;  // Use DB_URI from .env
mongoose.connect(db)
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.log('MongoDB connection error:', err);
        process.exit(1);  // Exit the process if MongoDB connection fails
    });

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/secrets', (req, res) => {
    res.render('secrets');
});

// Registration Route
app.post('/register', async (req, res) => {
    const { username, password, sensitiveData } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword,
            sensitiveData,
        });

        await newUser.save();

        console.log('User Registered:', username);

        res.redirect('/login');
    } catch (err) {
        console.log('Error registering user:', err);
        res.status(500).send('Error registering user');
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send('Invalid username or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send('Invalid username or password');
        }

        console.log('User Logged In:', username);

        res.redirect('/secrets');
    } catch (err) {
        console.log('Error logging in user:', err);
        res.status(500).send('Error logging in user');
    }
});

// Starting the server using PORT from .env
const PORT = process.env.PORT || 3000;  // Use PORT from .env or default to 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
