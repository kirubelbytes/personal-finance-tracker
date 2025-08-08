import express from "express"
import pool from "../libs/dabatase.js";

export const getTransaction = async(req, res) => {
    try {
        const today = new Date();
        const _sevenDaysAgo = new Date(today);
        _sevenDaysAgo.setDate(today.getDate() - 7);
        const sevenDaysAgo = _sevenDaysAgo.toISOString().split("T")[0];
        const {df , dt, s} = req.query;
        const {userId } = req.body.user;
        const startDate = new Date(df || sevenDaysAgo);
        const endDate = new Date(dt || new Date());
        const transaction = await pool.query({
            text: "SELECT * FROM tbltransaction WHERE user_id = $1 AND createdAt BETWEEN $2 AND $3 AND (description ILIKE '%' || $4 || '%' OR status ILIKE '%' || $4 || '%' OR source ILIKE '%' || $4 || '%' ORDER BY id DESC)",
            values : [userId, startDate, endDate, s ]
        })
        res.status(200).json({
            status :'success',
            data : transaction.rows
        })
    } catch (error) {
        console.log(error);
        res.status(404).json({
            status : "failed",
            message : error.message
        })
        
    }
}

export const getDashboardInformation = async(req, res) => {
 try {
        
 } catch (error) {
    console.log(error);
    res.status(404).json({
        status : "failed",
        message : error.message
    })
    }
}

export const addTransaction = async(req, res) => {
 try {
    const {userId} = req.body.user;
    const {account_id} = req.params;
    const {description , source , amount} = req.body;
    if(!description || !source || !amount) {
        return res.status(403).json({
            status : "failed",
            message : "Provide required fields"
        })
    }
    if(Number(amount) <= 0) {
        return res.status(403).json({
            status : "failed",
            message : "The amount must be greater than 0"
        })
    }
    const result = await pool.query({
        text : "SELECT * FROM tblaccount WHERE id = $1",
        values : [account_id]
    });
    const accountInfo = result.rows[0];
    if(!accountInfo) {
        return res.status(404).json({
            status : 'failed',
            message : "Invalid Account information"
        })
    }
    if(accountInfo.account_balance <= 0 || accountInfo.account_balance < Number(amount)) {
        return res.status(403).json({
            status : 'failed',
            message : "Transaction Failed. Insufficient account balance"
        })
    }
    try {
        await pool.query("BEGIN");

        await pool.query({
            text : "UPDATE tblaccount SET account_balance = account_balance - $1, updatedAt = CURRENT_TIMESTAMP WHERE id = $2",
            values : [amount , account_id]
        });
        await pool.query({
            text : "INSERT INTO tbltransaction (user_id , description , type, status, amount, source) VALUES ($1 ,$2 ,$3 ,$4 ,$5 ,$6)",
            values : [userId, description, "expense", "completed", amount, source]
        })

        await pool.query("COMMIT");
    } catch (error) {
        await pool.query("ROLLBACK")
        throw error
    }
    res.status(200).json({
        status : "success",
        message : "Transaction completed successfully"
    });
} catch (error) {
     console.log(error);
     res.status(404).json({
        status : "failed",
        message : error.message
    })
    }
}

export const transferMoneyToAccount = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { from_account, to_account, amount } = req.body;

        // Validate required fields
        if (!from_account || !to_account || !amount) {
            return res.status(403).json({
                status: "failed",
                message: "Provide required fields"
            });
        }

        const newAmount = Number(amount);
        if (newAmount <= 0) {
            return res.status(403).json({
                status: "failed",
                message: "The amount must be greater than 0"
            });
        }

        // Check sender account
        const fromAccountResult = await pool.query({
            text: "SELECT * FROM tblaccount WHERE id = $1",
            values: [from_account]
        });
        const fromAccount = fromAccountResult.rows[0];
        if (!fromAccount) {
            return res.status(404).json({
                status: "failed",
                message: "Sender account not found"
            });
        }

        // Check recipient account
        const toAccountResult = await pool.query({
            text: "SELECT * FROM tblaccount WHERE id = $1",
            values: [to_account]
        });
        const toAccount = toAccountResult.rows[0];
        if (!toAccount) {
            return res.status(404).json({
                status: "failed",
                message: "Recipient account not found"
            });
        }

        // Check sender's balance
        if (newAmount > fromAccount.account_balance) {
            return res.status(403).json({
                status: "failed",
                message: "Transfer failed. Insufficient balance"
            });
        }

        // Transaction start
        try {
            await pool.query("BEGIN");

            // Deduct from sender account
            await pool.query({
                text: "UPDATE tblaccount SET account_balance = account_balance - $1, updatedAt = CURRENT_TIMESTAMP WHERE id = $2",
                values: [newAmount, from_account]
            });

            // Add to recipient account
            await pool.query({
                text: "UPDATE tblaccount SET account_balance = account_balance + $1, updatedAt = CURRENT_TIMESTAMP WHERE id = $2",
                values: [newAmount, to_account]
            });

            // Insert transaction record for sender (expense)
            const descriptionSender = `Transfer ${fromAccount.account_name} → ${toAccount.account_name}`;
            await pool.query({
                text: "INSERT INTO tbltransaction (user_id, description, type, status, amount, source) VALUES ($1, $2, $3, $4, $5, $6)",
                values: [userId, descriptionSender, "expense", "completed", newAmount, fromAccount.account_name]
            });

            // Insert transaction record for receiver (income)
            const descriptionReceiver = `Receive ${fromAccount.account_name} → ${toAccount.account_name}`;
            await pool.query({
                text: "INSERT INTO tbltransaction (user_id, description, type, status, amount, source) VALUES ($1, $2, $3, $4, $5, $6)",
                values: [toAccount.user_id, descriptionReceiver, "income", "completed", newAmount, toAccount.account_name]
            });

            await pool.query("COMMIT");

            res.status(200).json({
                status: "success",
                message: "Transfer completed successfully"
            });

        } catch (error) {
            await pool.query("ROLLBACK");
            throw error;
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "failed",
            message: error.message
        });
    }
};
