import "dotenv/config"
import express from "express";
import http from "http";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import cors from "cors";
import { Server } from "socket.io";
import { handleSocketMessage, handleReadStatus } from "./controllers/chatController.js";



const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,              
}));

app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
}); 

// Database
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// Socket.IO Connection
io.on("connection", (socket) => {
  console.log("User Connected: ", socket.id);

  socket.on("joinRoom", ({sender, receiver}) => {
    const roomID = [sender, receiver].sort().join("_");
    socket.join(roomID);
    console.log("Room Joined: ", roomID);
  })

  socket.on("sendMessage", async (data) => { 
    const message = await handleSocketMessage(data);
    const roomId = [data.sender, data.receiver].sort().join("_");
    io.to(roomId).emit("receiveMessage", message)
  })

  socket.on("seenMessage", ({chatID, receiver}) => {
    console.log("[chatID] ==> ", chatID, receiver);
    const status = handleReadStatus({chatID, receiver})
  })

  socket.on("disconnect", () => {
    console.log("client disconnected: ",socket.id);
  })
})

server.listen( process.env.PORT, () => {
    console.log("Server is running");
})