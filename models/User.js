import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String, default: "" },
    skills: { type: [String], default: [] },
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
