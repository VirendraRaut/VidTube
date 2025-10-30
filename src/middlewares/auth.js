import jwt from "jsonwebtoken";
import { User } from "../models/user.models";

export const verifyJWT = async (req, _, next) => {
    try {
        const token = req.cookies.accessToken || req.headers("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(400, "Unauthorized access");
        }
        await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        console.log("", error);
        return res.status(500).json({ success: false, message: "" })
    }
}