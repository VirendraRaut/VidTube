import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const userRegister = asyncHandler(async (req, res) => {

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

    try {
        const user = await User.create({ fullName, email, username: username.toLowerCase(), password, avatar: avatar?.url || "", coverImage: coverImage?.url || "" })

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if (!createdUser) {
            throw new ApiError(400, "Failed to register user")
        }

        return res
            .status(201)
            .json(new ApiResponse(201, createdUser, "User registered successfully"));
    } catch (error) {
        // ⚠️ Clean up uploaded images if user creation fails
        if (avatar?.public_id) await deleteFromCloudinary(avatar.public_id);
        if (coverImage?.public_id) await deleteFromCloudinary(coverImage.public_id);

        console.log("❌ Failed to register user:", error.message);
        throw new ApiError(500, "Failed to register user");

    }

})

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToen = user.generateRefreshToken();

        user.refreshToen = refreshToen;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToen }
    } catch (error) {
        throw new ApiError(500, "Failed to generate access or refresh token");
    }
}

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "Email and Password is mandatory");
    }
    const user = await User.findOne({ $or: [{ email }] });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // validate password
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid crendentials");
    }

    const { accessToken, refreshToen } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    if (!loggedInUser) {
        throw new ApiError(500, "Something went wrong, please try again laten");
    }
    const options = {
        httpOnly: true, secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(201).cookie("accessToken:", accessToken, options).cookie("refreshToken:", refreshToen, options)
        .json(new ApiResponse(201, loggedInUser, "User loggedIn successfully"));
})

export { userRegister, loginUser }