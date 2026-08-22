import Comment from '../models/Comment.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendNotificationToUser, broadcastToProject } from '../config/socket.js';

// @desc    Add comment to project discussion
// @route   POST /api/v1/discussions
export const addComment = async (req, res, next) => {
  try {
    const { projectId, content, parentComment } = req.body;

    if (!projectId || !content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and comment content are required.',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const comment = await Comment.create({
      project: projectId,
      author: req.user._id,
      content: content.trim(),
      parentComment: parentComment || null,
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'author',
      'name email role avatar badges'
    );

    // Award +5 points to student for active discussion participation
    if (req.user.role === 'student') {
      await User.findByIdAndUpdate(req.user._id, { $inc: { points: 5 } });
    }

    // Notify Project Manager if author is not the PM
    if (project.createdBy.toString() !== req.user._id.toString()) {
      const notif = await Notification.create({
        recipient: project.createdBy,
        sender: req.user._id,
        type: 'new_comment',
        title: 'New Discussion Message 💬',
        message: `${req.user.name} commented on "${project.title}".`,
        link: `/projects/${project._id}`,
      });
      sendNotificationToUser(project.createdBy, notif);
    }

    // Broadcast live comment to all active project viewers
    broadcastToProject(projectId, 'new_comment', populatedComment);

    res.status(201).json({
      success: true,
      message: 'Comment posted successfully.',
      comment: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a project
// @route   GET /api/v1/discussions/project/:projectId
export const getProjectComments = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const comments = await Comment.find({ project: projectId })
      .populate('author', 'name email role avatar badges')
      .populate({
        path: 'parentComment',
        populate: { path: 'author', select: 'name' },
      })
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/v1/discussions/:id
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id).populate('project');

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isManager = comment.project.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isManager && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this comment.',
      });
    }

    const projectId = comment.project._id;
    await Comment.findByIdAndDelete(req.params.id);
    // Also delete any direct replies
    await Comment.deleteMany({ parentComment: req.params.id });

    broadcastToProject(projectId, 'comment_deleted', { commentId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
