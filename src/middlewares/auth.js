import jwt from "jsonwebtoken";
import { User } from "../models/user.models";

export const verifyJWT = async (req, _, next) => {
    try {
        const token = req.cookies.accessToken || req.headers("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(400, "Unauthorized access");
        }
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        await User.findbyId(decodedToken?._id).select("-password -refreshToken")
    } catch (error) {
        console.log("", error);
        return res.status(500).json({ success: false, message: "" })
    }
}