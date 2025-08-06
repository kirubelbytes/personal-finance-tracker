import express from "express"
import pool from "../libs/dabatase.js";
export const getUser = async(req, res) => {
    try {
        const { userId } = req.body.user;
        const userExist = await pool.query({
            text : "SELECT * FROM tbluser WHERE id = $1",
            values : [userId]
        });
        const user = userExist.rows[0]
        if(!user) {
            return res.status(404).json({status : "failed", message: "User doesn't exist"})
        }
        user.password = undefined;
        res.status(200).json({
            status : "Success", 
            user 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({status : "failed", message : error.message})
    }
}

export const changePassword = () => {
    try {
        
    } catch (error) {
        console.log(error);
        res.status(500).json({status : "failed", message : error.message})
    }
}

export const updateUser = () => {
    try {
        
    } catch (error) {
        console.log(error);
        res.status(500).json({status : "failed", message: error.message})
        
    }
}