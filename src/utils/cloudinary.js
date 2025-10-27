import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import dotenv from "dotenv"

dotenv.config()

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {string} localFilePath - Local path of the file to upload
 * @returns {Promise<{url: string, public_id: string} | null>}
 */
export const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) return null;

    try {
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "vidtube_uploads", // optional: your folder name in Cloudinary
        });

        // Remove local file after successful upload
        await fs.unlink(localFilePath);

        if (process.env.NODE_ENV !== "production") {
            console.log("✅ Uploaded to Cloudinary:", result.secure_url);
        }

        return {
            url: result.secure_url,
            public_id: result.public_id,
        };
    } catch (error) {
        console.error("❌ Cloudinary upload error:", error.message);

        // Try removing local file even if upload fails
        try {
            await fs.unlink(localFilePath);
        } catch { }

        return null;
    }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public_id of the file
 * @returns {Promise<boolean>}
 */
export const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return false;

    try {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result === "ok") {
            if (process.env.NODE_ENV !== "production") {
                console.log("🗑️ Deleted from Cloudinary:", publicId);
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error("❌ Cloudinary delete error:", error.message);
        return false;
    }
};

// Default export for convenience
export default uploadOnCloudinary;
