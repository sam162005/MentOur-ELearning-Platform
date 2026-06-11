import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
    },
    email:{
        type:String,
        required: true,
        unique: true,
    },
    password:{
        type:String,
        required: true,
    },
    role:{
        type:String,
        required: true,
        default:"user",
    },
    subscription:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Courses",
    },
],
    profilePic: {
      type: String,
      default: "",
    },
},
{
    timestamps: true,
}
);

export const User = mongoose.model("User",schema);