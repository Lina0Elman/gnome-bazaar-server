// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Product = require('../models/Product'); // Adjust the path as necessary


// Cart item schema to store product reference and quantity
const cartItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { 
        type: mongoose.Schema.Types.Number, 
        required: true, 
        min: [1, 'Quantity cannot be less than 1'],  // Ensure quantity is at least 1
        default: 1  // Default quantity is 1
    }
}, { _id: false }); // Disable auto-generated _id for cart items


const userSchema = new mongoose.Schema({
    userName: { type: mongoose.Schema.Types.String, required: true },
    pwd: { type: mongoose.Schema.Types.String, required: true },
    mail: { type: mongoose.Schema.Types.String, required: true },
    fullName: { type: mongoose.Schema.Types.String, required: true },
    phone: { type: mongoose.Schema.Types.String, required: true },
    credits: { type: mongoose.Schema.Types.Decimal128, default: 0 },
    role: { type: mongoose.Schema.Types.String, required: true },
    cart: [cartItemSchema]
}, {
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id;  // Map _id to id
            delete ret._id;     // Optionally remove _id from the response
            delete ret.__v;     // Optionally remove __v (version key)

            if (ret.credits instanceof mongoose.Types.Decimal128) {
                ret.credits = parseFloat(ret.credits.toString());
            }

            return ret;
        }
    }
});

// Static methods for User model
userSchema.statics.getAllUsers = async function () {
    try {
        const users = await this.find().populate('cart');
        console.log('Retrieved users');
        return users;
    } catch (error) {
        throw new Error('Error retrieving users: ' + error.message);
    }
};

userSchema.statics.addUser = async function (userData) {
    const user = new this(userData);
    try {
        await user.save();
        console.log('Added user with ID:', user._id);
        return user;
    } catch (error) {
        throw new Error('Error adding user: ' + error.message);
    }
};

userSchema.statics.updateUserInfo = async function (userId, updateData) {
    const requester = await this.findById(userId);
    if (!requester) throw new Error('Requester not found');

    try {
        const updatedUser = await this.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
        if (!updatedUser) throw new Error('User not found');
        console.log('Updated user with ID:', userId);
        return updatedUser;
    } catch (error) {
        throw new Error('Error updating user info: ' + error.message);
    }
};

userSchema.statics.changeUserRole = async function (userId, newRole, requesterId) {
    const requester = await this.findById(requesterId);
    if (!requester) throw new Error('Requester not found');

    if (requester.role !== 'Admin') {
        throw new Error('Unauthorized: Only admins can change user roles.');
    }

    try {
        const updatedUser = await this.findByIdAndUpdate(userId, { role: newRole }, { new: true, runValidators: true });
        if (!updatedUser) throw new Error('User not found');
        console.log('Changed role for user ID:', userId);
        return updatedUser;
    } catch (error) {
        throw new Error('Error changing user role: ' + error.message);
    }
};

userSchema.statics.removeUser = async function (userId, requesterId) {
    const requester = await this.findById(requesterId);
    if (!requester) throw new Error('Requester not found');

    if (requester.role !== 'Admin') {
        throw new Error('Unauthorized: Only admins can remove users.');
    }

    try {
        const deletedUser = await this.findByIdAndDelete(userId);
        if (!deletedUser) throw new Error('User not found');
        console.log('Removed user with ID:', userId);
        return deletedUser;
    } catch (error) {
        throw new Error('Error removing user: ' + error.message);
    }
};

userSchema.statics.addProductToCart = async function (userId, productId) {
    try {
        const user = await this.findById(userId);
        if (!user) throw new Error('User not found');

        user.cart.push(productId);
        await user.save();
        console.log('Added product to cart for user ID:', userId);
        return user;
    } catch (error) {
        throw new Error('Error adding product to cart: ' + error.message);
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;