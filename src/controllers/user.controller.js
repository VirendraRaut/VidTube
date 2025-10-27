import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const userRegister = asyncHandler(async (req, res) => {
    try {
        const { fullName, email, username, password, } = req.body;

        // validation
        if (!fullName || !email || !username || !password) {
            throw new ApiError(400, "All fields are mandatory")
        }

        const existingUser = await User.findOne({ $or: [{ username: username.toLowerCase() }, { email }] });
        if (existingUser) {
            throw new ApiError(400, "User exists with already email or username")
        }

        const avatarLocalPath = req.files?.avatar[0]?.path;
        const coverLocalPath = req.files?.coverImage[0]?.path;

        let avatar = null;
        let coverImage = null;


        if (avatarLocalPath) {
            avatar = await uploadOnCloudinary(avatarLocalPath);
        }
        if (coverLocalPath) {
            coverImage = await uploadOnCloudinary(coverLocalPath);
        }

        const user = await User.create({ fullName, email, username: username.toLowerCase(), password, avatar: avatar?.url || "", coverImage: coverImage?.url || "" })

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if (!createdUser) {
            throw new ApiError(400, "Failed to register user")
        }

        return res
            .status(201)
            .json(new ApiResponse(201, createdUser, "User registered successfully"));

    } catch (error) {
        throw new ApiError(400, "Failed to register user", error)
    }
})

export { userRegister }