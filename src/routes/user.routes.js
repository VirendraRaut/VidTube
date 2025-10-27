import express from "express"
import userRegister from "../controllers/user.controller.js"
import uploadOnCloudinary from "../utils/cloudinary.js";
import { upload } from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.post(userRegister)