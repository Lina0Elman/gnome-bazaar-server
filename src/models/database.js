import mongoose from 'mongoose';

const connectToDatabase = async () => {
    try {
        await mongoose.connect('your_mongodb_connection_string', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to MongoDB!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};



const UserSchema = new mongoose.Schema({
    userName: { type: mongoose.Schema.Types.String, required: true },
    pwd: { type: mongoose.Schema.Types.String, required: true },
    mail: { type: mongoose.Schema.Types.String, required: true },
    fullName: { type: mongoose.Schema.Types.String, required: true },
    phone: { type: mongoose.Schema.Types.String, required: true },
    credits: { type: mongoose.Schema.Types.Decimal128 },
    role: { type: mongoose.Schema.Types.String, required: true },
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]  // Reference to products
});

const productSchema = new mongoose.Schema({
    name: { type: mongoose.Schema.Types.String, required: true },
    description: { type: mongoose.Schema.Types.String, required: true },
    img: { type: mongoose.Schema.Types.Buffer },  // Buffer type for images
    price: { type: mongoose.Schema.Types.Decimal128, required: true },
    category: { type: mongoose.Schema.Types.String, required: true },
    quantity: { type: mongoose.Schema.Types.Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }  // Reference to the seller
});

const PurchaseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: mongoose.Schema.Types.Number, required: true },
    totalCost: { type: mongoose.Schema.Types.Decimal128, required: true },
    purchaseDate: { type: mongoose.Schema.Types.Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', productSchema);
const Purchase = mongoose.model('Purchase', PurchaseSchema);


module.exports = {
    connectToDatabase
};