import express from "express"
import pool from "../libs/dabatase.js";
import { comparePassword, hashPassword } from "../libs/index.js";
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

export const changePassword = async (req, res) => {
    try {
        const {userId } = req.body.user;
        const { currentPassword , newPassword , confirmPassword } = req.body;
        const userExist = await pool.query({
            text : "SELECT * FROM tbluser WHERE id = $1",
            values : [userId]
        })
        const user = userExist.rows[0];
        if(!user) {
          return res.status(404).json({
                status : 'failed',
                message : "user doesn't exist"
            })
        }
        if(newPassword !== confirmPassword) {
            return res.status(404).json({
                status : 'failed',
                message : "Password mismatch"
            })
        }
        const isMatch = await comparePassword(currentPassword, user?.password )
        if(!isMatch) {
            return res.status(404).json({
                status : 'failed',
                message : "Password mismatch"
            })
        }
        const hashedPassword = await hashPassword(newPassword);
        await pool.query({
            text : "UPDATE tbluser SET password = $1 WHERE id = $2",
            values : [hashedPassword, userId]
        })
        res.status(200).json({
            status : "Success",
            message : "Password changed successfully"
        })
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