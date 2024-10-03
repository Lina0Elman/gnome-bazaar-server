const Product = require('../models/Product'); 
const mongoose = require("mongoose");


// Controller function to get supplier products
const getProducts = async (req, res) => {
    try {
        const { productName, category, skip = 0, take = 10 } = req.query;// Build the filter object based on the provided query parameters

        
        const filter = {};
        if (productName) {
            filter.name = { $regex: new RegExp(productName, 'i') };  // Case-insensitive search
        }
        if (category) {
            filter.category = category;
        }

        // Fetch filtered and paginated products from the database
        const products = await Product.find(filter)
            .skip(parseInt(skip))   // Skip entries for pagination
            .limit(parseInt(take))   // Limit the number of returned entries
            .exec();


        if (!products.length) {
            return res.status(404).json({ message: 'No products found' });
        }
        
        // Convert image buffers to base64
        const productsWithImages = products.map(product => ({
            ...product._doc,
            price: product.price instanceof mongoose.Types.Decimal128 ? parseFloat(product.price.toString()) : product.price,
            img: product.img ? `data:image/webp;base64,${product.img.toString('base64')}` : null
        }));

        // Send the products as a JSON response
        res.json(productsWithImages);

    } catch (err) {
        console.error('Error fetching supplier products:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};



const uploadSupplierProduct = async (req, res) => {
    const { name, description, price, category, quantity } = req.body;
    const userId = req.params.id; 

    try {
        const imgBuffer = req.file ? req.file.buffer : null;  // Get the Buffer from file if available

        const productData = { name, description, price, category, quantity, img: imgBuffer };

        const product = await Product.addProduct(productData, userId);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error adding product: ' + error.message });
    }
};




module.exports = { getProducts, uploadSupplierProduct };
