import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    username: { type: String, required: true, lowercase: true, unique: true, trim: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, trim: true },
    pasword: { type: String, required: true, trim: true },
    avatar: {type : String}
})

export const User = mongoose.model("User", userSchema)