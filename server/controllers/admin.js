import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { rm } from "fs";
import { promisify } from "util";
import fs from "fs";
import { User } from "../models/User.js";
import { Progress } from "../models/Progress.js";

export const createCourse = TryCatch(async (req, res) => {
    const { title, description, category, createdBy, duration, price, difficulty } = req.body;
  
    const image = req.file;
  
    await Courses.create({
      title,
      description,
      category,
      createdBy,
      image: image?.path,
      duration,
      price,
      difficulty: difficulty || "Beginner",
    });
  
    res.status(201).json({
      message: "Course Created Successfully",
    });
  });

  export const addLectures = TryCatch(async(req,res)=>{
    const course = await Courses.findById(req.params.id);

    if(!course)
      return res.status(404).json({
      message: "No course with this id",
    });

    const {title,description}=req.body;
    const file = req.file;
    const lecture = await Lecture.create({
      title,
      description,
      video: file?.path,
      course: course._id,
    });
  
    res.status(201).json({
      message: "Lecture Added",
      lecture,
    });
  }) ;

  export const deleteLecture = TryCatch(async (req, res) => {
    const lecture = await Lecture.findById(req.params.id);
  
    rm(lecture.video, () => {
      console.log("Video deleted");
    });
  
    await lecture.deleteOne();
  
    res.json({ message: "Lecture Deleted" });
  });

  const unlinkAsync = promisify(fs.unlink);

  export const deleteCourse = TryCatch(async (req, res) => {
    const course = await Courses.findById(req.params.id);
  
    const lectures = await Lecture.find({ course: course._id });
  
    await Promise.all(
      lectures.map(async (lecture) => {
        await unlinkAsync(lecture.video);
        console.log("video deleted");
      })
    );
  
    rm(course.image, () => {
      console.log("image deleted");
    });
  
    await Lecture.find({ course: req.params.id }).deleteMany();
  
    await course.deleteOne();
  
    await User.updateMany({}, { $pull: { subscription: req.params.id } });
  
    res.json({
      message: "Course Deleted",
    });
  });

  export const getAllStats = TryCatch(async (req, res) => {
    const courses = await Courses.find();
    const totalCoures = courses.length;
    const totalLectures = (await Lecture.find()).length;
    const totalUsers = (await User.find()).length;
  
    const progressList = await Progress.find({})
      .populate("user")
      .populate("course");
  
    let totalEarnings = 0;
  
    const courseEnrollmentMap = {};
    for (const course of courses) {
      courseEnrollmentMap[course._id.toString()] = {
        _id: course._id,
        title: course.title,
        price: course.price,
        studentsCount: 0,
        revenueGenerated: 0,
      };
    }
  
    const activeStudents = [];
  
    for (const prog of progressList) {
      if (!prog.user || !prog.course) continue;
  
      const courseIdStr = prog.course._id.toString();
      if (courseEnrollmentMap[courseIdStr]) {
        courseEnrollmentMap[courseIdStr].studentsCount += 1;
        courseEnrollmentMap[courseIdStr].revenueGenerated += prog.course.price;
        totalEarnings += prog.course.price;
      }
  
      const totalLecturesInCourse = await Lecture.countDocuments({ course: prog.course._id });
      const completedLecturesCount = prog.completedLectures ? prog.completedLectures.length : 0;
      const progressPercentage = totalLecturesInCourse > 0
        ? Math.round((completedLecturesCount * 100) / totalLecturesInCourse)
        : 0;
  
      activeStudents.push({
        _id: prog._id,
        studentName: prog.user.name,
        studentEmail: prog.user.email,
        courseTitle: prog.course.title,
        completedCount: completedLecturesCount,
        totalCount: totalLecturesInCourse,
        progressPercentage,
      });
    }
  
    const courseEnrollments = Object.values(courseEnrollmentMap);
  
    const stats = {
      totalCoures,
      totalLectures,
      totalUsers,
      totalEarnings,
    };
  
    res.json({
      stats,
      courseEnrollments,
      activeStudents,
    });
  });

  export const getAllUser = TryCatch(async (req, res) => {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "-password"
    );
  
    res.json({ users });
  });
  
  export const updateRole = TryCatch(async (req, res) => {
    if (req.user.role !== "admin")
      return res.status(403).json({
        message: "This endpoint is assign to superadmin",
      });
    const user = await User.findById(req.params.id);
  
    if (user.role === "user") {
      user.role = "admin";
      await user.save();
  
      return res.status(200).json({
        message: "Role updated to admin",
      });
    }
  
    if (user.role === "admin") {
      user.role = "user";
      await user.save();
  
      return res.status(200).json({
        message: "Role updated",
      });
    }
  });