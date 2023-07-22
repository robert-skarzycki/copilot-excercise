// Create web server

// Import modules
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// Import middleware
const auth = require('../middleware/auth');

// Import model
const Post = require('../models/Post');
const User = require('../models/User');

// @route   POST api/posts/:id/comments
// @desc    Create a comment
// @access  Private
router.post(
  '/:id/comments',
  [
    auth,
    [
      check('text', 'Text is required').not().isEmpty(),
      check('text', 'Text must be between 3 and 300 characters').isLength({
        min: 3,
        max: 300,
      }),
    ],
  ],
  async (req, res) => {
    // Check errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // Bad request
    }

    try {
      // Get user
      const user = await User.findById(req.user.id).select('-password');

      // Get post
      const post = await Post.findById(req.params.id);

      // Create comment
      const comment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      // Add comment to post
      post.comments.unshift(comment);

      // Save post
      await post.save();

      // Send response
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error'); //