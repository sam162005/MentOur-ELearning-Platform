import TryCatch from "../middlewares/TryCatch.js";
import { Announcement } from "../models/Announcement.js";
import { Notification } from "../models/Notification.js";
import { Courses } from "../models/Courses.js";
import { User } from "../models/User.js";

// Create Course Announcement & notify all enrolled students
export const createAnnouncement = TryCatch(async (req, res) => {
  const { title, content } = req.body;
  const courseId = req.params.id;

  const course = await Courses.findById(courseId);
  if (!course) {
    return res.status(404).json({
      message: "Course not found",
    });
  }

  // Create Announcement
  const announcement = await Announcement.create({
    course: courseId,
    title,
    content,
    createdBy: req.user.name,
  });

  // Find all users subscribed to this course.
  // Subscription is stored in User.subscription array.
  const subscribers = await User.find({ subscription: courseId });

  // Create notifications in batch for all subscribers
  const notifications = subscribers.map((sub) => ({
    user: sub._id,
    title: `New Announcement in ${course.title}`,
    message: title,
    link: `/course/study/${courseId}?tab=announcements`,
    isRead: false,
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  res.status(201).json({
    message: "Announcement posted successfully and students notified",
    announcement,
  });
});

// Get all announcements for a course
export const getCourseAnnouncements = TryCatch(async (req, res) => {
  const courseId = req.params.id;

  const announcements = await Announcement.find({ course: courseId }).sort({
    createdAt: -1,
  });

  res.json({ announcements });
});

// Get user notifications
export const getUserNotifications = TryCatch(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  res.json({ notifications });
});

// Mark notification as read
export const markNotificationRead = TryCatch(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      message: "Notification not found",
    });
  }

  res.json({ message: "Notification marked as read", notification });
});
