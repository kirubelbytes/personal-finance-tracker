import express from "express"
import authMiddlewire from "../middlewire/authMiddlewire.js";
import { getUser, changePassword, updateUser } from "../controllers/userController.js";
const router = express.Router();

router.get('/' , authMiddlewire, getUser);
router.put('/change-password',authMiddlewire , changePassword);
router.put('/:id', authMiddlewire, updateUser)

export default router;