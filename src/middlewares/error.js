import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Global Error Handling Middleware
export const errorHandler = (err, req, res, next) => {
  console.error("🔥 Error caught by middleware:", err);

  // If it's already an ApiError, we trust its structure
  if (err instanceof ApiError) {
    return res
      .status(err.statusCode || 500)
      .json(new ApiResponse(err.statusCode || 500, null, err.message));
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res
      .status(400)
      .json(new ApiResponse(400, null, messages.join(", ")));
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue);
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          `Duplicate field value: ${field}. Please use another value.`
        )
      );
  }

  // Handle CastError (invalid ObjectId)
  if (err.name === "CastError") {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid ID format."));
  }

  // Default fallback for unexpected errors
  return res
    .status(500)
    .json(new ApiResponse(500, null, err.message || "Internal Server Error"));
};
