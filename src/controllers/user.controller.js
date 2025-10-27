import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import uploadOnCloudinary from "../utils/cloudinary";

const userRegister = asyncHandler(async (req, res) => {
    try {
        const { fullName, email, username, password, } = req.body;

        // validation
        if (!fullName || !email || !username || password) {
            throw new ApiError(400, "All fields are mandatory")
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            throw new ApiError(400, "User exists with already email or username")
        }

        const avatarLocalPath = req.files?.avatar[0]?.path;
        const coverLocalPath = req.files?.coverImage[0]?.path;

        uploadOnCloudinary
    } catch (error) {
        throw new ApiError(400, "Failed to register user")
    }
})

export { userRegister }