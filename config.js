module.exports = {
    mongoClient: {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017'
    }
};