import express from 'express';
import { 
    loginUser,
    myProfile,
    register,
    verifyUser,
    updateAvatar
} from "../controllers/user.js";
import { isAuth } from '../middlewares/isAuth.js';
import { addProgress, getYourProgress, updatePlaytime } from '../controllers/course.js';
import { uploadFiles } from '../middlewares/multer.js';

const router = express.Router();

router.post("/user/register",register);
router.post("/user/verify",verifyUser);
router.post("/user/login",loginUser);
router.get("/user/me",isAuth,myProfile);
router.post("/user/avatar", isAuth, uploadFiles, updateAvatar);
router.post("/user/progress", isAuth, addProgress);
router.post("/user/progress/time", isAuth, updatePlaytime);
router.get("/user/progress", isAuth, getYourProgress);

export default router;