import TryCatch from "../middlewares/TryCatch.js";
import { Review } from "../models/Review.js";
import { User } from "../models/User.js";
import { Courses } from "../models/Courses.js";

// Add or update review for a course
export const addReview = TryCatch(async (req, res) => {
  const courseId = req.params.id;
  const { rating, reviewText } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      message: "Rating must be between 1 and 5",
    });
  }

  if (!reviewText || reviewText.trim() === "") {
    return res.status(400).json({
      message: "Review comment text is required",
    });
  }

  const user = await User.findById(req.user._id);

  if (!user.subscription.includes(courseId)) {
    return res.status(400).json({
      message: "You must be enrolled in this course to leave a review",
    });
  }

  let review = await Review.findOne({ course: courseId, user: req.user._id });

  if (review) {
    review.rating = rating;
    review.reviewText = reviewText;
    await review.save();
  } else {
    review = await Review.create({
      course: courseId,
      user: req.user._id,
      rating,
      reviewText,
    });
  }

  // Update Course rating average
  const allReviews = await Review.find({ course: courseId });
  const totalRatingSum = allReviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = parseFloat((totalRatingSum / allReviews.length).toFixed(1));

  await Courses.findByIdAndUpdate(courseId, { rating: avgRating });

  res.status(200).json({
    message: "Review submitted successfully",
    review,
    averageRating: avgRating,
  });
});

// Get reviews for a course
export const getCourseReviews = TryCatch(async (req, res) => {
  const courseId = req.params.id;

  const reviews = await Review.find({ course: courseId })
    .populate("user", "name profilePic")
    .sort({ createdAt: -1 });

  const totalReviews = reviews.length;
  const totalRatingSum = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalReviews > 0 ? parseFloat((totalRatingSum / totalReviews).toFixed(1)) : 0;

  res.status(200).json({
    reviews,
    averageRating,
    totalReviews,
  });
});
