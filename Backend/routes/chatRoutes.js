import express from "express";
const router = express.Router();

import { newChat, getMessages, deleteForMe, deletedForEveryone } from "../controllers/chatController.js";



// @desc    Get chat between two users
// router.get('/:receiver', getChat);

router.post('/new', newChat);

router.get('/getMessages/:id', getMessages);

router.patch('/deleteForMe', deleteForMe);

router.patch('/deleteForAll', deletedForEveryone);

//router.put('/updateStatus/:id', updateMessageStatus);



export default router;
