import express from "express"
import authMiddlewire from "../middlewire/authMiddlewire.js";
import { getAccounts, createAccount , addMoneyToAccount } from "../controllers/accountController.js"
const router = express.Router();

router.get("/",authMiddlewire,  getAccounts )
router.get("/:id",authMiddlewire,  getAccounts )
router.post("/create",authMiddlewire,  createAccount)
router.put("/add-money/:id" ,authMiddlewire, addMoneyToAccount)

export default router