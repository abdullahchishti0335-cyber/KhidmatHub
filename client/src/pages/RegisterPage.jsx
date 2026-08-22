import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, UserPlus, Upload } from 'lucide-react';

const CITIES = ['Karachi', 'Rawalpindi', 'Lahore', 'Islamabad', 'Peshawar', 'Faisalabad', 'Quetta', 'Multan'];

export const RegisterPage = ({ setTab }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: 'Karachi',
    skills: 'Marketing, Event Management, Social Media',
    role: 'student',
    bio: 'Excited to contribute to Saylani community impact campaigns.',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('phone', formData.phone);
    data.append('city', formData.city);
    data.append('skills', formData.skills);
    data.append('role', formData.role);
    data.append('bio', formData.bio);

    if (avatarFile) {
      data.append('avatar', avatarFile);
    }

    const res = await register(data);
    if (res.success) {
      setTab('dashboard');
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="py-12 max-w-lg mx-auto animate-in fade-in duration-300">
      {/* Brand Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-saylani-600 to-saylani-400 flex items-center justify-center mx-auto shadow-lg shadow-saylani-500/25">
          <HeartHandshake className="w-7 h-7 text-slate-950 font-bold" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create Your Impact Account
        </h2>
        <p className="text-xs text-slate-400">
          Join thousands of students and managers driving social change.
        </p>
      </div>

      {/* Registration Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ali Khan"
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="ali@impacthub.pk"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password *
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+92 300 1234567"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                City / Location *
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Role *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col text-xs transition-all ${
                  formData.role === 'student'
                    ? 'border-saylani-500 bg-saylani-500/10 text-saylani-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="font-bold text-white">🎓 Student / Volunteer</span>
                <span className="text-[10px] mt-0.5">Join projects & complete tasks</span>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col text-xs transition-all ${
                  formData.role === 'manager'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="manager"
                  checked={formData.role === 'manager'}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="font-bold text-white">📋 Project Manager</span>
                <span className="text-[10px] mt-0.5">Create & lead community projects</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Your Skills & Interests (comma-separated)
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. Web Development, Photography, Marketing"
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Profile Avatar (Optional)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-saylani-400 hover:file:bg-slate-700 cursor-pointer"
              />
              {avatarPreview && (
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-saylani-500 hover:bg-saylani-400 text-slate-950 font-bold text-xs shadow-lg shadow-saylani-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Creating Account...' : 'Register & Claim +20 Welcome Pts 🎉'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          <span>Already have an account? </span>
          <button
            onClick={() => setTab('login')}
            className="text-saylani-400 hover:text-saylani-300 font-bold"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
