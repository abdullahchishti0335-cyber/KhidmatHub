import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { taskAPI } from '../../services/api';
import { CheckCircle, Upload, Calendar, AlertCircle, Sparkles } from 'lucide-react';

export const CreateTaskModal = ({ isOpen, onClose, projectId, members = [], onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: members.length > 0 ? members[0]._id : '',
    priority: 'MEDIUM',
    deadline: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.assignedTo) {
      setError('Please select an assigned team member.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await taskAPI.createTask({
        projectId,
        ...formData,
      });

      if (res.data && res.data.success) {
        onTaskCreated(res.data.task);
        onClose();
        setFormData({
          title: '',
          description: '',
          assignedTo: members.length > 0 ? members[0]._id : '',
          priority: 'MEDIUM',
          deadline: '',
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign New Project Task" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Task Title *
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Design Social Media Banners"
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Description / Requirements
          </label>
          <textarea
            name="description"
            rows="2"
            value={formData.description}
            onChange={handleChange}
            placeholder="Key deliverables and specifications..."
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Assign To Volunteer *
            </label>
            <select
              name="assignedTo"
              required
              value={formData.assignedTo}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
            >
              <option value="">-- Select Member --</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Priority Level *
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent ⚡</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Deadline *
          </label>
          <input
            type="date"
            name="deadline"
            required
            value={formData.deadline}
            onChange={handleChange}
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
            {loading ? 'Assigning...' : 'Assign Task 📋'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export const CompleteTaskEvidenceModal = ({ isOpen, onClose, task, onTaskCompleted }) => {
  const [completionNotes, setCompletionNotes] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task) return;

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('status', 'COMPLETED');
      data.append('completionNotes', completionNotes);
      if (file) {
        data.append('attachment', file);
      }

      const res = await taskAPI.updateTaskStatus(task._id, data);
      if (res.data && res.data.success) {
        onTaskCompleted(res.data.task);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Task & Submit Evidence" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="p-3 bg-saylani-500/10 border border-saylani-500/30 rounded-xl text-xs text-saylani-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            Completing this task awards you <strong>+20 Volunteer Points</strong>!
          </span>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white mb-1">{task?.title}</h4>
          <p className="text-xs text-slate-400">{task?.description || 'No description provided.'}</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Completion Summary & Notes *
          </label>
          <textarea
            rows="3"
            required
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="Describe the completed work, outcomes, or notes for the project manager..."
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Upload Evidence / Proof Image or PDF
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-saylani-400 hover:file:bg-slate-700 cursor-pointer"
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
            className="px-5 py-2 rounded-xl text-xs font-bold bg-saylani-500 hover:bg-saylani-400 text-slate-950 shadow-md shadow-saylani-500/20 disabled:opacity-50 flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{loading ? 'Submitting...' : 'Mark Completed ✅'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
