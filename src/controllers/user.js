// controllers/user.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Purchase = require('../models/Purchase'); // Adjust the path as necessary



// Controller to get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({ message: 'Error retrieving users' });
    }
};

// Controller to get a specific user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.id }).populate('cart');
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
    const id = req.user.id;
    const { userName, pwd, fullName, mail, phone, credits, role } = req.body;
   // const requesterId = req.user.id; // Assuming `basicAuth` middleware sets `req.user`

    try {
        let updateData = { userName, fullName, mail, phone, credits, role, pwd };

        // if (pwd) {
        //     updateData.pwd = await bcrypt.hash(pwd, 10); // Hash the new password
        // }

        const updatedUser = await User.updateUserInfo(id, updateData);

        res.json(updatedUser);
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: err.message });
    }
};

// Controller to add a new user
exports.addUser = async (req, res) => {
    const { userName, pwd, fullName, mail, phone, credits, role } = req.body;

    try {
        if (!['Admin', 'Supplier', 'User'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const hashedPassword = await bcrypt.hash(pwd, 10); // Hash the password

        const userData = {
            userName,
            pwd: hashedPassword,
            fullName,
            mail,
            phone,
            credits: credits || 0,
            role,
        };

        const user = await User.addUser(userData);
        res.status(201).json({ message: 'User added successfully', userId: user._id });
    } catch (err) {
        console.error('Error adding user:', err);
        res.status(500).json({ message: 'Error adding user' });
    }
};


exports.getUserExpenses = async (req, res) => {
    const userId = req.user.id; // Assuming user ID is available through authentication

    try {
        // Find purchases by the user
        const purchases = await Purchase.find({ user: userId }).populate('product');
        if (!purchases.length) {
            return res.status(404).json({ message: 'No purchases found' });
        }

        // Calculate total expenses based on purchase totalCost
        const totalExpenses = purchases.reduce((total, purchase) => {
            return total + parseFloat(purchase.totalCost.toString());
        }, 0);

        res.status(200).json({ totalExpenses, purchases });
    } catch (err) {
        console.error('Error fetching user expenses:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};




exports.getUserPurchases = async (req, res) => {
    const userId = req.user.id; // Assuming user ID is available through authentication

    try {
        // Find purchases by the user
        const purchases = await Purchase.find({ user: userId }).populate('product');
        if (!purchases.length) {
            return res.status(404).json({ message: 'No purchases found' });
        }

        // Calculate total expenses based on purchase totalCost
        const totalExpenses = purchases.reduce((total, purchase) => {
            return total + parseFloat(purchase.totalCost.toString());
        }, 0);

        res.status(200).json({ totalExpenses, purchases });
    } catch (err) {
        console.error('Error fetching user expenses:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};





exports.getUserCategories = async (req, res) => {
    const userId = req.params.id; // Assuming user ID is available through authentication

    try {
        // Find purchases by the user and populate the product details
        const purchases = await Purchase.find({ user: userId }).populate('product');
        if (!purchases.length) {
            return res.status(404).json({ message: 'No purchases found' });
        }

        // Extract unique categories from the purchased products
        const categories = [...new Set(purchases.map(purchase => purchase.product.category))];

        res.status(200).json({ categories });
    } catch (err) {
        console.error('Error fetching user categories:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
