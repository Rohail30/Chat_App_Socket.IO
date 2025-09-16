import "dotenv/config";
import express from "express";
import http from "http";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import cors from "cors";
import { Server } from "socket.io";
import {
  handleSocketMessage,
  handleReadStatus,
  updateMessageStatus,
  DoubleTick,
} from "./controllers/chatController.js";

const app = express();

connectDB();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// storing users like this:
// onlineUsers.set(userId, socket.id);
// So the key = userId
// and the value = socket.id

const onlineUsers = new Map();

// Socket.IO Connection
io.on("connection", (socket) => {
  const { userId } = socket.handshake.auth;
  console.log("User Connected: ", socket.id);

  if (userId) {
    onlineUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} connected with socket ${socket.id}`);
  }

  socket.on("joinRoom", ({ sender, receiver }) => {
    const roomID = [sender, receiver].sort().join("_");
    socket.join(roomID);
    console.log("Room Joined: ", roomID);
  });

  socket.on("WhoIsOnline", async ({ sender }) => {
    console.log("[onlineUsers]", onlineUsers);
    for (const [userId] of onlineUsers) {
      if (userId != sender) {
        const updatedMessage = await DoubleTick({
          sender: sender,
          receiver: userId,
        });
        const roomId = [sender, userId].sort().join("_");
        io.to(roomId).emit("receiveMessage", updatedMessage);
      }
    }
  });

  socket.on("sendMessage", async (data) => {
    console.log("[DATA]", data);
    const message = await handleSocketMessage(data);
    const roomId = [data.sender, data.receiver].sort().join("_");
    const socketId = onlineUsers.get(data.receiver);
    console.log("[socketId]", socketId);
    console.log("[onlineUsers]", onlineUsers);
    if (socketId) {
      // ✅ receiver is online → send directly

      const updatedMessage = await updateMessageStatus(data.chat);
      console.log("[Message Sent Throuhgh Update]", updatedMessage);
      io.to(roomId).emit("receiveMessage", updatedMessage);
    } else {
      console.log("[Message Sent Normally]");
      io.to(roomId).emit("receiveMessage", message);
      // console.log(`User ${data.receiver} is offline`);
    }
  });

  socket.on("seenMessage", async ({ chatID, receiver, sender }) => {
    const updatedMessages = await handleReadStatus({ chatID, receiver });
    const roomId = [sender, receiver].sort().join("_");
    io.to(roomId).emit("message_read", updatedMessages);
  });

  socket.on("disconnect", () => {
    console.log(`User ${userId} disconnected`);
    onlineUsers.delete(userId);
  });
});

server.listen(process.env.PORT, () => {
  console.log("Server is running");
});
