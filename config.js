// config.js
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Load environment variables from .env.local file if in development
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.local' });
}

module.exports = {
    mongoClient: {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017',
        name: 'gnomeBazaar',
        usersCollection: 'users',
        productsCollection: 'products'
    },
    app: {
        port: process.env.PORT || 5000,
        baseName: process.env.BASE_NAME || '/Gnome-Bazaar'
    },
    jwtSecret: process.env.JWT_SECRET || 'lala',
    weatherApiKey: process.env.WEATHER_API
};