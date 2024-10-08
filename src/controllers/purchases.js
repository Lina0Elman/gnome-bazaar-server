const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const User = require('../models/User');

const submitPurchase = async (req, res) => {
    const userId = req.user.id;  // Get user ID from the authenticated user (from JWT or session)

    try {
        // Find the user and populate the cart
        const user = await User.findById(userId).populate('cart.product');

        if (!user.cart.length) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        let totalCost = 0;
        const purchaseProducts = [];

        // Calculate total cost and verify product stock
        for (let item of user.cart) {
            const product = item.product;
            if (product.quantity < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for product: ${product.name}` });
            }

            // Calculate total cost for each item
            const itemCost = parseFloat(product.price.toString()) * item.quantity;
            totalCost += itemCost;

            // Prepare purchase product info
            purchaseProducts.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price
            });

            // Deduct stock from the product
            product.quantity -= item.quantity;
            await product.save();
        }

        // Check if the user has enough credits
        if (parseFloat(user.credits.toString()) < totalCost) {
            return res.status(400).json({ message: 'Not enough credits' });
        }

        // Deduct total cost from user credits
        user.credits -= totalCost;
        user.cart = [];  // Clear the cart
        await user.save();

        // Create a new purchase
        const purchase = new Purchase({
            user: userId,
            products: purchaseProducts,
            totalCost: totalCost
        });

        await purchase.save();

        // Send a success response
        res.status(201).json({ message: 'Purchase successful', purchase });

    } catch (error) {
        console.error('Error submitting purchase:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { submitPurchase };
