const mongoose = require("mongoose");
const User = require('../models/User'); // needed



const productSchema = new mongoose.Schema({
    name: { type: mongoose.Schema.Types.String, required: true },
    description: { type: mongoose.Schema.Types.String, required: true },
    img: { type: mongoose.Schema.Types.Buffer, default: null },  // Optional image
    price: { 
        type: mongoose.Schema.Types.Decimal128, 
        required: true, 
        min: [0, 'Price cannot be negative']  // Validate positive price
    },
    category: { type: mongoose.Schema.Types.String, required: true },
    quantity: { 
        type: mongoose.Schema.Types.Number, 
        required: true, 
        min: [0, 'Quantity cannot be negative'],  // Validate positive quantity
        default: 0  // Default value for quantity
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }  // Reference to the seller, required
}, {
    toJSON: {
        transform: function(doc, ret) {
            if (ret.price instanceof mongoose.Types.Decimal128) {
                ret.price = parseFloat(ret.price.toString());
            }

            return ret;
        }
    }
});


// Static methods for Product model
productSchema.statics.addProduct = async function (productData, userId) {
    const product = new this({
        ...productData,
        user: userId,
    });

    try {
        await product.save();
        console.log('Added product with ID:', product._id);
        return product;
    } catch (error) {
        throw new Error('Error adding product: ' + error.message);
    }
};

productSchema.statics.updateProductDetails = async function (productId, updateData) {
    try {
        const updatedProduct = await this.findByIdAndUpdate(productId, updateData, { new: true });
        console.log('Updated product with ID:', productId);
        return updatedProduct;
    } catch (error) {
        throw new Error('Error updating product details: ' + error.message);
    }
};

productSchema.statics.removeProduct = async function (productId) {
    try {
        const deletedProduct = await this.findByIdAndDelete(productId);
        console.log('Removed product with ID:', productId);
        return deletedProduct;
    } catch (error) {
        throw new Error('Error removing product: ' + error.message);
    }
};

productSchema.statics.getProducts = async function (filter = {}, options = {}) {
    const { limit = 10, skip = 0 } = options;
    try {
        const products = await this.find(filter).skip(skip).limit(limit);
        console.log('Retrieved products:', products);
        return products;
    } catch (error) {
        throw new Error('Error retrieving products: ' + error.message);
    }
};


const Product = mongoose.model('Product', productSchema);
module.exports = Product;