import express from "express";
import jwt from "jsonwebtoken";
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

// POST /api/posts - create post
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, techStack, githubLink, liveLink } = req.body;

    if (!title || !description) {
      return res.status(400).json({ msg: "Title and description are required" });
    }

    const post = new Post({
      author: req.user,
      title,
      description,
      techStack: techStack || [],
      githubLink: githubLink || "",
      liveLink: liveLink || ""
    });

    await post.save();
    const populated = await post.populate("author", "name");
    res.json(populated);
  } catch (err) {
    console.error("Create post error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/posts - get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Get posts error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/posts/:id/like - toggle like
router.post("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const userId = req.user.toString();
    const index = post.likes.findIndex((id) => id.toString() === userId);

    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    const populated = await post.populate("author", "name");
    res.json(populated);
  } catch (err) {
    console.error("Like post error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE /api/posts/:id - delete post
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    if (post.author.toString() !== req.user) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await post.deleteOne();
    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error("Delete post error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
