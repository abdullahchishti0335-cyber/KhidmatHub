import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Trash2,
  Sparkles,
  CornerDownRight,
  User as UserIcon,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { discussionAPI } from '../../services/api';

export const DiscussionThread = ({ projectId }) => {
  const { user, isAuthenticated } = useAuth();
  const { socket, joinProject, leaveProject } = useSocket();

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Load comments & join real-time room
  useEffect(() => {
    if (!projectId) return;

    loadComments();
    joinProject(projectId);

    if (socket) {
      const handleNewComment = (comment) => {
        setComments((prev) => [...prev, comment]);
      };

      const handleCommentDeleted = ({ commentId }) => {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      };

      socket.on('new_comment', handleNewComment);
      socket.on('comment_deleted', handleCommentDeleted);

      return () => {
        socket.off('new_comment', handleNewComment);
        socket.off('comment_deleted', handleCommentDeleted);
        leaveProject(projectId);
      };
    }
  }, [projectId, socket]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await discussionAPI.getComments(projectId);
      if (res.data && res.data.success) {
        setComments(res.data.comments);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSending(true);
    try {
      await discussionAPI.addComment({
        projectId,
        content: newComment,
        parentComment: replyToId,
      });
      setNewComment('');
      setReplyToId(null);
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await discussionAPI.deleteComment(commentId);
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-saylani-400" />
            <span>Team Discussion & Live Updates</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time collaboration for volunteers, mentors, and project managers.
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-saylani-400 bg-saylani-500/10 border border-saylani-500/30 px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>+5 Activity pts per discussion message</span>
        </div>
      </div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSendComment} className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
          {replyToId && (
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 rounded-xl text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <CornerDownRight className="w-3.5 h-3.5 text-saylani-400" />
                Replying to message...
              </span>
              <button
                type="button"
                onClick={() => setReplyToId(null)}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <img
              src={
                user?.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
              }
              alt={user?.name}
              className="w-9 h-9 rounded-xl object-cover border border-slate-700 flex-shrink-0"
            />
            <div className="flex-1">
              <textarea
                rows="2"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Post a message, update, or ask a question to the team..."
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={sending || !newComment.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-saylani-500 hover:bg-saylani-400 text-slate-950 shadow-md shadow-saylani-500/20 disabled:opacity-50 flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Posting...' : 'Post Message'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
          Please log in to join the discussion.
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Loading team discussions...
          </div>
        ) : comments.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
            <MessageSquare className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isAuthor =
              (comment.author?._id || comment.author) === (user?.id || user?._id);
            const authorRole = comment.author?.role || 'student';

            return (
              <div
                key={comment._id}
                className="glass-card p-4 rounded-2xl border border-slate-800/80 space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        comment.author?.avatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
                      }
                      alt={comment.author?.name}
                      className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {comment.author?.name || 'Community Member'}
                        </span>
                        <Badge
                          variant={
                            authorRole === 'admin'
                              ? 'danger'
                              : authorRole === 'manager'
                              ? 'warning'
                              : 'primary'
                          }
                          size="sm"
                        >
                          {authorRole.toUpperCase()}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isAuthenticated && (
                      <button
                        onClick={() => setReplyToId(comment._id)}
                        className="text-xs text-slate-400 hover:text-saylani-300 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Reply"
                      >
                        Reply
                      </button>
                    )}
                    {(isAuthor || user?.role === 'admin') && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 pl-9 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
