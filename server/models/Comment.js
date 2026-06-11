import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    commentText: {
      type: String,
      required: true,
    },
    videoTimestamp: {
      type: Number, // Seconds into the video
      default: 0,
    },
    replies: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        replyText: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Comment = mongoose.model("Comment", schema);
