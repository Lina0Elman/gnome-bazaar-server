const { StatusCodes } = require ('http-status-codes');const Purchase = require('../models/Purchase');
const config = require('../../config');
const bcrypt = require('bcrypt'); // Use bcrypt for password hashing (optional, if you're storing hashed passwords)
const User = require('../models/User');
const jwt = require('jsonwebtoken'); // Assuming you'll implement JWT

// Middleware function to authenticate requests using JWT
function authenticateToken(req, res, next) {
    // Get the token from the request header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from the "Bearer" scheme

    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'No token provided' });
    }

    // Verify the token using your secret
    jwt.verify(token, config.jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Invalid token' });
        }

        // If verification is successful, attach the user to the request object
        req.user = decoded; // The `decoded` object will contain the user information (e.g., id, role)
        next(); // Move on to the next middleware or route handler
    });
}


// Middleware function for basic authentication
async function basicAuth(req, res, next) {
    const { user, pwd } = req.body;

    if (!user || !pwd) {
        return res.status(400).json({ message: 'Missing username or password' });
    }
  
    try {
        // Find the user in the database
        const dbUser = await User.findOne({ userName: user });

        if (!dbUser) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Compare the provided password with the stored one (assuming the password is hashed)
        const isPasswordValid = await bcrypt.compare(pwd, dbUser.pwd); // If you're using bcrypt for password hashing

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // If authentication is successful, proceed to the next middleware or route handler
        req.user = dbUser; // Attach the user object to the request for future use
        next();
    } catch (err) {
        console.error('Error during authentication:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}


module.exports = {basicAuth, authenticateToken};
