import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courses",
    },
    completedLectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
      },
    ],
    quizPassed: {
      type: Boolean,
      default: false,
    },
    lastWatchedLecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
    },
    lecturePlaytimes: [
      {
        lecture: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Lecture",
        },
        time: {
          type: Number,
          default: 0,
        }
      }
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Progress = mongoose.model("Progress", schema);