import express from "express"
import pool from "../libs/dabatase.js";

export const getTransaction = async(req, res) => {
    try {
        const today = new Date();
        const _sevenDaysAgo = new Date(today);
        _sevenDaysAgo.setDate(today.getDate() - 7);
        const sevenDaysAgo = _sevenDaysAgo.toISOString().split("T")[0];
        const {df , dt, s} = req.query;
        const userId  = req.body.userId;
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
        
} catch (error) {
     console.log(error);
     res.status(404).json({
        status : "failed",
        message : error.message
    })
    }
}

export const transferMoneyToAccount = async(req, res) => {
 try {
        
 } catch (error) {
     console.log(error);
     res.status(404).json({
        status : "failed",
        message : error.message
     })
        
    }
}