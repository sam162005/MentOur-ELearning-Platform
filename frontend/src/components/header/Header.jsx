import React, { useEffect, useState, useRef } from "react";
import "./header.css";
import { Link, useNavigate } from "react-router-dom";
import logoImage from "../../images/logo-removebg-preview.png"; 
import { FaSun, FaMoon, FaBell } from "react-icons/fa";
import { ThemeData } from "../../context/ThemeContext";
import { UserData } from "../../context/UserContext";
import { server } from "../../main";
import axios from "axios";

const Header = ({ isAuth }) => {
  const { theme, toggleTheme } = ThemeData();
  const { user } = UserData();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!isAuth) return;
    try {
      const { data } = await axios.get(`${server}/api/notifications`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setNotifications(data.notifications || []);
    } catch (error) {
      console.log("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuth]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await axios.put(`${server}/api/notification/${notif._id}/read`, {}, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      } catch (error) {
        console.log("Error marking notification as read:", error);
      }
    }
    setShowDropdown(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.filter((n) => !n.isRead);
      await Promise.all(
        unreadNotifs.map((n) =>
          axios.put(`${server}/api/notification/${n._id}/read`, {}, {
            headers: {
              token: localStorage.getItem("token"),
            },
          })
        )
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.log("Error marking all as read:", error);
    }
  };

  return (
    <header>
      <div className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <img src={logoImage} alt="MentOur Logo" className="logo-image" />
        MentOur
      </div>

      <div className="link">
        <Link to={"/"}>Home</Link>
        <Link to={"/courses"}>Courses</Link>
        <Link to={"/about"}>About</Link>
        {isAuth ? (
          <Link to={"/account"} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0.25rem 0.75rem" }}>
            {user && user.profilePic ? (
              <img src={`${server}/${user.profilePic}`} alt="Profile" className="header-avatar" />
            ) : (
              <span className="header-avatar-initial">{user && user.name ? user.name.charAt(0).toUpperCase() : "A"}</span>
            )}
            Account
          </Link>
        ) : (
          <Link to={"/login"}>Login</Link>
        )}

        {isAuth && (
          <div className="notifications-menu" ref={dropdownRef}>
            <button
              className="notification-bell-btn"
              onClick={() => setShowDropdown(!showDropdown)}
              aria-label="Notifications"
            >
              <FaBell />
              {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
            </button>

            {showDropdown && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button className="mark-all-read-btn" onClick={markAllAsRead}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="notifications-list">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`notification-item ${!notif.isRead ? "unread" : ""}`}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <div className="notification-title">{notif.title}</div>
                        <div className="notification-desc">{notif.message}</div>
                        <div className="notification-time">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-notifications">No notifications yet</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>
      </div>
    </header>
  );
};

export default Header;
