import mongoose, { Schema } from "mongoose";

const commentSchema = new mongoose.Schema({
    conent: {
        type: String, ref: 'Video', required: true
    },
    video: {
        type: Schema.Types.ObjectId, ref: 'Video'
    },
    owner: {
        type: Schema.Types.ObjectId, ref: 'User'
    },
}, { timestamps: true })

export const Comment = mongoose.model("Comment", commentSchema)