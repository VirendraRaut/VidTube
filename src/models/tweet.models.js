import mongoose, { Schema } from "mongoose";

const tweetschema = new mongoose.Schema({
    content: {
        type: String, ref: 'User'
    },
    owner: {
        type: Schema.Types.ObjectId, required: true
    },
}, { timestamps: true })

export const Tweet = mongoose.model("Tweet", tweetschema)