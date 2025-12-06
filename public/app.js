const API_BASE = "";

// DOM elements
const userInfoEl = document.getElementById("user-info");
const logoutBtn = document.getElementById("logout-btn");
const authForms = document.getElementById("auth-forms");

const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginBtn = document.getElementById("login-btn");

const regName = document.getElementById("reg-name");
const regEmail = document.getElementById("reg-email");
const regPassword = document.getElementById("reg-password");
const regBio = document.getElementById("reg-bio");
const regSkills = document.getElementById("reg-skills");
const registerBtn = document.getElementById("register-btn");

const postTitle = document.getElementById("post-title");
const postDescription = document.getElementById("post-description");
const postTech = document.getElementById("post-tech");
const postGithub = document.getElementById("post-github");
const postLive = document.getElementById("post-live");
const createPostBtn = document.getElementById("create-post-btn");

const postsContainer = document.getElementById("posts-container");
const searchInput = document.getElementById("search-input");

let authToken = localStorage.getItem("devconnect_token") || "";
let currentUser = JSON.parse(localStorage.getItem("devconnect_user") || "null");
let allPosts = [];

function setAuthState(token, user) {
  authToken = token || "";
  currentUser = user || null;

  if (token && user) {
    localStorage.setItem("devconnect_token", token);
    localStorage.setItem("devconnect_user", JSON.stringify(user));
    userInfoEl.textContent = `Logged in as ${user.name}`;
    authForms.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
  } else {
    localStorage.removeItem("devconnect_token");
    localStorage.removeItem("devconnect_user");
    userInfoEl.textContent = "Not logged in";
    authForms.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
  }
}

setAuthState(authToken || null, currentUser || null);

// Auth handlers
loginBtn.addEventListener("click", async () => {
  try {
    const body = {
      email: loginEmail.value.trim(),
      password: loginPassword.value.trim()
    };
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.msg || "Login failed");
      return;
    }
    setAuthState(data.token, data.user);
    fetchPosts();
  } catch (err) {
    console.error(err);
    alert("Error logging in");
  }
});

registerBtn.addEventListener("click", async () => {
  try {
    const skillsArray = regSkills.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const body = {
      name: regName.value.trim(),
      email: regEmail.value.trim(),
      password: regPassword.value.trim(),
      bio: regBio.value.trim(),
      skills: skillsArray
    };

    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.msg || "Registration failed");
      return;
    }
    setAuthState(data.token, data.user);
    fetchPosts();
  } catch (err) {
    console.error(err);
    alert("Error registering");
  }
});

logoutBtn.addEventListener("click", () => {
  setAuthState(null, null);
  fetchPosts();
});

