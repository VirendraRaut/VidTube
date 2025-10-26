import mongoose, { Schema } from "mongoose";

const userSchema = mongoose.Schema({
    username: { type: String, required: true, lowercase: true, unique: true, trim: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    avatar: { type: String },
    coverImage: { type: String },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    refreshToken: {
        type: String,
    }
}, {
    timestamps: true,
})

userSchema.pre("save", async function (next) {
    
    next()
})

export const User = mongoose.model("User", userSchema)