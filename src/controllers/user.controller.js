import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

const userRegister = asyncHandler(async (req, res) => {
    try {
        const { fullName, email, username, password, } = req.body;

        // validation
        if (!fullName || !email || !username || password) {
            throw new ApiError(400, "All fields are mandatory")
        }

        const user = await User.findOne({ email });
        if(user){
            throw new ApiError(400, "User exists already")
        }
    } catch (error) {
        throw new ApiError(400, "Failed to register user")
    }
})

export { userRegister }