import TryCatch from "../middlewares/TryCatch.js";
import { Quiz } from "../models/Quiz.js";
import { Progress } from "../models/Progress.js";
import { User } from "../models/User.js";

// Create or update quiz (Admin only)
export const createOrUpdateQuiz = TryCatch(async (req, res) => {
  const { questions } = req.body;
  const courseId = req.params.id;

  let quiz = await Quiz.findOne({ course: courseId });

  if (quiz) {
    quiz.questions = questions;
    await quiz.save();
  } else {
    quiz = await Quiz.create({
      course: courseId,
      questions,
    });
  }

  res.status(200).json({
    message: "Quiz saved successfully",
    quiz,
  });
});

// Get quiz for a course
export const getQuiz = TryCatch(async (req, res) => {
  const courseId = req.params.id;
  const user = await User.findById(req.user._id);

  if (!user.subscription.includes(courseId) && user.role !== "admin") {
    return res.status(400).json({
      message: "You are not enrolled in this course",
    });
  }

  const quiz = await Quiz.findOne({ course: courseId });

  if (!quiz) {
    return res.json({
      questions: [],
    });
  }

  // If student, do not send the correctAnswer indices to prevent cheating
  if (user.role !== "admin") {
    const sanitizedQuestions = quiz.questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
    }));

    return res.json({
      _id: quiz._id,
      course: quiz.course,
      questions: sanitizedQuestions,
    });
  }

  // Admin gets full questions including correctAnswer indices
  res.json(quiz);
});

// Submit quiz answers and check result
export const submitQuiz = TryCatch(async (req, res) => {
  const courseId = req.params.id;
  const { answers } = req.body; // Array of { questionId, selectedOption }

  const quiz = await Quiz.findOne({ course: courseId });

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return res.status(400).json({
      message: "No quiz found for this course",
    });
  }

  let correctCount = 0;
  const totalQuestions = quiz.questions.length;

  quiz.questions.forEach((question) => {
    // Find matching answer submitted by user
    const submittedAnswer = answers.find(
      (ans) => ans.questionId === question._id.toString()
    );

    if (
      submittedAnswer &&
      Number(submittedAnswer.selectedOption) === question.correctAnswer
    ) {
      correctCount++;
    }
  });

  const percentageScore = Math.round((correctCount / totalQuestions) * 100);
  const passed = percentageScore >= 70; // 70% passing threshold

  let progress = await Progress.findOne({
    user: req.user._id,
    course: courseId,
  });

  if (!progress) {
    progress = await Progress.create({
      user: req.user._id,
      course: courseId,
      completedLectures: [],
    });
  }

  if (passed) {
    progress.quizPassed = true;
    await progress.save();
  }

  res.status(200).json({
    success: true,
    score: percentageScore,
    passed,
    correctCount,
    totalQuestions,
    message: passed
      ? "Congratulations! You passed the quiz."
      : `You scored ${percentageScore}%. You need at least 70% to pass. Please try again.`,
  });
});
