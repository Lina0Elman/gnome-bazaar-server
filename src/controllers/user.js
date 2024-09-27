const { getMongoClient } = require('../models/mongo');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const config = require('../../config');

// Controller to get all users
exports.getAllUsers = async (req, res) => {
    try {
        const mongo = await getMongoClient(config.mongoClient.name);
        const collection = mongo.collection(config.mongoClient.usersCollection);
        const users = await collection.find().toArray();
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// Controller to get a specific user
exports.getUserById = async (req, res) => {
    try {
        const mongo = await getMongoClient(config.mongoClient.name);
        const collection = mongo.collection(config.mongoClient.usersCollection);
        const user = await collection.findOne({ id: req.params.id });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ message: 'Error fetching user' });
    }
};

// Controller to update a user
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { userName, pwd, fullName, mail, phone, credits, role } = req.body;

    try {
        const mongo = await getMongoClient(config.mongoClient.name);
        const collection = mongo.collection(config.mongoClient.usersCollection);

        let updateFields = { userName, fullName, mail, phone, credits, role };

        if (pwd) {
            updateFields.pwd = await bcrypt.hash(pwd, 10); // Hash the new password
        }

        const updatedUser = await collection.updateOne({ id }, { $set: updateFields });

        if (updatedUser.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User updated successfully' });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Error updating user' });
    }
};

// Controller to add a new user
exports.addUser = async (req, res) => {
    const { userName, pwd, fullName, mail, phone, credits, role } = req.body;

    try {
        const mongo = await getMongoClient(config.mongoClient.name);
        const collection = mongo.collection(config.mongoClient.usersCollection);

        const hashedPassword = await bcrypt.hash(pwd, 10); // Hash the password
        const newUser = {
            id: uuidv4(),
            userName,
            pwd: hashedPassword,
            fullName,
            mail,
            phone,
            credits,
            role,
        };

        await collection.insertOne(newUser);
        res.status(201).json({ message: 'User added successfully', userId: newUser.id });
    } catch (err) {
        console.error('Error adding user:', err);
        res.status(500).json({ message: 'Error adding user' });
    }
};

// Controller for token generation
exports.generateToken = (req, res) => {
    console.log("looking for a token for user: " + req.user.fullName);
    res.json({
        name: req.user.fullName,
        expiry: new Date(),
        token: "dummy-token", // todo token
        isAdmin: req.user.role === 'admin',
        isSupplier: req.user.role === 'supplier',
        uuid: req.user.id
    });
};
