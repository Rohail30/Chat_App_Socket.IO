import express from "express";
import http from "http";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import cors from "cors";
import { Server } from "socket.io";
import { handleSocketMessage } from "./controllers/chatController.js";



const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,              
}));

app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
}); 

// Database
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// Socket.IO Connectino
io.on("connection", (socket) => {
  console.log("User Connected: ", socket.id);

  socket.on("joinRoom", ({sender, receiver}) => {
    const roomID = [sender, receiver].sort().join("_");
    console.log("RoomID: ",roomID);
    socket.join(roomID);
    console.log("Room Joined");
  })

  socket.on("sendMessage", async (data) => {
    const message = await handleSocketMessage(data);
    console.log("[message]: ", message);
    const roomId = [data.sender, data.receiver].sort().join("_")
    io.to(roomId).emit("receiveMessage", message)
  })

  socket.on("disconnect", () => {
    console.log("client disconnected: ",socket.id);
  })
})

server.listen( 3000, () => {
    console.log("Server is running");
})