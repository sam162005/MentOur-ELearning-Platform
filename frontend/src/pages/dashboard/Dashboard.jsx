import React, { useEffect, useState } from "react";
import "./dashboard.css";
import axios from "axios";
import { server } from "../../main";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/loading/Loading";
import { FaClock, FaTrophy, FaGraduationCap, FaPlay } from "react-icons/fa";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSummary = async () => {
    try {
      const { data } = await axios.get(`${server}/api/user/dashboard/summary`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setSummary(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const stats = summary?.stats || { hoursWatched: 0, quizzesPassed: 0, certificatesEarned: 0 };
  const enrolledCourses = summary?.enrolledCoursesProgress || [];
  const recentlyWatched = summary?.recentlyWatched || [];

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Welcome Back!</h1>
        <p>Track your progress and continue your learning journey.</p>
      </div>

      {/* Stats Summary Section */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon-wrapper time-icon">
            <FaClock />
          </div>
          <div className="stat-info">
            <h3>{stats.hoursWatched} hrs</h3>
            <p>Hours Watched</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper quiz-icon">
            <FaTrophy />
          </div>
          <div className="stat-info">
            <h3>{stats.quizzesPassed}</h3>
            <p>Quizzes Passed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper cert-icon">
            <FaGraduationCap />
          </div>
          <div className="stat-info">
            <h3>{stats.certificatesEarned}</h3>
            <p>Certificates Earned</p>
          </div>
        </div>
      </div>

      {/* Recently Watched Quick Resume */}
      {recentlyWatched.length > 0 && (
        <div className="resume-section">
          <h2>Continue Learning</h2>
          <div className="resume-card" onClick={() => navigate(`/course/study/${recentlyWatched[0].courseId}`)}>
            <div className="resume-play-btn">
              <FaPlay />
            </div>
            <div className="resume-details">
              <span className="course-label">Recently Watched • {recentlyWatched[0].courseTitle}</span>
              <h4>{recentlyWatched[0].lectureTitle}</h4>
            </div>
            <button className="common-btn resume-btn">Resume</button>
          </div>
        </div>
      )}

      {/* Enrolled Courses Progress */}
      <div className="courses-progress-section">
        <h2>My Enrolled Courses</h2>
        <div className="dashboard-grid">
          {enrolledCourses.length > 0 ? (
            enrolledCourses.map((e) => (
              <div key={e.courseId} className="course-progress-card">
                <img src={`${server}/${e.image}`} alt={e.title} className="course-progress-img" />
                <div className="course-progress-details">
                  <h3>{e.title}</h3>
                  <div className="progress-bar-wrapper">
                    <div className="progress-bar-label">
                      <span>Course Progress</span>
                      <span>{e.progressPercentage}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${e.progressPercentage}%` }}></div>
                    </div>
                  </div>
                  <div className="progress-meta">
                    <span>{e.completedCount} / {e.totalCount} Lectures Completed</span>
                  </div>
                  <div className="course-progress-actions">
                    {e.isCertified ? (
                      <button
                        onClick={() => navigate(`/course/study/${e.courseId}`)}
                        className="common-btn cert-action-btn"
                        style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}
                      >
                        Claim Certificate
                      </button>
                    ) : e.progressPercentage === 100 && e.quizExists && !e.quizPassed ? (
                      <button
                        onClick={() => navigate(`/course/study/${e.courseId}`)}
                        className="common-btn quiz-action-btn"
                        style={{ background: "indigo" }}
                      >
                        Take Final Quiz
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/course/study/${e.courseId}`)}
                        className="common-btn"
                      >
                        Resume Study
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-course-message">No courses enrolled yet. Explore and enroll in courses to get started!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
