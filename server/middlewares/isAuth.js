import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const isAuth = async (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(401).json({
        message: "Access token required",
      });
    }

    try {
      const decodedData = jwt.verify(token, process.env.Jwt_Sec);
      req.user = await User.findById(decodedData._id);
      if (!req.user) {
        return res.status(401).json({
          message: "User not found",
        });
      }
      next();
    } catch (authError) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Login First",
    });
  }
};


export const isAdmin = (req, res, next) => {
    try {
      if (req.user.role !== "admin")
        return res.status(403).json({
          message: "You are not admin",
        });
  
      next();
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
