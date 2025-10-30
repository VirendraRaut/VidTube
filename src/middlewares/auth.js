import jwt from "jsonwebtoken";
import { User } from "../models/user.models";

export const verifyJWT = async (req, _, next) => {
    try {
        const token = req.cookies.accessToken || req.headers("Authorization")?.replace("Bearer ", "");
        if (!token) {
            console.log(400, "Unauthorized access");
            return res.status(400).json({ success: false, message: "Unauthorized access" });
        }
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findbyId(decodedToken?._id).select("-password -refreshToken");
        if (!user) {
            return res.status(400).json({ success: false, message: "Unauthorized access" });
        }
        req.user = user;
        next()
    } catch (error) {
        console.log("", error);
        return res.status(500).json({ success: false, message: "Failed to verift jwt" })
    }
}