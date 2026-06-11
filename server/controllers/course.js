import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { User } from "../models/User.js";
import { instance } from "../index.js";
import crypto from "crypto";
import { Payment } from "../models/Payment.js";
import { Progress } from "../models/Progress.js";
import { Quiz } from "../models/Quiz.js";
export const getAllCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find();
  res.json({
    courses,
  });
});

export const getSingleCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  res.json({
    course,
  });
});

export const fetchLectures = TryCatch(async (req, res) => {
    const lectures = await Lecture.find({ course: req.params.id });
  
    const user = await User.findById(req.user._id);
  
    if (user.role === "admin") {
      return res.json({ lectures });
    }
  
    if (!user.subscription.includes(req.params.id))
      return res.status(400).json({
        message: "You have not subscribed to this course",
      });
  
    res.json({ lectures });
  });

  export const fetchLecture = TryCatch(async (req, res) => {
    const lecture = await Lecture.findById(req.params.id);
  
    const user = await User.findById(req.user._id);
  
    if (user.role === "admin") {
      return res.json({ lecture });
    }
  
    if (!user.subscription.includes(lecture.course))
      return res.status(400).json({
        message: "You have not subscribed to this course",
      });

    await Progress.findOneAndUpdate(
      { user: req.user._id, course: lecture.course },
      { lastWatchedLecture: lecture._id },
      { upsert: false }
    );
  
    res.json({ lecture });
  });

  export const getMyCourses = TryCatch(async (req, res) => {
    const courses = await Courses.find({ _id: req.user.subscription });
  
    res.json({
      courses,
    });
  });

  export const checkout = TryCatch(async (req, res) => {
    const user = await User.findById(req.user._id);
  
    const course = await Courses.findById(req.params.id);
  
    if (user.subscription.includes(course._id)) {
      return res.status(400).json({
        message: "You already have this course",
      });
    }
  
    const options = {
      amount: Number(course.price * 100),
      currency: "INR",
    };
  
    const order = await instance.orders.create(options);
  
    res.status(201).json({
      order,
      course,
    });
  });

  export const paymentVerification = TryCatch(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

      
  
    const body = razorpay_order_id + "|" + razorpay_payment_id;
  
    const expectedSignature = crypto
      .createHmac("sha256", process.env.Razorpay_Secret)
      .update(body)
      .digest("hex");

      
  
    const isAuthentic = expectedSignature === razorpay_signature;
    
  
    if (isAuthentic) {
      await Payment.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
  
      const user = await User.findById(req.user._id);
  
      const course = await Courses.findById(req.params.id);
  
      user.subscription.push(course._id);
  
      await Progress.create({
        course: course._id,
        completedLectures: [],
        user: req.user._id,
      });
  
      await user.save();
  
      res.status(200).json({
        message: "Course Purchased Successfully",
      });
    } else {
      return res.status(400).json({
        message: "Payment Failed",
      });
    }
  });

  export const rateCourse = TryCatch(async (req, res) => {
  const { rating } = req.body;  // Rating from the user (1-5)

  if (rating < 1 || rating > 5) {
    return res.status(400).json({
      message: "Rating must be between 1 and 5.",
    });
  }

  const course = await Courses.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      message: "Course not found.",
    });
  }

  const user = await User.findById(req.user._id);

  // Check if the user is already subscribed to the course
  if (!user.subscription.includes(course._id)) {
    return res.status(400).json({
      message: "You must subscribe to the course to rate it.",
    });
  }

  // Check if the user has already rated the course
  const existingRating = await Progress.findOne({ user: req.user._id, course: course._id });

  if (existingRating) {
    return res.status(400).json({
      message: "You have already rated this course.",
    });
  }

  // Add the rating to the Progress model
  await Progress.create({
    user: req.user._id,
    course: course._id,
    rating: rating,
  });

  // Update the course's rating
  const ratings = await Progress.aggregate([
    { $match: { course: course._id } },
    { $group: { _id: "$course", avgRating: { $avg: "$rating" } } }
  ]);

  if (ratings.length > 0) {
    const avgRating = ratings[0].avgRating;

    // Update the course rating in the Courses model
    course.rating = avgRating;
    await course.save();
  }

  res.status(200).json({
    message: "Course rated successfully.",
    rating: course.rating,  // Send back the updated rating
  });
});

