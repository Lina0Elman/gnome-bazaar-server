// controllers/user.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Purchase = require('../models/Purchase'); // Adjust the path as necessary
const Product = require('../models/Product'); // Adjust the path as necessary
const mongoose = require("mongoose");


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
        const purchases = await Purchase.find({ user: userId }).populate('products.product');
        
        if (!purchases.length) {
            return res.status(400).json({ message: 'No purchases found' });
        }

        // Transform the data into DataPreviewType
        const dataPreview = purchases.map(purchase => {
            const totalCost = parseFloat(purchase.totalCost.toString());
            const totalQuantity = purchase.products.reduce((sum, product) => sum + product.quantity, 0);
            const productTitles = purchase.products.map(p => p.product.name).join(', ');

            return {
                title: productTitles,
                value: totalQuantity,
                total: totalCost
            };
        });

        res.status(200).json(dataPreview);  // Respond with the DataPreviewType array
    } catch (err) {
        console.error('Error fetching user expenses:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};



exports.getUserPurchases = async (req, res) => {
    const userId = req.user.id; // Assuming user ID is available through authentication

    try {
        // Find purchases by the user
        const userPurchases = await Purchase.find({ user: userId }).populate('products.product');

        if (!userPurchases.length) {
            return res.status(404).json({ message: 'No purchases found' });
        }

        // Structure the response
        const purchases = userPurchases.map(purchase => ({
            uuid: purchase._id,
            date: purchase.purchaseDate,
            products: purchase.products.map(item => ({
                product: {
                    productId: item.product._id,
                    productName: item.product.name, 
                    quantity: item.quantity,
                    price: parseFloat(item.price.toString())
                },
                quantity: item.quantity
            })),
        }));

        res.status(200).json(purchases);
    } catch (err) {
        console.error('Error fetching user purchases:', err);
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




exports.addToCart = async (req, res) => {
    const userId = req.user.id; // Assuming you have a middleware that attaches the authenticated user to req.user
    const { _id, quantity } = req.body;

    try {
        // Find the product by ID
        const product = await Product.findById(_id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find the user by their ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the product is already in the cart
        const cartItem = user.cart.find(item => item.product.toString() === _id);

        if (cartItem) {
            // If the product is already in the cart, update the quantity
            cartItem.quantity = cartItem.quantity + 1;
        } else {
            // If the product is not in the cart, add it with the specified quantity
            user.cart.push({ product: _id, quantity: 1 });
        }

        // Save the updated user
        await user.save();

        res.status(200).json({ message: 'Product added to cart successfully', cart: user.cart });
    } catch (err) {
        console.error('Error adding product to cart:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.removeFromCart = async (req, res) => {
    const userId = req.user.id; // Assuming you have a middleware that attaches the authenticated user to req.user
    const { _id, quantity } = req.body; // The product ID and quantity to remove

    try {
        // Find the user by their ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the product in the user's cart
        const cartItemIndex = user.cart.findIndex(item => item.product.toString() === _id);

        if (cartItemIndex === -1) {
            // If the product is not in the cart, return an error
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        // Check if a specific quantity was provided
        if (quantity && quantity > 0) {
            // Decrease the quantity of the cart item
            user.cart[cartItemIndex].quantity -= quantity;

            // If the quantity is less than or equal to zero, remove the item from the cart
            if (user.cart[cartItemIndex].quantity <= 0) {
                user.cart.splice(cartItemIndex, 1);
            }
        } else {
            // If no quantity is provided, remove the product from the cart entirely
            user.cart.splice(cartItemIndex, 1);
        }

        // Save the updated user cart
        await user.save();

        res.status(200).json({ message: 'Product removed from cart successfully', cart: user.cart });
    } catch (err) {
        console.error('Error removing product from cart:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.getUserCartProducts = async (req, res) => {
    const userId = req.user.id; // Assuming you have a middleware that attaches the authenticated user to req.user
    try {
        // Find the user and populate the cart's product details
        const user = await User.findById(userId).populate({
            path: 'cart.product', // Populate the product details
            model: 'Product',
        });

        if (!user || !user.cart.length) {
            return res.status(404).json({ message: 'No products in cart' });
        }

        const cartWithImages = user.cart.map(item => ({
            product: {
                ...item.product._doc,  // Get the product document
                price: item.product.price instanceof mongoose.Types.Decimal128 ? parseFloat(item.product.price.toString()) : item.product.price,
                img: item.product.img ? `data:image/webp;base64,${item.product.img.toString('base64')}` : null
            },
            quantity: item.quantity
        }));

        res.json(cartWithImages);  // Send the cart with images as a JSON response
    } catch (err) {
        console.error('Error fetching user cart products:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
