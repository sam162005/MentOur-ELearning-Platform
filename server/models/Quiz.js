import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courses",
      required: true,
      unique: true,
    },
    questions: [
      {
        questionText: {
          type: String,
          required: true,
        },
        options: [
          {
            type: String,
            required: true,
          },
        ],
        correctAnswer: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Quiz = mongoose.model("Quiz", schema);
