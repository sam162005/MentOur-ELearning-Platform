import express from 'express';
import { isAdmin, isAuth } from '../middlewares/isAuth.js';
import { addLectures, createCourse, deleteCourse, deleteLecture, getAllStats, getAllUser, updateRole } from '../controllers/admin.js';
import { createOrUpdateQuiz } from '../controllers/quiz.js';
import { uploadFiles } from '../middlewares/multer.js';
import { createAnnouncement } from '../controllers/announcement.js';

const router = express.Router();

router.post('/course/new',isAuth,isAdmin,uploadFiles, createCourse);
router.post("/course/:id",isAuth,isAdmin,uploadFiles,addLectures);
router.post("/quiz/:id", isAuth, isAdmin, createOrUpdateQuiz);
router.post("/course/:id/announcement", isAuth, isAdmin, createAnnouncement);
router.delete("/course/:id",isAuth,isAdmin,deleteCourse);
router.delete("/lecture/:id",isAuth,isAdmin,deleteLecture);
router.get('/stats',isAuth,isAdmin,getAllStats);
router.put("/user/:id", isAuth, updateRole);
router.get("/users", isAuth, isAdmin, getAllUser);


export default router;