// Posts
createPostBtn.addEventListener("click", async () => {
  if (!authToken) {
    alert("Please log in to create a post");
    return;
  }
  try {
    const techArray = postTech.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const body = {
      title: postTitle.value.trim(),
      description: postDescription.value.trim(),
      techStack: techArray,
      githubLink: postGithub.value.trim(),
      liveLink: postLive.value.trim()
    };

    const res = await fetch(`${API_BASE}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.msg || "Failed to create post");
      return;
    }

    postTitle.value = "";
    postDescription.value = "";
    postTech.value = "";
    postGithub.value = "";
    postLive.value = "";

    allPosts.unshift(data);
    renderPosts(allPosts);
  } catch (err) {
    console.error(err);
    alert("Error creating post");
  }
});

async function fetchPosts() {
  try {
    const res = await fetch(`${API_BASE}/api/posts`);
    const data = await res.json();
    if (!res.ok) {
      alert("Failed to load posts");
      return;
    }
    allPosts = data;
    renderPosts(allPosts);
  } catch (err) {
    console.error(err);
    alert("Error loading posts");
  }
}

function renderPosts(posts) {
  postsContainer.innerHTML = "";

  if (!posts.length) {
    postsContainer.innerHTML = "<p>No posts yet. Be the first to share!</p>";
    return;
  }

  posts.forEach((post) => {
    const el = document.createElement("div");
    el.className = "post";

    const createdDate = new Date(post.createdAt).toLocaleString();

    const isLiked =
      currentUser && post.likes && post.likes.includes(currentUser.id);

    const canDelete =
      currentUser && post.author && post.author._id === currentUser.id;

    el.innerHTML = `
      <div class="post-header">
        <span>${post.author?.name || "Unknown"}</span>
        <span>${createdDate}</span>
      </div>
      <div class="post-title">${post.title}</div>
      <div class="post-desc">${post.description}</div>
      <div class="post-meta">
        Tech: ${
          post.techStack && post.techStack.length
            ? post.techStack.join(", ")
            : "Not specified"
        }
      </div>
      <div class="post-links">
        ${
          post.githubLink
            ? `<a href="${post.githubLink}" target="_blank">GitHub</a>`
            : ""
        }
        ${
          post.liveLink
            ? `<a href="${post.liveLink}" target="_blank">Live Demo</a>`
            : ""
        }
      </div>
      <div class="post-actions">
        <button class="like-btn" data-id="${post._id}">
          ${isLiked ? "Unlike" : "Like"} (${post.likes ? post.likes.length : 0})
        </button>
        ${
          canDelete
            ? `<button class="delete-btn" data-id="${post._id}">Delete</button>`
            : ""
        }
      </div>
      <div class="comments-section" id="comments-${post._id}">
        <p>Loading comments...</p>
      </div>
      <div class="add-comment">
        <input type="text" placeholder="Write a comment..." id="comment-input-${post._id}">
        <button data-id="${post._id}" class="comment-btn">Comment</button>
      </div>
    `;

    postsContainer.appendChild(el);
  });

  // Attach like and delete handlers
  document.querySelectorAll(".like-btn").forEach((btn) => {
    btn.addEventListener("click", () => handleLike(btn.dataset.id));
  });
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => handleDelete(btn.dataset.id));
  });

  // Attach comment handlers
  document.querySelectorAll(".comment-btn").forEach((btn) => {
    btn.addEventListener("click", () => submitComment(btn.dataset.id));
  });

  // Load comments for each post
  posts.forEach((post) => {
    loadComments(post._id);
  });
}

async function handleLike(postId) {
  if (!authToken) {
    alert("Please log in to like posts");
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.msg || "Failed to like/unlike");
      return;
    }
    // update local posts
    allPosts = allPosts.map((p) => (p._id === data._id ? data : p));
    renderPosts(allPosts);
  } catch (err) {
    console.error(err);
    alert("Error liking post");
  }
}

async function handleDelete(postId) {
  if (!authToken) {
    alert("Please log in");
    return;
  }
  if (!confirm("Delete this post?")) return;

  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.msg || "Failed to delete");
      return;
    }
    allPosts = allPosts.filter((p) => p._id !== postId);
    renderPosts(allPosts);
  } catch (err) {
    console.error(err);
    alert("Error deleting post");
  }
}

// Comments
async function loadComments(postId) {
  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`);
    const comments = await res.json();
    const container = document.getElementById(`comments-${postId}`);
    if (!Array.isArray(comments) || comments.length === 0) {
      container.innerHTML = "<p>No comments yet.</p>";
      return;
    }
    container.innerHTML = comments
      .map(
        (c) => `
        <div class="comment">
          <strong>${c.author?.name || "Unknown"}</strong>: ${c.text}
          <span class="date">${new Date(c.createdAt).toLocaleString()}</span>
        </div>
      `
      )
      .join("");
  } catch (err) {
    console.error(err);
    const container = document.getElementById(`comments-${postId}`);
    container.innerHTML = "<p>Failed to load comments.</p>";
  }
}

async function submitComment(postId) {
  if (!authToken) {
    alert("Please log in to comment");
    return;
  }
  const input = document.getElementById(`comment-input-${postId}`);
  const text = input.value.trim();
  if (!text) return;

  try {
    const res = await fetch(`${API_BASE}/api/comments/${postId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.msg || "Failed to comment");
      return;
    }
    input.value = "";
    loadComments(postId);
  } catch (err) {
    console.error(err);
    alert("Error posting comment");
  }
}

// search
searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  const filtered = allPosts.filter((p) => {
    const title = p.title?.toLowerCase() || "";
    const tech = (p.techStack || []).join(" ").toLowerCase();
    return title.includes(q) || tech.includes(q);
  });
  renderPosts(filtered);
});

// initial load
fetchPosts();
