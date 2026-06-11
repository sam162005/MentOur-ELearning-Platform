import express from 'express';
import { getAllCourses, getSingleCourse, fetchLectures, fetchLecture, getMyCourses, checkout, paymentVerification, getStudentDashboardSummary } from '../controllers/course.js';
import { getQuiz, submitQuiz } from '../controllers/quiz.js';
import { addReview, getCourseReviews } from '../controllers/review.js';
import { addComment, getLectureComments, addReply } from '../controllers/comment.js';
import { getCourseAnnouncements, getUserNotifications, markNotificationRead } from '../controllers/announcement.js';
import { isAuth } from '../middlewares/isAuth.js';


const router = express.Router();

router.get("/course/all",getAllCourses);
router.get("/course/:id",getSingleCourse);
router.get("/lectures/:id",isAuth,fetchLectures);
router.get("/lecture/:id",isAuth,fetchLecture);
router.get("/mycourse",isAuth,getMyCourses);
router.post("/course/checkout/:id", isAuth, checkout);
router.post("/verification/:id", isAuth, paymentVerification);
router.get("/quiz/:id", isAuth, getQuiz);
router.post("/quiz/:id/submit", isAuth, submitQuiz);
router.get("/user/dashboard/summary", isAuth, getStudentDashboardSummary);
router.post("/course/:id/review", isAuth, addReview);
router.get("/course/:id/reviews", getCourseReviews);
router.post("/lecture/:id/comment", isAuth, addComment);
router.get("/lecture/:id/comments", isAuth, getLectureComments);
router.post("/comment/:id/reply", isAuth, addReply);
router.get("/course/:id/announcements", isAuth, getCourseAnnouncements);
router.get("/notifications", isAuth, getUserNotifications);
router.put("/notification/:id/read", isAuth, markNotificationRead);




export default router;