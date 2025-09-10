import express from "express";
const router = express.Router();

import { getChat, getChatUsers } from "../controllers/chatController.js";



// @desc    Get chat between two users
router.get('/:receiver', getChat);

// @desc    Get all chats
router.get('/chat/users', getChatUsers);

export default router;
