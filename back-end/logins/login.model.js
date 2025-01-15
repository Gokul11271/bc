import mongoose from "mongoose";

const loginSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
  },
  password: {
      type: String,
      required: true,
  },
    role: {
      type: String,
      enum: ["admin", "user"], // Restrict to predefined roles
      default: "user",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);
console.log("im here");
const Login = mongoose.model("Login", loginSchema);

export default Login;
