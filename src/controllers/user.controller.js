import jwt from "jsonwebtoken"
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

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(400, "Refresh Token is required");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }
        const options = {
            httpOnly: true, secure: process.env.NODE_ENV === "production"
        }
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        return res
            .status(201).cookie("accessToken:", accessToken, options).cookie("refreshToken:", refreshToen, options)
            .json(new ApiResponse(201, { accessToken, refreshToken: newRefreshToken }, "Access and Refresh Token generated successfully"));
    } catch (error) {
        throw new ApiError(500, "Something went wrong");
    }
})

const logout = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } }, { new: true });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const options = {
        httpOnly: true, secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(201).cookie("accessToken", options).cookie("refreshToken", options)
        .json(new ApiResponse(201, "User loggedOut successfully"));
})

const changeCurrentPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const isPasswordCorrect = user.isPasswordCorrect(oldPassword);
        if (!isPasswordCorrect) {
            throw new ApiError(400, "Invalid password");
        }
        user.password = newPassword;
        await user.save({ validateBeforeSave: false })

        return res.status(200).json({ success: true, message: "Password changed successfully" })
    } catch (error) {
        console.log("Error in change current password", error);
        return res.status(500).json({ success: false, message: "Failed to changed password" })
    }
}
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        return res.status(200).json({ success: true, message: "Current User", user })
    } catch (error) {
        console.log(400, "Error in get current user");
        return res.status(400).json({ success: false, message: "Failed to get current user" });

    }
}

const updateAccountDetails = async (req, res) => {
    try {
        const { email, username } = req.body;
        if (!email || !username) {
            console.log(400, "Email and Username is required");
            return res.status(400).json({ success: false, message: "Email and Username is required" });
        }

        const user = await User.findByIdAndUpdate(req.user._id, { $set: { fullName, email: email, } }, { new: true }).select("-password, refreshToken")

        return res.status(200).json({ success: true, message: "User updated successfully", user })
    } catch (error) {
        console.log(400, "Error in update account details");
        return res.status(400).json({ success: false, message: "Failed to update account details" });
    }

}

const updateAvatar = async (req, res) => {
    try {
        const { avatarLocalPath } = req.file?.path;
        if (!avatarLocalPath) {
            console.log(400, "Select image first");
            return res.status(400).json({ success: false, message: "Select image first" });
        }
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (avatar?.url) {
            console.log(400, "Something went wrong");
            return res.status(400).json({ success: false, message: "Something went wrong" });
        }

        const user = await User.findByIdAndUpdate(req.user._id, { $set: { avatar: avatar.url } }, { new: true }).select("-password, refreshToken")

        return res.status(200).json({ success: true, message: "Avatar updated successfully", user })
    } catch (error) {
        console.log(400, "Error in update avatar");
        return res.status(400).json({ success: false, message: "Failed to update avatar" });
    }
}


const updateCoverImage = async (req, res) => {
    try {
        const { coverImageLocalPath } = req.file?.path;
        if (!coverImageLocalPath) {
            console.log(400, "Select image first");
            return res.status(400).json({ success: false, message: "Select image first" });
        }
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);
        if (coverImage?.url) {
            console.log(400, "Something went wrong");
            return res.status(400).json({ success: false, message: "Something went wrong" });
        }

        const user = await User.findByIdAndUpdate(req.user._id, { $set: { coverImage: coverImage.url } }, { new: true }).select("-password, refreshToken")

        return res.status(200).json({ success: true, message: "Cover image updated successfully", user })
    } catch (error) {
        console.log(400, "Error in update avatar");
        return res.status(400).json({ success: false, message: "Failed to update cover image" });
    }
}

const userChannelProfile = async (req, res) => {
    try {
        const { username } = req.params;
        if (!username) {
            throw new ApiError(404, "User not found");
        }
        const channel = await User.aggregate([
            { $match: { username: username.toLowerCase() } },
            {
                $lookup: {
                    from: "subscribptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
                }
            },
            {
                $addFields: {
                    subscribersCount: { $size: "$subscribers" },
                    subscribedToCount: { $size: "$subscribedTo" }
                }
            }
        ]);


    } catch (error) {
        console.log(400, "Error in user channel profile");
        return res.status(400).json({ success: false, message: "Failed to get user channel profile" });
    }
}


export { userRegister, loginUser, refreshAccessToken, logout, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateAvatar, updateCoverImage, userChannelProfile }