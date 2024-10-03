const Product = require('../models/Product'); 

// Controller function to get supplier products
const getSupplierProducts = async (req, res) => {
    try {
        // Fetch products from the database (you can add filters if needed)
        const products = await Product.find(); // Adjust query as necessary

        if (!products.length) {
            return res.status(404).json({ message: 'No products found' });
        }

        // Send the products as a JSON response
        res.json(products);
    } catch (err) {
        console.error('Error fetching supplier products:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};



module.exports = { getSupplierProducts };
