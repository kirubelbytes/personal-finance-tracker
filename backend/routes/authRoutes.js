import express from "express"
const router = express.Router();
import { signUpUser, signInUser } from "../controllers/authController.js";

router.post('/sign-up', signUpUser)
router.post('/sign-in', signInUser)

export default router;