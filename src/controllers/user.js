// controllers/user.js
const { StatusCodes, getReasonPhrase } = require ('http-status-codes');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Purchase = require('../models/Purchase'); // Adjust the path as necessary
const Product = require('../models/Product'); // Adjust the path as necessary
const mongoose = require("mongoose");
const {isRoleValid} = require("../utils/roleUtils");


// Controller to get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error retrieving users' });
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
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching user' });
    }
};

exports.getAdminSalesInfo = async (req, res) => {
    try {
        // Step 1: Aggregate sales information grouped by date
        const salesInfo = await Purchase.aggregate([
            // Unwind the products array so each product can be processed individually
            { $unwind: "$products" },

            // Lookup the product details from the Product collection
            {
                $lookup: {
                    from: "products", // Name of the Product collection
                    localField: "products.product", // Field in Purchase
                    foreignField: "_id", // Field in Product
                    as: "productDetails" // Name of the array to hold the result
                }
            },

            // Unwind the productDetails array to merge product info with the document
            { $unwind: "$productDetails" },

            // Group by the date and calculate total earnings for that date
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: { format: "%Y-%m-%d", date: "$purchaseDate" } // Group by date in 'YYYY-MM-DD' format
                        }
                    },
                    totalEarnings: { $sum: { $multiply: ["$products.quantity", { $toDouble: '$products.price' }] } } // Calculate total earnings
                }
            },

            // Project the final result to include the 'date' and 'close' fields
            {
                $project: {
                    _id: 0, // Exclude the _id field from the output
                    date: "$_id.date", // Use the grouped date as 'date'
                    close: "$totalEarnings" // Total earnings as 'close'
                }
            },

            // Sort by date to maintain chronological order
            { $sort: { date: 1 } }
        ]);

        if (!salesInfo || salesInfo.length === 0) {
            return res.status(404).json({ message: 'No sales data found.' });
        }

        return res.status(200).json(salesInfo);
    } catch (err) {
        console.error('Error fetching sales info:', err);
        return res.status(500).json({ message: 'Internal server error' });
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
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
};

// Controller to add a new user
exports.addUser = async (req, res) => {
    const { userName, pwd, fullName, mail, phone, credits, role } = req.body;

    try {
        if (!isRoleValid(role)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid role' });
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
        res.status(StatusCodes.CREATED).json({ message: 'User added successfully', userId: user._id });
    } catch (err) {
        console.error('Error adding user:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error adding user' });
    }
};


exports.getUserExpenses = async (req, res) => {
    const userId = req.user.id; // Assuming user ID is available through authentication

    try {
        // Find purchases by the user
        const purchases = await Purchase.find({ user: userId }).populate('products.product');
        
        if (!purchases.length) {
            return res.status(StatusCodes.NO_CONTENT).json({ message: 'No purchases found' });
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

        res.status(StatusCodes.OK).json(dataPreview);  // Respond with the DataPreviewType array
    } catch (err) {
        console.error('Error fetching user expenses:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};



exports.getUserPurchases = async (req, res) => {
    const userId = req.user.id; // Assuming user ID is available through authentication

    try {
        // Find purchases by the user
        const userPurchases = await Purchase.find({ user: userId }).populate('products.product');

        if (!userPurchases.length) {
            return res.status(StatusCodes.NO_CONTENT).json({ message: 'No purchases found' });
        }

        // Structure the response
        const purchases = userPurchases.map(purchase => ({
            uuid: purchase._id,
            date: purchase.purchaseDate,
            products: purchase.products.map(item => ({
                product: {
                    id: item.product._id,
                    name: item.product.name, 
                    quantity: item.product.quantity,
                    price: parseFloat(item.product.price.toString()),
                    description: item.product.description,
                    img: item.product.img? `data:image/webp;base64,${item.product.img.toString('base64')}` : null,
                    category: item.product.category
                },
                quantity: item.quantity
            })),
        }));

        res.status(StatusCodes.OK).json(purchases);
    } catch (err) {
        console.error('Error fetching user purchases:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};



exports.getUserCategories = async (req, res) => {
    const userId = req.params.id; // Assuming user ID is available through authentication

    try {
        // Find purchases by the user and populate the product details
        const purchases = await Purchase.find({ user: userId }).populate('product');
        if (!purchases.length) {
            return res.status(StatusCodes.NO_CONTENT).json({ message: 'No purchases found' });
        }

        // Extract unique categories from the purchased products
        const categories = [...new Set(purchases.map(purchase => purchase.product.category))];

        res.status(StatusCodes.OK).json({ categories });
    } catch (err) {
        console.error('Error fetching user categories:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};




exports.addToCart = async (req, res) => {
    const userId = req.user.id; // Assuming you have a middleware that attaches the authenticated user to req.user
    const { _id } = req.body;

    try {
        // Find the product by ID
        const product = await Product.findById(_id);
        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Product not found' });
        }

        // Find the user by their ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
        }

        // Check if the product is already in the cart
        const cartItem = user.cart.find(item => item.product.toString() === _id);

        if (cartItem) {
            // Check if adding one more would exceed the product's stock
            if (cartItem.quantity >= product.quantity) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: `Maximum available quantity for ${product.name} reached` });
            }

            // If the product is already in the cart, update the quantity
            cartItem.quantity += 1;
        } else {
            // If the product is not in the cart, add it with quantity 1
            user.cart.push({ product: _id, quantity: 1 });
        }


        // Save the updated user
        await user.save();

        res.status(StatusCodes.OK).json({ message: 'Product added to cart successfully', cart: user.cart });
    } catch (err) {
        console.error('Error adding product to cart:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};


exports.removeFromCart = async (req, res) => {
    const userId = req.user.id; // Assuming you have a middleware that attaches the authenticated user to req.user
    const { _id, quantity } = req.body; // The product ID and quantity to remove

    try {
        // Find the user by their ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
        }

        // Find the product in the user's cart
        const cartItemIndex = user.cart.findIndex(item => item.product.toString() === _id);

        if (cartItemIndex === -1) {
            // If the product is not in the cart, return an error
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Product not found in cart' });
        }

        // Check if a specific quantity was provided
        if (quantity && quantity > 0) {
            // Decrease the quantity of the cart item
            user.cart[cartItemIndex].quantity --;

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

        res.status(StatusCodes.OK).json({ message: 'Product removed from cart successfully', cart: user.cart });
    } catch (err) {
        console.error('Error removing product from cart:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
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
            return res.status(StatusCodes.NO_CONTENT).json({ message: 'No products in cart' });
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
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
};

// Update User Role
exports.updateUserRole = async (req, res) => {
    const { userId, newRole } = req.body;

    if (!userId || !newRole) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Missing required fields' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
        }

        if (!isRoleValid(newRole)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid role' });
        }

        user.role = newRole;
        await user.save();

        res.json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};

// Add Credits to User
exports.sendCreditsToUser = async (req, res) => {
    const { userId, creditsToAdd } = req.body;

    if (!userId || creditsToAdd == null) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Missing required fields' });
    }

    if (typeof creditsToAdd !== 'number' || creditsToAdd <= 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid credits value' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
        }

        user.credits = (user.credits || 0) + creditsToAdd;
        await user.save();

        res.json({ message: 'Credits added successfully' });
    } catch (error) {
        console.error('Error adding credits to user:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
};
