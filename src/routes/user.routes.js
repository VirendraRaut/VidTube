import express from "express"
import { loginUser, logout, userRegister } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  userRegister
);

userRouter.post("/login", loginUser);
userRouter.post("/logout", logout);

export default userRouter;