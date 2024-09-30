import bcrypt from 'bcrypt';
import config from '../../config';
import User from '../models/User';

// Controller to get all users
const getAllUsers = async () => {
    try {
        const users = await User.find().populate('cart');
        return users;
    } catch (error) {
        throw new Error('Error retrieving users: ' + error.message);
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
    // const { userName, pwd, fullName, mail, phone, credits, role } = req.body;

    const { role } = req.body;
    try {
        if (!['Admin', 'Supplier', 'User'].includes(role)) {
            throw new Error('Invalid role');
        }

        const hashedPassword = await bcrypt.hash(pwd, 10); // Hash the password
        const userData = {...[req.body], pwd: hashedPassword};

        const user = await User.addUser(userData);
        res.status(201).json({ message: 'User added successfully', userId: user._id });
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
