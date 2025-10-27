import express from "express"
import userRegister from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.post(upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]), userRegister)

export default userRouter;