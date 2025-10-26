import mongoose, { Schema } from "mongoose";

const videoSchema = new mongoose.Schema({
    videoFile: {
        type: String, required: true
    },
    thumbnail: {
        type: String, required: true
    },
    title: {
        type: String
    },
    description: {
        type: String, required: true
    },
    views: {
        type: Number, default: 0
    },
    duration: {
        type: Number
    },
    isPublish: {
        type: Number, default: true
    },
    ownser: {
        type: Schema.Types.ObjectId, ref: "User"
    },
}, { timeseries: true })

export const Video = mongoose.model('Video', videoSchema)