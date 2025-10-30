import jwt from "jsonwebtoken";
import { User } from "../models/user.models";

export const verifyJWT = async (req, _, next) => {
    try {
        const token = await req.cookies.accessToken || req.body;
    } catch (error) {
        console.log("", error);
        return res.status(500).json({ success: false, message: "" })
    }
}