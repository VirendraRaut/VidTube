import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";
import healthCheckRouter from "./src/routes/healthCheck.route.js";
import userRouter from "./src/routes/user.routes.js"
import { errorHandler } from "./src/middlewares/error.js";

const app = express();

// common middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(cookieParser())

app.use(express.json({ limit: '16kb' }))

app.use(express.urlencoded({ extended: true, limit: '16kb' }));

app.use(express.static("public"))

app.use(errorHandler())

// routes
app.use("/api/v1/health-check", healthCheckRouter)
app.use("/api/v1/users", userRouter)

export { app };