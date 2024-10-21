const Product = require('../models/Product');
const mongoose = require('mongoose');
const Purchase = require('../models/Purchase');


// Controller to get category sales info grouped by month
exports.getCategorySalesInfo = async (req, res) => {
    const userId = req.user.id; // Assuming supplier user ID is available through authentication

    try {
        // Step 1: Find all products belonging to the supplier (user)
        const supplierProducts = await Product.find({ user: userId }).select('_id');

        // Step 2: Get the product IDs to filter purchases
        const productIds = supplierProducts.map(product => product._id);

        // Step 3: Aggregate purchases grouped by month and calculate total earnings
        const salesInfo = await Purchase.aggregate([
            {
                $match: {
                    'products.product': { $in: productIds }  // Only purchases of supplier's products
                }
            },
            {
                $unwind: '$products' // Deconstruct the products array
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$purchaseDate' },
                        month: { $month: '$purchaseDate' }
                    },
                    totalEarnings: {
                        $sum: { $multiply: ['$products.price', '$products.quantity'] } // Calculate earnings
                    }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 } // Sort by year and month
            }
        ]);

        // Step 4: Format the result into the desired structure
        const result = salesInfo.map(info => ({
            date: new Date(info._id.year, info._id.month - 1, 1), // JavaScript months are 0-indexed
            close: info.totalEarnings
        }));

        res.json(result);
    } catch (error) {
        console.error('Error retrieving category sales info:', error);
        res.status(500).json({ message: 'Error retrieving sales info' });
    }
};


// Controller function to get supplier products by user
exports.getSupplierProducts = async (req, res) => {
    try {
        const { productName, category, skip = 0, take = 10 } = req.query;
        const userId = req.user.id; // Assuming user ID is available through authentication middleware

        // Build the filter object based on the provided query parameters and user ID
        const filter = { user: userId };  // Ensure products are filtered by the user's ID
        if (productName) {
            filter.name = { $regex: new RegExp(productName, 'i') };  // Case-insensitive search for product name
        }
        if (category) {
            filter.category = category;  // Filter by category if provided
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


// Controller to get all 
exports.getSalesInfo = async (req, res) => {
    const userId = req.user.id; // Assuming supplier user ID is available through authentication

    try {
        // Step 1: Find all products belonging to the supplier (user)
        const supplierProducts = await Product.find({ user: userId }).select('_id');

        // Step 2: Get the product IDs to filter purchases
        const productIds = supplierProducts.map(product => product._id);

        // Step 3: Aggregate purchases grouped by month and calculate total earnings
        const salesInfo = await Purchase.aggregate([
            {
                $match: {
                    'products.product': { $in: productIds }  // Only purchases of supplier's products
                }
            },
            {
                $unwind: '$products' // Deconstruct the products array
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$purchaseDate' },
                        month: { $month: '$purchaseDate' }
                    },
                    totalEarnings: {
                        $sum: {
                            $multiply: [
                                { $toDouble: '$products.price' }, // Convert price to double
                                '$products.quantity'
                            ]
                        }
                    }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 } // Sort by year and month
            }
        ]);

        // Step 4: Format the result into the desired structure
        const result = salesInfo.map(info => ({
            date: new Date(info._id.year, info._id.month - 1, 1), // JavaScript months are 0-indexed
            close: info.totalEarnings
        }));

        res.json(result);
    } catch (error) {
        console.error('Error retrieving sales info:', error);
        res.status(500).json({ message: 'Error retrieving sales info' });
    }
};





// exports.getCategorySalesInfo = async (req, res) => {
//     // todo
//     try {
//         const result = [
//             { date: new Date(2024, 3, 1), close: 1000 },
//             { date: new Date(2024, 4, 1), close: 500 },
//             { date: new Date(2024, 5, 1), close: 170 },
//             { date: new Date(2024, 6, 1), close: 170 },
//             { date: new Date(2024, 7, 1), close: 170 },
//         ];

//         res.json(result);
//     } catch (error) {
//         console.error('Error retrieving users:', error);
//         res.status(500).json({ message: 'Error retrieving users' });
//     }
// };