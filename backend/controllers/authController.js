import { comparePassword, createJWT, hashPassword } from "../libs/index.js";
import pool from "../libs/dabatase.js"
export const signUpUser = async(req, res) => {
  try {
    const {firstName , email, password } = req.body;
    // use && instead of ||
    if(!firstName || !email || !password ) {
        res.status(404).json({
            status: "faild",
            message : 'provide required fileds'
        })
    }
    const userExist = await pool.query({
        text : "SELECT * FROM tbluser WHERE email = $1",
        values : [email]
    })
    if(userExist.rows.length > 0) {
        res.status(409).json({
            status : 'failed',
            message : "Email already exist.Try login."
        })
    }

    const hashedPassword = await hashPassword(password);
    const user = await pool.query({
        text : "INSERT INTO tbluser (firstname , email , password) VALUES ($1, $2, $3) RETURNING *",
        values : [firstName, email , hashedPassword]
    });
    user.rows[0].password = undefined;
    /*
        🔍 What it does:
        This line removes the password from the user object before sending it to the client.
        💡 Why?
        Even though the password is hashed, you should never expose it in an API response. This is a security best practice.
        🧠 Explanation:
        After this line runs, user.rows[0] will still contain all other fields like id, firstname, email, etc.
        But password will be set to undefined, so it won't be included in the JSON response.
    */
    res.status(201).json({
        status : 'success',
        message : 'User account created succesfully.',
        user : user.rows[0] // ther is Explanetion for this code
    })
    /*
        🔍 What it does:
        This line sends the created user’s information (except the password) back to the frontend as part of the response.
    */

  } catch (error) {
    console.log(error);
    res.status(500).json({
        status : "Failed",
        message : error.message
    })
  }
}

export const signInUser = async(req, res) => {
  try {
    const {email , password } = req.body;
    const result = await pool.query({
        text : "SELECT * FROM tbluser WHERE email = $1",
        values : [email]
    })
    const user = result.rows[0];
    if(!user) {
        res.status(404).json({
            status : 'failed',
            message : 'Invalid email or password'
        });
    };
    const isMatch = await comparePassword(password, user.password)
    if(!isMatch) {
        res.status(404).json({
            status : 'failed',
            message : 'Invalid email or Password'
        })
    };
    const token = createJWT(user.id);
    user.password = undefined;
    res.status(200).json({
        status : "success",
        message : "You logged in successfully",
        user,
        token
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
        status : "Failed",
        message : error.message
    })
  }
}
