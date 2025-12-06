import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    techStack: { type: [String], default: [] },
    githubLink: { type: String, default: "" },
    liveLink: { type: String, default: "" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }]
  },
  { timestamps: true }
);

export default mongoose.model("Post", PostSchema);
