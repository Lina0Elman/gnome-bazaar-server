
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const authMiddleware = require('./middleware/authMiddleware');
const userRoutes = require('./routes/userRoutes');

const app = express();


// todo  - thats just the main structure


// Middleware setup
app.use(bodyParser.json());       // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' folder

// Use custom middleware
app.use(authMiddleware);

// Register routes
app.use('/api/users', userRoutes); // Mount user routes on '/api/users'

// Define a basic route (optional)
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

// Error handling middleware (optional) -- move to middlewares
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports = app;