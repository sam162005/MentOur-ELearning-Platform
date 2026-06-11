import React, { useState } from "react";
import { MdDashboard } from "react-icons/md";
import "./account.css";
import { IoMdLogOut } from "react-icons/io";
import { UserData } from "../../context/UserContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";

const Account = ({ user }) => {
  const { setIsAuth, setUser, fetchUser } = UserData();
  const navigate = useNavigate();

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPrev, setAvatarPrev] = useState(user.profilePic ? `${server}/${user.profilePic}` : "");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPrev(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!avatarFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", avatarFile);

    try {
      const { data } = await axios.post(`${server}/api/user/avatar`, formData, {
        headers: {
          token: localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(data.message);
      await fetchUser();
      setUploading(false);
      setAvatarFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload avatar");
      setUploading(false);
    }
  };

  const logoutHandler = () => {
    localStorage.clear();
    setUser([]);
    setIsAuth(false);
    toast.success("Logged Out");
    navigate("/login");
  };

  return (
    <div>
      {user && (
        <div className="profile-container">
          <div className="profile-card">
            <h2>My Profile</h2>
            
            {/* Avatar Section */}
            <div className="avatar-section">
              <div className="avatar-preview-wrapper">
                {avatarPrev ? (
                  <img src={avatarPrev} alt="Profile Avatar" className="profile-avatar-img" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <form onSubmit={handleUpload} className="avatar-upload-form">
                <label htmlFor="avatar-input" className="avatar-picker-label">
                  Choose Photo
                </label>
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                {avatarFile && (
                  <button type="submit" disabled={uploading} className="common-btn avatar-upload-btn">
                    {uploading ? "Saving..." : "Save Photo"}
                  </button>
                )}
              </form>
            </div>

            <div className="profile-info">
              <p>
                <strong>Name : </strong> {user.name}
              </p>
              <p>
                <strong>Email : </strong> {user.email}
              </p>
              {user.role === "user" && (
                <button
                  onClick={() => navigate(`/${user._id}/dashboard`)}
                  className="profile-btn"
                >
                  <MdDashboard className="icon" />
                  Dashboard
                </button>
              )}
              {user.role === "admin" && (
                <button
                  onClick={() => navigate(`/admin/dashboard`)}
                  className="profile-btn admin-btn"
                >
                  <MdDashboard className="icon" />
                  Admin Dashboard
                </button>
              )}
              <button
                onClick={logoutHandler}
                className="profile-btn logout-btn"
              >
                <IoMdLogOut className="icon" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
