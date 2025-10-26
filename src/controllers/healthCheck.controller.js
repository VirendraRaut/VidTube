import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = asyncHandler((req, res, next) => {
    return res.status(200).json(new ApiResponse(200, "OK", "Health-check is fine..."))
})

export { healthCheck };