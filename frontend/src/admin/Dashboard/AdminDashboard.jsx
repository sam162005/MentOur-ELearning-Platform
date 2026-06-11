import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../Utils/Layout";
import axios from "axios";
import { server } from "../../main";
import "./dashboard.css";

const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();

  if (user && user.role !== "admin") return navigate("/");

  const [stats, setStats] = useState({});
  const [courseEnrollments, setCourseEnrollments] = useState([]);
  const [activeStudents, setActiveStudents] = useState([]);

  async function fetchStats() {
    try {
      const { data } = await axios.get(`${server}/api/stats`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      setStats(data.stats);
      setCourseEnrollments(data.courseEnrollments || []);
      setActiveStudents(data.activeStudents || []);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>
      <Layout>
        <div className="admin-dashboard-container">
          <div className="main-content">
            <div className="box">
              <p>Total Courses</p>
              <p>{stats.totalCoures || 0}</p>
            </div>
            <div className="box">
              <p>Total Lectures</p>
              <p>{stats.totalLectures || 0}</p>
            </div>
            <div className="box">
              <p>Total Users</p>
              <p>{stats.totalUsers || 0}</p>
            </div>
            <div className="box earnings-box">
              <p>Total Earnings</p>
              <p>₹{stats.totalEarnings || 0}</p>
            </div>
          </div>

          <div className="dashboard-section">
            <h2>Course Enrollments</h2>
            <div className="table-container">
              {courseEnrollments.length > 0 ? (
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Course Title</th>
                      <th>Price</th>
                      <th>Enrolled Students</th>
                      <th>Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseEnrollments.map((course) => (
                      <tr key={course._id}>
                        <td className="font-semibold">{course.title}</td>
                        <td>₹{course.price}</td>
                        <td>{course.studentsCount}</td>
                        <td className="revenue-val">₹{course.revenueGenerated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data-msg">No course enrollment statistics found.</p>
              )}
            </div>
          </div>

          <div className="dashboard-section">
            <h2>Active Student Progress</h2>
            <div className="table-container">
              {activeStudents.length > 0 ? (
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Course Title</th>
                      <th>Completed Lectures</th>
                      <th>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeStudents.map((student) => (
                      <tr key={student._id}>
                        <td className="font-semibold">{student.studentName}</td>
                        <td className="text-muted">{student.studentEmail}</td>
                        <td>{student.courseTitle}</td>
                        <td>
                          {student.completedCount} / {student.totalCount}
                        </td>
                        <td>
                          <div className="progress-bar-container">
                            <div className="progress-track">
                              <div
                                className="progress-fill"
                                style={{ width: `${student.progressPercentage}%` }}
                              ></div>
                            </div>
                            <span className="progress-percentage">
                              {student.progressPercentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data-msg">No active student progress records found.</p>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default AdminDashboard;