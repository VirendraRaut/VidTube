import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = asyncHandler((req, res, next)=>{
    return res.status(200).json(ApiResponse(200, "Health-check is fine..."))
})