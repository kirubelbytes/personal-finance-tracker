import cors from "cors"
import express from "express"
import dotenv from "dotenv"
dotenv.config();
import router from "./routes/index.js"

const app = express();
const PORT = process.env.PORT;

app.use(cors('*'))
app.use(express.json({limit : '10mb'}));
app.use(express.urlencoded({extended : true}));

app.use("/api-v1", router)

// app.use('*', (req, res) => {
//     res.status(404).json({
//         status : "404 Not Found",
//         message : "Not Found"
//     })
// })

app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`);
});