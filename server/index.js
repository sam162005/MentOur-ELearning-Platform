import express from 'express';
import dotenv from  'dotenv';
import { connectDb } from './database/db.js';
import cors from 'cors';
import Razorpay from "razorpay";

dotenv.config();

export const instance = new Razorpay({
    key_id: process.env.Razorpay_Key,
    key_secret: process.env.Razorpay_Secret,
  });

const app= express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT;  

app.get("/",(req,res)=>{
    res.send("Server is working");
});

app.use("/uploads",express.static("uploads"));

import userRoutes from './routes/user.js';
import courseRoutes from './routes/course.js';
import adminRoutes from './routes/admin.js';

app.use("/api",userRoutes);
app.use("/api",courseRoutes);
app.use("/api",adminRoutes);

app.listen(port || 5000,()=>{
    console.log(`Server is running on port ${port || 5000}`);
    connectDb();
});