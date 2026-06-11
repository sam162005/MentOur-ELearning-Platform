import TryCatch from "../middlewares/TryCatch.js";
import { Comment } from "../models/Comment.js";
import { User } from "../models/User.js";

// Add a question / comment to a lecture
export const addComment = TryCatch(async (req, res) => {
  const lectureId = req.params.id;
  const { commentText, videoTimestamp } = req.body;

  if (!commentText || commentText.trim() === "") {
    return res.status(400).json({
      message: "Comment text cannot be empty",
    });
  }

  const comment = await Comment.create({
    lecture: lectureId,
    user: req.user._id,
    commentText,
    videoTimestamp: videoTimestamp ? Math.floor(Number(videoTimestamp)) : 0,
  });

  const populatedComment = await Comment.findById(comment._id)
    .populate("user", "name profilePic")
    .populate("replies.user", "name profilePic");

  res.status(201).json({
    message: "Question posted successfully",
    comment: populatedComment,
  });
});

// Get all Q&A comments for a lecture
export const getLectureComments = TryCatch(async (req, res) => {
  const lectureId = req.params.id;

  const comments = await Comment.find({ lecture: lectureId })
    .populate("user", "name profilePic")
    .populate("replies.user", "name profilePic")
    .sort({ videoTimestamp: 1, createdAt: 1 });

  res.status(200).json({
    comments,
  });
});

// Reply to a question thread
export const addReply = TryCatch(async (req, res) => {
  const commentId = req.params.id;
  const { replyText } = req.body;

  if (!replyText || replyText.trim() === "") {
    return res.status(400).json({
      message: "Reply text cannot be empty",
    });
  }

  const user = await User.findById(req.user._id);
  const comment = await Comment.findById(commentId);

  if (!comment) {
    return res.status(404).json({
      message: "Comment not found",
    });
  }

  comment.replies.push({
    user: req.user._id,
    name: user.name,
    replyText,
  });

  await comment.save();

  const populatedComment = await Comment.findById(commentId)
    .populate("user", "name profilePic")
    .populate("replies.user", "name profilePic");

  res.status(200).json({
    message: "Reply added successfully",
    comment: populatedComment,
  });
});
