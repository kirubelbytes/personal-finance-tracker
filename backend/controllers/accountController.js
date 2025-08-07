import express from "express";
import pool from "../libs/dabatase.js";

export const getAccounts = async(req, res) => {
    try {
        const {userId } = req.body.user;
        const accounts = await pool.query({
            text : "SELECT * FROM tblaccount WHERE user_id = $1",
            values : [userId]
        });
        res.status(200).json({
            status : "Account found",
            user : accounts.rows
        })
    } catch (error) {
        console.log(error);
        res.status(404).json({
            status : "failed",
            message : error.message
        })
        
    }
}


export const createAccount = async(req, res) => {
 try {
    const { userId } = req.body.user;
    const {name, amount, account_number} = req.body;
    const accountExistQuery = {
        text : "SELECT * FROM tblaccount WHERE account_name = $1 AND user_id = $2",
        values: [name , userId]
    }
    const accountExistResult = await pool.query(accountExistQuery);
    const accountExist = accountExistResult.rows[0];
    if(accountExist) {
        return res.status(404).json({
            status : 'failed',
            message : "Account with this name already exists for this user"
        })
    }
    const createAccountResult = await pool.query({
        text : "INSERT INTO tblaccount(user_id, account_name, account_number, account_balance) VALUES ($1, $2, $3, $4) RETURNING *",
        values : [userId , name , account_number, amount]
    });
    const account = createAccountResult.rows[0];

    const userAccounts = Array.isArray(name) ? name : [name]
    const updateUserAccoutQuery =  {
        text : "UPDATE tbluser SET accounts = array_cat(accounts, $1), updatedAt = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
        values : [userAccounts,userId]
    }
    await pool.query(updateUserAccoutQuery);

    // Add initial transaction 
    const description = account.account_name + " Initial deposit";
    const initialDepositQuery =  {
        text : "INSERT INTO tbltransaction (user_id , description, type, status, amount, source) VALUES ($1, $2, $3, $4, $5 , $6) RETURNING *",
        values : [
            userId,
            description,
            "income",
            "completed",
            amount,
            account.account_name
        ]
    }
    await pool.query(initialDepositQuery);

    res.status(200).json({
        status : "Success",
        message : account.account_name + "Account Created Successully", 
        user : createAccountResult.rows
    })
 } catch (error) {
    console.log(error);
    res.status(404).json({
        status : "failed",
        message : error.message
    })
 }
}


