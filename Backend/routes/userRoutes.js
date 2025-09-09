import express from "express";
import { addUser, getAllUsers, getUserById } from "../controllers/userController.js";

const router = express.Router();

router.post("/add", addUser);     
router.get("/", getAllUsers);     
router.get("/:id", getUserById);  

export default router;
