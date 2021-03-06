const express = require('express');
const app = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/post');
const User = require('../models/users');
const Profile = require('../models/profile');
app.post('/', auth, async (req, res) => {
	try {
		const user = await User.findById(req.body.user).select('-password');
		const newPost = new Post({
			text: req.body.text,
			name: user.name,
			avatar: user.avatar,
			user: req.body.user,
		});

		const post = await newPost.save();

		res.json(post);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route    GET api/posts
// @desc     Get all posts
// @access   Private
app.get('/', auth, async (req, res) => {
	try {
		const posts = await Post.find().sort({ date: -1 });
		res.json(posts);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route    GET api/posts/:id
// @desc     Get post by ID
// @access   Private
app.get('/:id', auth, async (req, res) => {
	try {
		const post = await Post.find({ user: req.body.user });

		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

		res.json(post);
	} catch (err) {
		console.error(err.message);
		if (err.kind === 'ObjectId') {
			return res.status(404).json({ msg: 'Post not found' });
		}
		res.status(500).send('Server Error');
	}
});

app.get('/profile/:id', async (req, res) => {
	try {
		const profile = await Profile.findById(req.params.id);
		const post = await Post.find({ user: profile.userId._id });
		res.send(post);

		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

		res.json(post);
	} catch (err) {
		console.error(err.message);
		if (err.kind === 'ObjectId') {
			return res.status(404).json({ msg: 'Post not found' });
		}
		res.status(500).send('Server Error');
	}
});

// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private
app.delete('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

		// Check user
		if (post.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User not authorized' });
		}

		await post.remove();

		res.json({ msg: 'Post removed' });
	} catch (err) {
		console.error(err.message);
		if (err.kind === 'ObjectId') {
			return res.status(404).json({ msg: 'Post not found' });
		}
		res.status(500).send('Server Error');
	}
});

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private
app.put('/like/:id', auth, async (req, res) => {
	console.log(req.params.id);
	try {
		const post = await Post.findById(req.params.id);
		console.log(post);

		// Check if the post has already been liked
		if (post.likes.filter((like) => like.user.toString() === req.body.user).length > 0) {
			return res.status(400).json({ msg: 'Post already liked' });
		}

		post.likes.unshift({ user: req.body.user });

		await post.save();

		res.json(post.likes);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route    PUT api/posts/unlike/:id
// @desc     Like a post
// @access   Private
app.put('/unlike/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		// Check if the post has already been liked
		if (post.likes.filter((like) => like.user.toString() === req.body.user).length === 0) {
			return res.status(400).json({ msg: 'Post has not yet been liked' });
		}

		// Get remove index
		const removeIndex = post.likes.map((like) => like.user.toString()).indexOf(req.body.user);

		post.likes.splice(removeIndex, 1);

		await post.save();

		res.json(post.likes);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

module.exports = app;
