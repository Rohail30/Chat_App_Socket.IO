import express from "express";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,              
}));

app.use(express.json());

// Database
connectDB();

// Routes
app.use("/api/users", userRoutes);

app.listen( 3000, () => {
    console.log("Server is running");
})