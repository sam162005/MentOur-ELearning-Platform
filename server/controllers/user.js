import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "../middlewares/sendMail.js";
import TryCatch from "../middlewares/TryCatch.js";
import fs from "fs";

export const register = TryCatch(async (req, res) => {
    const { email, name, password } = req.body;
  
    if (!email || !name || !password) {
      return res.status(400).json({
        message: "Email, name, and password are required",
      });
    }
  
  
    let user = await User.findOne({ email });
  
    if (user)
      return res.status(400).json({
        message: "User Already exists",
      });
  

    const hashPassword = await bcrypt.hash(password, 10);
  

    user = {
      name,
      email,
      password: hashPassword, 
    };
  

    const otp = Math.floor(Math.random() * 1000000);
  

    const activationToken = jwt.sign(
      {
        user,
        otp,
      },
      process.env.Activation_Secret,
      {
        expiresIn: "5m",
      }
    );
  

    const data = {
      name,
      otp,
    };
  
    await sendMail(email, "E-Learning - OTP Verification", data);
  
    console.log(otp);
    res.status(200).json({
      message: "OTP sent to your email",
      activationToken,
    });
  });
  

  export const verifyUser = TryCatch(async (req, res) => {
    const { otp, activationToken } = req.body;
  
    if (!otp || !activationToken) {
      return res.status(400).json({
        message: "OTP and activation token are required",
      });
    }
  
    // Verify the activation token
    let verify;
    try {
      verify = jwt.verify(activationToken, process.env.Activation_Secret);
    } catch (err) {
      return res.status(400).json({
        message: "Invalid or expired activation token",
      });
    }
  

    if (verify.otp !== otp)
      return res.status(400).json({
        message: "Wrong OTP",
      });
  

    const newUser = await User.create({
      name: verify.user.name,
      email: verify.user.email,
      password: verify.user.password, 
    });
  
    res.status(201).json({
      message: "User Registered Successfully",
      user: {
        name: newUser.name,
        email: newUser.email,
      },
    });
  });
  
  export const loginUser = TryCatch(async (req, res) => {
    const { email, password } = req.body;
  
    const user = await User.findOne({ email });
  
    if (!user)
      return res.status(400).json({
        message: "No User with this email",
      });
  
    const mathPassword = await bcrypt.compare(password, user.password);
  
    if (!mathPassword)
      return res.status(400).json({
        message: "wrong Password",
      });
  
    const token = jwt.sign({ _id: user._id }, process.env.Jwt_Sec, {
      expiresIn: "15d",
    });
  
    res.json({
      message: `Welcome back ${user.name}`,
      token,
      user,
    });
  });

  export const myProfile = TryCatch(async (req, res) => {
    const user = await User.findById(req.user._id);
  
    res.json({ user });
  });

  export const updateAvatar = TryCatch(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image file",
      });
    }

    // Delete old profile pic file if it exists and isn't empty
    if (user.profilePic) {
      fs.unlink(user.profilePic, (err) => {
        if (err) console.log("Failed to delete old avatar:", err);
      });
    }

    user.profilePic = req.file.path.replace(/\\/g, "/");
    await user.save();

    res.status(200).json({
      message: "Profile photo updated successfully",
      user,
    });
  });
