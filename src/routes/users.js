const basicAuth = require('../middlewares/auth');
const app = require('../app');
const config = require('../../config');

const express = require('express');
const router = express.Router();


// Apply the authentication middleware to a specific route
// app.post(`${config.app.baseName}/api/token`, basicAuth, (req, res) => {
//     const { user, pwd } = req.body;
//     console.log(user, pwd);

//     // res.json({
//     //     name: "Elad D Gozman",
//     //     expiry: new Date(),
//     //     token: "dummy-token",
//     //     isAdmin: true,
//     //     isSupplier: true,
//     // });
// });
// Route to get a list of users from MongoDB
router.get('/', async (req, res) => {
    try {
        const mongo = await getMongoClient('gnomeBazaar');
        const collection = mongo.collection('users');
        const users = await collection.find().toArray();

        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Error fetching users' });
    }
});


// Route to get a specific user by ID
router.get('/:id', async (req, res) => {
    try {
        const mongo = await getMongoClient('gnomeBazaar');
        const collection = mongo.collection('users');
        const user = await collection.findOne({ id: req.params.id });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ message: 'Error fetching user' });
    }
});



router.post(`/token`, basicAuth, (req, res) => {
    console.log("token for user: " + req.user.fullName);
    // At this point, req.user contains the authenticated user from MongoDB
    res.json({
        name: req.user.fullName,
        expiry: new Date(),
        token: "dummy-token",
        isAdmin: req.user.role === 'admin',  // Assuming the role is stored in the 'role' field
        isSupplier: req.user.role === 'supplier', // Example of checking other roles
    });
});

module.exports = router;