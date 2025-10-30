import express from "express"
import { loggedInUser, userRegister } from "../controllers/user.controller.js"
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

userRouter.post("/login", loggedInUser);

export default userRouter;