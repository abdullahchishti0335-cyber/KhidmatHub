import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { reviewAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

export const ReviewsSection = ({ projectId, isMember = false, averageRating = 0, totalReviews = 0 }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (projectId) {
      loadReviews();
    }
  }, [projectId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewAPI.getReviews(projectId);
      if (res.data && res.data.success) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await reviewAPI.addReview({
        projectId,
        rating,
        comment,
      });

      if (res.data && res.data.success) {
        setSubmitted(true);
        setReviews([res.data.review, ...reviews]);
        setComment('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasReviewed = reviews.some(
    (r) => (r.reviewer?._id || r.reviewer) === (user?.id || user?._id)
  );

  return (
    <div className="space-y-6">
      {/* Header & Rating Breakdown */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Volunteer Ratings & Reviews
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified feedback from participating team members and community leaders.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/90 px-5 py-3 rounded-2xl border border-slate-800">
          <div className="text-center">
            <span className="text-3xl font-extrabold text-amber-400 tracking-tight">
              {averageRating ? averageRating.toFixed(1) : '5.0'}
            </span>
            <span className="text-xs text-slate-400 block">/ 5.0</span>
          </div>

          <div className="border-l border-slate-800 pl-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(averageRating || 5)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              {totalReviews || reviews.length} verified reviews
            </span>
          </div>
        </div>
      </div>

      {/* Review Submission Form (For project members who haven't reviewed yet) */}
      {isMember && !hasReviewed && !submitted && (
        <form
          onSubmit={handleReviewSubmit}
          className="glass-card p-5 rounded-2xl border border-saylani-500/40 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Leave Your Project Review (+25 Activity Points)</span>
            </h4>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(s)}
                  className="p-1 text-slate-600 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-5 h-5 ${
                      s <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          <textarea
            rows="2"
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience working on this project (management, impact, teamwork)..."
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-saylani-500 hover:bg-saylani-400 text-slate-950 shadow-md shadow-saylani-500/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
            </button>
          </div>
        </form>
      )}

      {submitted && (
        <div className="p-4 rounded-xl bg-saylani-500/10 border border-saylani-500/30 text-xs text-saylani-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-saylani-400 flex-shrink-0" />
          <span>Thank you! Your review has been published and points awarded.</span>
        </div>
      )}

      {/* Reviews List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-8 text-center text-xs text-slate-400">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="col-span-2 py-10 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
            <Star className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-40" />
            <p>No reviews yet for this project.</p>
          </div>
        ) : (
          reviews.map((r) => (
            <div
              key={r._id}
              className="glass-card p-4 rounded-2xl border border-slate-800/80 space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={
                      r.reviewer?.avatar ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
                    }
                    alt={r.reviewer?.name}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-white">
                      {r.reviewer?.name || 'Verified Volunteer'}
                    </h5>
                    <span className="text-[10px] text-slate-400">{r.reviewer?.city || 'Pakistan'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((st) => (
                    <Star
                      key={st}
                      className={`w-3 h-3 ${
                        st <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pl-1 italic">
                "{r.comment}"
              </p>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                <span>
                  {new Date(r.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-saylani-400 font-medium">✓ Verified Team Member</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
