// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing
const User = require('./models/User'); // Import the updated User model

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

// MongoDB connection using Mongoose
const db = process.env.DB_URI; // Access the DB_URI from environment variables
mongoose.connect(db)
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.log('MongoDB connection error:', err);
        process.exit(1); // Exit the process if MongoDB connection fails
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
    const { username, password, sensitiveData } = req.body; // Get form data

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance
        const newUser = new User({
            username,
            password: hashedPassword, // Save the hashed password
            sensitiveData, // This will be encrypted by mongoose-encryption
        });

        // Save the new user to the database
        await newUser.save();

        console.log('User Registered:', username);

        // Redirect to the login page after successful registration
        res.redirect('/login');
    } catch (err) {
        console.log('Error registering user:', err);
        res.status(500).send('Error registering user');
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body; // Get form data

    try {
        // Check if the user exists in the database
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send('Invalid username or password'); // If user is not found
        }

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send('Invalid username or password'); // If password does not match
        }

        console.log('User Logged In:', username);

        // Redirect to the secrets page after successful login
        res.redirect('/secrets');
    } catch (err) {
        console.log('Error logging in user:', err);
        res.status(500).send('Error logging in user');
    }
});

// Starting the server
const PORT = process.env.PORT || 3000; // Use PORT from environment variable or default to 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
