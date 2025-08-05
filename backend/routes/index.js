import express from "express"
import authRoutes from "./authRoutes.js"
// import accountRoutes from "./accountRoutes.js"
// import transactionRoutes from './transactionRouts.js'
// import userRoutes from "./userRoutes.js"

const router = express.Router();

router.use("/auth", authRoutes);
// router.use("/account", accountRoutes);
// router.use("/transaction", transactionRoutes)
// router.use("/user", userRoutes)
export default router;