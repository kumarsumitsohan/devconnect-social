import express from "express";
import jwt from "jsonwebtoken";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

const router = express.Router();

function auth(req, res, next) {
  const authHeader = req.header("Authorization");
  if (!authHeader) return res.status(401).json({ msg: "No token, authorization denied" });

  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
}

// POST /api/comments/:postId - create comment
router.post("/:postId", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ msg: "Text is required" });

    const comment = new Comment({
      postId: req.params.postId,
      author: req.user,
      text
    });

    await comment.save();

    // push comment into post
    const post = await Post.findById(req.params.postId);
    if (post) {
      post.comments.push(comment._id);
      await post.save();
    }

    const populated = await comment.populate("author", "name");
    res.json(populated);
  } catch (err) {
    console.error("Create comment error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/comments/:postId - list comments
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate("author", "name")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error("Get comments error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
