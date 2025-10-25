import dotenv from "dotenv"
import { app } from "./app.js";
import connectDB from "./src/db/index.js";

dotenv.config({
    path: './.env'
});

const PORT = process.env.PORT;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on => http://localhost:${PORT}`);
        })
    })
    .catch((err) => { console.log("DB Connection error", err) })

