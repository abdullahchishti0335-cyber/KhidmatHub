import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { projectAPI } from '../../services/api';
import { Upload, Sparkles, Calendar, MapPin, Users, Tag } from 'lucide-react';

const CATEGORIES = [
  'Environment',
  'Education',
  'Health',
  'Technology',
  'Emergency Relief',
  'Community Welfare',
  'Other',
];

export const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Environment',
    location: 'Rawalpindi',
    startDate: '',
    endDate: '',
    requiredVolunteers: 20,
    skillsRequired: 'Marketing, Social Media, Event Management',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('location', formData.location);
      data.append('startDate', formData.startDate);
      data.append('endDate', formData.endDate);
      data.append('requiredVolunteers', formData.requiredVolunteers);
      data.append('skillsRequired', formData.skillsRequired);

      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await projectAPI.createProject(data);
      if (res.data && res.data.success) {
        onProjectCreated(res.data.project);
        onClose();
        // Reset
        setFormData({
          title: '',
          description: '',
          category: 'Environment',
          location: 'Rawalpindi',
          startDate: '',
          endDate: '',
          requiredVolunteers: 20,
          skillsRequired: 'Marketing, Social Media, Event Management',
        });
        setImageFile(null);
        setImagePreview('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project. Please check fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Community Project" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Project Title *
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Clean Rawalpindi Campaign"
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Description & Impact Goals *
          </label>
          <textarea
            name="description"
            rows="3"
            required
            value={formData.description}
            onChange={handleChange}
            placeholder="Explain the objectives, community impact, and plan for this project..."
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Location / City *
            </label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Rawalpindi / Commercial Market"
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              name="startDate"
              required
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              End Date / Deadline *
            </label>
            <input
              type="date"
              name="endDate"
              required
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Required Volunteers *
            </label>
            <input
              type="number"
              name="requiredVolunteers"
              min="1"
              required
              value={formData.requiredVolunteers}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Skills Required (comma separated)
          </label>
          <input
            type="text"
            name="skillsRequired"
            value={formData.skillsRequired}
            onChange={handleChange}
            placeholder="Marketing, Social Media, Event Management"
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Project Banner Image (Optional)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-saylani-400 hover:file:bg-slate-700 cursor-pointer"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-16 h-12 object-cover rounded-lg border border-slate-700"
              />
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
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
            className="px-5 py-2 rounded-xl text-xs font-bold bg-saylani-500 hover:bg-saylani-400 text-slate-950 shadow-lg shadow-saylani-500/20 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Launch Project 🚀'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
