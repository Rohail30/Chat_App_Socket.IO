import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/ChatApp");
        console.log('Connected to MongoDB');
    }
    catch (error) {
        console.log("Error connecting to MongoDB", error);
    }
}