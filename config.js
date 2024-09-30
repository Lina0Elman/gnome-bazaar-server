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
    }
};