const Post = require('../models/Post');
const Notification = require('../models/Notification');

// Helper to send real-time notification
const sendNotification = async (req, recipient, title, message, type, relatedId) => {
    if (recipient.toString() === req.user._id.toString()) return; // don't notify self
    const io = req.app.get('io');
    const notification = await Notification.create({
        recipient,
        sender: req.user._id,
        title,
        message,
        type,
        relatedId
    });
    if (io) {
        io.to(recipient.toString()).emit('notification', notification);
    }
};

exports.createPost = async (req, res) => {
    try {
        const { content, image } = req.body;
        const post = await Post.create({
            user: req.user._id,
            content,
            image
        });
        const populatedPost = await Post.findById(post._id).populate('user', 'name image role');
        res.status(201).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'name image role')
            .populate('comments.user', 'name image role')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const index = post.likes.indexOf(req.user._id);
        if (index === -1) {
            post.likes.push(req.user._id);
            await sendNotification(req, post.user, 'New Like ❤️', `${req.user.name.split(' ')[0]} liked your post.`, 'Like', post._id);
        } else {
            post.likes.splice(index, 1);
        }
        await post.save();
        res.json(post.likes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.comments.push({ user: req.user._id, text });
        await post.save();
        
        await sendNotification(req, post.user, 'New Comment 💬', `${req.user.name.split(' ')[0]} commented on your post.`, 'Comment', post._id);

        const updatedPost = await Post.findById(post._id)
            .populate('user', 'name image role')
            .populate('comments.user', 'name image role');

        res.json(updatedPost.comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.user.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await Post.deleteOne({ _id: post._id });
        res.json({ message: 'Post removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
