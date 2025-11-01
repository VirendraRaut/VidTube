import express from "express"
import { changeCurrentPassword, getCurrentUser, loginUser, logout, refreshAccessToken, updateAccountDetails, updateAvatar, updateCoverImage, userRegister } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.js";

const userRouter = express.Router();

// unsecure routes
userRouter.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  userRegister
);
userRouter.post("/login", loginUser);
userRouter.post("/refresh-token", refreshAccessToken);

// secured routes
userRouter.post("/logout", verifyJWT, logout);
userRouter.post("/curret-password", verifyJWT, changeCurrentPassword);
userRouter.get("/curret", verifyJWT, getCurrentUser);
userRouter.post("/update-account", verifyJWT, updateAccountDetails);
userRouter.post("/change-avatar", verifyJWT, updateAvatar);
userRouter.post("/change-coverImae", verifyJWT, updateCoverImage);

export default userRouter;