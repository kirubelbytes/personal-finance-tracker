import express from "express"
import pool from "../libs/dabatase.js";
import { getMonthName } from "../libs/index.js";

export const getTransaction = async(req, res) => {
    try {
        
        const today = new Date();
        const _sevenDaysAgo = new Date(today);
        _sevenDaysAgo.setDate(today.getDate() - 7);
        const sevenDaysAgo = _sevenDaysAgo.toISOString().split("T")[0]; // Fix here: added ()

        const { df, dt, s } = req.query;
        const { userId } = req.body.user;

        const startDate = df ? new Date(df) : new Date(sevenDaysAgo);
        const endDate = dt ? new Date(dt) : new Date();

        // Optional: Validate startDate and endDate are valid dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
            status: "failed",
            message: "Invalid date format in query parameters"
        });
        }

        // Convert to ISO string with full timestamp for PostgreSQL
        const startDateStr = startDate.toISOString();
        const endDateStr = endDate.toISOString();

        const transaction = await pool.query({
        text: `SELECT * FROM tbltransaction 
                WHERE user_id = $1 
                AND createdAt BETWEEN $2 AND $3 
                AND (description ILIKE '%' || $4 || '%' 
                        OR status ILIKE '%' || $4 || '%' 
                        OR source ILIKE '%' || $4 || '%') 
                ORDER BY id DESC`,
        values: [userId, startDateStr, endDateStr, s || ""]
        });
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
    const { userId } = req.body.user;
    let totalIncome = 0;
    let totalExpense = 0;
    const transactionResult = await pool.query({
        text: `
            SELECT type, SUM(amount) AS totalAmount
            FROM tbltransaction
            WHERE user_id = $1
            GROUP BY type
            ORDER BY type
        `,
        values: [userId]
        });

    const transactions = transactionResult.rows;
    transactions.forEach((transaction) => {
        if(transaction.type === "income") {
            totalIncome += transaction.totalamount;
        } else {
            totalExpense += transaction.totalamount;
        }
    })
    const availableBalance = totalIncome - totalExpense;
    // Aggregate transaction to sum by type and group by month
    const year = new Date().getFullYear();
    const start_date = new Date(year, 0, 1); //jan 1st of the year
    const end_date =  new Date(year, 11, 31, 23, 59, 59);
    const result = await pool.query({
        text : "SELECT EXTRACT (MONTH FROM createdAt) as month , type, SUM(amount) as totalAmount FROM tbltransaction WHERE user_id = $1 AND createdAt BETWEEN $2 AND $3 GROUP BY EXTRACT (MONTH from createdAt), type",
        values : [userId, start_date , end_date]
    });
          // Organaise Data
    // const data = new Array(12).fill().map(_,index) => {
    //     const monthData = result.rows.filter((item) => parseInt(item.month === index +1 ));
    // }
    const data = new Array(12).fill().map((_, index) => {
        const monthData = result.rows.filter(
            (item) => parseInt(item.month) === index + 1
        );
    const income = monthData.find((item) => item.type === "income")?.totalIncome || 0;
    const expense = monthData.find((item) => item.type === "expense")?.totalExpense || 0;
    return {
        label: getMonthName(index),
        income,
        expense
    }
    });
    // fetch last transaction 
    const lastTransactionResult = await pool.query({
        text : "SELECT * FROM tbltransaction WHERE user_id = $1 ORDER BY id DESC LIMIT 5",
        values : [userId]
    })
    const lastTransaction = lastTransactionResult.rows;
    // fetch last account
    const lastAccountResult = await pool.query({
        text : "SELECT * FROM tblaccount WHERE user_id = $1 ORDER BY id DESC LIMIT 4",
        values : [userId]
    })
    const lastAccount = lastAccountResult.rows;
    res.status(200).json({
        status : 'success',
        availableBalance,
        totalIncome,
        totalExpense,
        chartData : data,
        lastTransaction,
        lastAccount
    })
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
