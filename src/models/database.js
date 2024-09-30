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

module.exports = {
    connectToDatabase
};