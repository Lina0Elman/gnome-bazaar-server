// models/db.js
const { MongoClient, ServerApiVersion } = require('mongodb');
const dotenv = require('dotenv');
const config = require('../../config')

// Initialize environment variables
dotenv.config();

const uri = config.mongoClient.uri; 
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectMongoClient() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        client.close();
        process.exit(1); // Exit process on failure
    }
}

async function getMongoClient(dbName) {
    if (!client) {
        await connectMongoClient();
    }
    return client.db(dbName); // Change database name if needed
}

module.exports = { connectMongoClient, getMongoClient };