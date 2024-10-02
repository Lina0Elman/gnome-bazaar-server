const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: mongoose.Schema.Types.Number, required: true },
    totalCost: { type: mongoose.Schema.Types.Decimal128, required: true },
    purchaseDate: { type: mongoose.Schema.Types.Date, default: Date.now },
});


// Static methods for Purchase model
purchaseSchema.statics.createPurchase = async function (userId, productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error('Product not found');
    }

    if (product.quantity < quantity) {
        throw new Error('Insufficient product quantity');
    }

    const totalCost = product.price * quantity;

    const purchase = new this({
        user: userId,
        product: productId,
        quantity,
        totalCost,
    });

    try {
        await purchase.save();
        // Update product quantity and user credits
        product.quantity -= quantity;
        await product.save();

        const user = await User.findById(userId);
        user.credits = (user.credits || 0) - totalCost;
        await user.save();

        console.log('Created purchase with ID:', purchase._id);
        return purchase;
    } catch (error) {
        throw new Error('Error creating purchase: ' + error.message);
    }
};

purchaseSchema.statics.getUserPurchases = async function (userId) {
    try {
        const purchases = await this.find({ user: userId }).populate('product');
        console.log('Retrieved purchases for user ID:', userId);
        return purchases;
    } catch (error) {
        throw new Error('Error retrieving user purchases: ' + error.message);
    }
};


const Purchase = mongoose.model('Purchase', purchaseSchema);
module.exports = Purchase;