export const addProgress = TryCatch(async (req, res) => {
  const progress = await Progress.findOne({
    user: req.user._id,
    course: req.query.course,
  });

  const { lectureId } = req.query;

  if (progress.completedLectures.includes(lectureId)) {
    return res.json({
      message: "Progress recorded",
    });
  }

  progress.completedLectures.push(lectureId);

  await progress.save();

  res.status(201).json({
    message: "new Progress added",
  });
});

export const getYourProgress = TryCatch(async (req, res) => {
  const progress = await Progress.find({
    user: req.user._id,
    course: req.query.course,
  });

  if (!progress) return res.status(404).json({ message: "null" });

  const allLectures = (await Lecture.find({ course: req.query.course })).length;

  const completedLectures = progress[0].completedLectures.length;

  const courseProgressPercentage = (completedLectures * 100) / allLectures;

  res.json({
    courseProgressPercentage,
    completedLectures,
    allLectures,
    progress,
  });
});

export const getStudentDashboardSummary = TryCatch(async (req, res) => {
  const progressList = await Progress.find({ user: req.user._id })
    .populate("course")
    .populate("lastWatchedLecture");

  let totalCompletedLectures = 0;
  let quizzesPassed = 0;
  let certificatesEarned = 0;
  
  const enrolledCoursesProgress = [];
  const recentlyWatched = [];

  for (const prog of progressList) {
    if (!prog.course) continue;

    const totalLectures = await Lecture.countDocuments({ course: prog.course._id });
    const completedLecturesCount = prog.completedLectures.length;
    totalCompletedLectures += completedLecturesCount;

    const progressPercentage = totalLectures > 0 
      ? Math.round((completedLecturesCount * 100) / totalLectures) 
      : 0;

    const quizExists = await Quiz.exists({ course: prog.course._id });

    let isCertified = false;
    if (completedLecturesCount === totalLectures && totalLectures > 0) {
      if (quizExists) {
        isCertified = prog.quizPassed;
      } else {
        isCertified = true;
      }
    }

    if (prog.quizPassed) {
      quizzesPassed++;
    }

    if (isCertified) {
      certificatesEarned++;
    }

    enrolledCoursesProgress.push({
      courseId: prog.course._id,
      title: prog.course.title,
      image: prog.course.image,
      progressPercentage,
      completedCount: completedLecturesCount,
      totalCount: totalLectures,
      quizPassed: prog.quizPassed,
      quizExists,
      isCertified,
    });

    if (prog.lastWatchedLecture) {
      recentlyWatched.push({
        courseId: prog.course._id,
        courseTitle: prog.course.title,
        lectureId: prog.lastWatchedLecture._id,
        lectureTitle: prog.lastWatchedLecture.title,
        updatedAt: prog.updatedAt,
      });
    }
  }

  const hoursWatched = parseFloat((totalCompletedLectures * 0.4).toFixed(1));

  recentlyWatched.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  res.json({
    stats: {
      hoursWatched,
      quizzesPassed,
      certificatesEarned,
    },
    enrolledCoursesProgress,
    recentlyWatched: recentlyWatched.slice(0, 5),
  });
});

export const updatePlaytime = TryCatch(async (req, res) => {
  const { courseId, lectureId, time } = req.body;

  if (!courseId || !lectureId || time === undefined) {
    return res.status(400).json({
      message: "courseId, lectureId, and time are required",
    });
  }

  const progress = await Progress.findOne({
    user: req.user._id,
    course: courseId,
  });

  if (!progress) {
    return res.status(404).json({
      message: "Progress record not found",
    });
  }

  progress.lastWatchedLecture = lectureId;

  if (!progress.lecturePlaytimes) {
    progress.lecturePlaytimes = [];
  }

  const existingPlaytime = progress.lecturePlaytimes.find(
    (item) => item.lecture.toString() === lectureId.toString()
  );

  if (existingPlaytime) {
    existingPlaytime.time = time;
  } else {
    progress.lecturePlaytimes.push({
      lecture: lectureId,
      time,
    });
  }

  await progress.save();

  res.status(200).json({
    message: "Playtime updated successfully",
    progress,
  });
});