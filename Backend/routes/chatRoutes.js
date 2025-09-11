import express from "express";
const router = express.Router();

import { getChat } from "../controllers/chatController.js";



// @desc    Get chat between two users
router.get('/:receiver', getChat);



export default router;
