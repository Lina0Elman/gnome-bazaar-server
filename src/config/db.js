import dotenv from 'dotenv';
import config  from '../../config';
import mongoose from 'mongoose';

// Initialize environment variables
dotenv.config();

const uri = config.mongoClient.uri;



const connectToDatabase = async () => {
    try {
        await mongoose.connect(uri, {
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