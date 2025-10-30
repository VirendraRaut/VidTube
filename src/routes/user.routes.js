import express from "express"
import { loginUser, logout, userRegister } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.js";

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
userRouter.post("/logout", verifyJWT, logout);

export default userRouter;