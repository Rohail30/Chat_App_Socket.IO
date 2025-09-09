import express from "express";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
app.use(express.json);

connectDB();

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

app.listen( 3000, () => {
    console.log("Server is running");
})
