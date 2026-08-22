import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { applicationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const ApplyModal = ({ isOpen, onClose, project, onApplied }) => {
  const { user } = useAuth();
  const [motivation, setMotivation] = useState('');
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!project) return;

    setLoading(true);
    setError('');

    try {
      const res = await applicationAPI.apply({
        projectId: project._id,
        motivation,
        skills,
      });

      if (res.data && res.data.success) {
        setSuccess(true);
        if (onApplied) onApplied(res.data.application);
        setTimeout(() => {
          setSuccess(false);
          setMotivation('');
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Apply to Join: ${project?.title || 'Project'}`}
      maxWidth="max-w-lg"
    >
      {success ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-saylani-500/20 text-saylani-400 border border-saylani-500/40 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 animate-bounce" />
          </div>
          <h4 className="text-lg font-bold text-white">Application Submitted!</h4>
          <p className="text-xs text-slate-300">
            The project manager has been notified and will review your application shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Volunteer Impact Bonus</p>
              <p className="text-slate-400 mt-0.5">
                Joining this project will award you <strong>+10 Activity Points</strong> once approved!
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Why would you like to join this project? *
            </label>
            <textarea
              rows="3"
              required
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Share your enthusiasm, relevant experience, or how you can contribute..."
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Relevant Skills (comma-separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Social Media, Photography, First Aid"
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-saylani-500 hover:bg-saylani-400 text-slate-950 shadow-md shadow-saylani-500/20 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Application 🚀'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
