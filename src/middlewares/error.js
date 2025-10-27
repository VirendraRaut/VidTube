import { ApiError } from "../utils/apiError.js";

export const errorHandler = (err, req, res, next) => {
    console.error("🔥 Error caught by middleware:", err);

    // If it's already an ApiError, we trust its structure
    if (err instanceof ApiError) {
        return res
            .status(err.statusCode || 500)
            .json(new ApiResponse(err.statusCode || 500, null, err.message));
    }
}