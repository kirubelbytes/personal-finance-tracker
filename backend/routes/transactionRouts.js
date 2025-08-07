import express from "express"
import authMiddlewire from "../middlewire/authMiddlewire.js";
import { addTransaction, getDashboardInformation, getTransaction, transferMoneyToAccount } from "../controllers/transactionController.js";

const router = express.Router();

router.get('/' ,authMiddlewire , getTransaction);
router.get('/dashboard' ,authMiddlewire , getDashboardInformation);
router.post('/add-transaction/:account_id' ,authMiddlewire , addTransaction);
router.post('/transfer-money',authMiddlewire , transferMoneyToAccount);


export default router;