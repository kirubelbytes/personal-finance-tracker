import JWT from "jsonwebtoken"
const authMiddlewire = async(req, res, next) => {
    const authHeader = req?.headers?.authorization;
    if(!authHeader || !authHeader?.startsWith("Bearer")) {
        return res
                .status(401)
                .json({ status : "Unauthorised", message : "Authentication failed" })
    }
    const token = authHeader?.split(" ")[1]

    try {
        const userToken = JWT.verify(token, process.env.JWT_SECRET);
        req.body.user = {
            userId : userToken.userId
        }
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({status : "Unauthorised", message : "Authentication failed"})
    }
}

export default authMiddlewire;