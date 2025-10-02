const Post = require("../models/Post");
const User = require('../models/User');

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 * @access  Private
 */
const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = new Post({
      content,
      user: req.user._id,
      likes: [],
      comments: [],
    });

    if (req.file) post.image = req.file.path;

    const createdPost = await post.save();
    // Populate name, role, profilePicture
    await createdPost.populate('user', '_id name role profilePicture');

    res.status(201).json(createdPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Fetch all posts
 * @route   GET /api/posts
 * @access  Private
 */
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate('user', '_id name role profilePicture')
      .populate('comments.user', '_id name profilePicture')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Get posts error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc    Like or unlike a post
 * @route   POST /api/posts/:id/like
 * @access  Private
 */
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.likes.includes(req.user.id)) {
      post.likes = post.likes.filter(userId => userId.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json(post.likes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Comment on a post
 * @route   POST /api/posts/:id/comment
 * @access  Private
 */
const commentOnPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = {
      text: req.body.text,
      user: req.user.id,
    };

    post.comments.push(newComment);
    await post.save();

    const createdComment = post.comments[post.comments.length - 1];
    await Post.populate(createdComment, { path: 'user', select: '_id name profilePicture' });

    res.status(201).json(createdComment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Get single post by ID
 * @route   GET /api/posts/:id
 * @access  Private
 */
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', '_id name role profilePicture')
      .populate('comments.user', '_id name profilePicture');

    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Delete a post
 * @route   DELETE /api/posts/:id
 * @access  Private
 */
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Delete a comment
 * @route   DELETE /api/posts/:id/comment/:comment_id
 * @access  Private
 */
const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.find(c => c.id === req.params.comment_id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Only comment author or post author can delete
    if (comment.user.toString() !== req.user.id && post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    post.comments = post.comments.filter(c => c.id !== req.params.comment_id);
    await post.save();

    res.json({ message: 'Comment removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { 
  createPost, 
  getPosts, 
  likePost, 
  commentOnPost, 
  getPostById, 
  deletePost, 
  deleteComment 
};
