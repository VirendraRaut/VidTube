import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Utility function to upload an image
export const uploadOnCloudinary = async (LocalFilePath) => {
    try {
        if (!LocalFilePath) return null;

        const result = await cloudinary.uploader.upload(LocalFilePath, {
            resource_type: "auto",
        });
        console.log("File uploaded successfully on cloudinary, src:", result.url)
        fs.unlinkSync(LocalFilePath)
        return result; // result.url will have the uploaded image URL
    } catch (error) {
        fs.unlinkSync(LocalFilePath)
        console.error("Cloudinary upload error:", error);
        return null;
    }
};

export default uploadOnCloudinary;
