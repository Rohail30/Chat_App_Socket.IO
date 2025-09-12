import express from "express";
const router = express.Router();

import { newChat, getMessages, updateMessageStatus } from "../controllers/chatController.js";



// @desc    Get chat between two users
// router.get('/:receiver', getChat);

router.post('/new', newChat);

router.get('/getMessages/:id', getMessages);

router.put('/updateStatus/:id', updateMessageStatus);



export default router;
