import express from "express";
const router = express.Router();

const { getChat, getChatUsers } = require('../controllers/chatController');
const verifyToken = require('../middleware/verifyToken');

// @desc    Get chat between two users
router.get('/api/chat/:reciever', verifyToken, getChat);

// @desc    Get all chats
router.get('/chat/users', verifyToken, getChatUsers);

export default router;
