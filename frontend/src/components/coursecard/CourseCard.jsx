import React from "react";
import "./courseCard.css";
import { server } from "../../main";
import { UserData } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { CourseData } from "../../context/CourseContext";
import { FaUser, FaClock } from "react-icons/fa";

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const { user, isAuth } = UserData();
  const { fetchCourses } = CourseData();

  const deleteHandler = async (id) => {
    if (confirm("Are you sure you want to delete this course")) {
      try {
        const { data } = await axios.delete(`${server}/api/course/${id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });

        toast.success(data.message);
        fetchCourses();
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  return (
    <div className="course-card">
      <div className="course-card-image-container">
        <img src={`${server}/${course.image}`} alt={course.title} className="course-image" />
        {course.category && (
          <span className="course-card-category-badge">{course.category}</span>
        )}
        <span className={`course-card-difficulty-badge ${(course.difficulty || "Beginner").toLowerCase()}`}>
          {course.difficulty || "Beginner"}
        </span>
      </div>

      <div className="course-card-content">
        <h3>{course.title}</h3>

        <div className="course-card-rating">
          <span className="stars">
            {"★".repeat(Math.round(course.rating || 0)) + "☆".repeat(5 - Math.round(course.rating || 0))}
          </span>
          <span className="rating-num">({course.rating ? course.rating.toFixed(1) : "0.0"})</span>
        </div>

        <div className="course-card-meta">
          <div className="meta-item">
            <FaUser className="meta-icon" />
            <span>{course.createdBy}</span>
          </div>
          <div className="meta-item">
            <FaClock className="meta-icon" />
            <span>{course.duration} Weeks</span>
          </div>
        </div>

        <div className="course-card-footer">
          <div className="price-section">
            <span className="price-lbl">Price</span>
            <span className="price-val">₹{course.price}</span>
          </div>

          <div className="action-section">
            {isAuth ? (
              <>
                {user && user.role !== "admin" ? (
                  <>
                    {user.subscription.includes(course._id) ? (
                      <button
                        onClick={() => navigate(`/course/study/${course._id}`)}
                        className="common-btn study-btn"
                      >
                        Study
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/course/${course._id}`)}
                        className="common-btn get-started-btn"
                      >
                        Get Started
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => navigate(`/course/study/${course._id}`)}
                    className="common-btn edit-btn"
                  >
                    Edit
                  </button>
                )}
              </>
            ) : (
              <button onClick={() => navigate("/login")} className="common-btn get-started-btn">
                Get Started
              </button>
            )}
          </div>
        </div>

        {/* Admin delete button */}
        {user && user.role === "admin" && (
          <button
            onClick={() => deleteHandler(course._id)}
            className="common-btn delete-btn"
          >
            Delete Course
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
