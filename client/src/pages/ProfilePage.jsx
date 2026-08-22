import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import {
  User as UserIcon,
  Award,
  Trophy,
  Clock,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Save,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Badge, StatsCard } from '../components/common/Badge';

const BADGE_CATALOG = [
  { name: 'Impact Pioneer', desc: 'Registered and took the Saylani volunteer pledge.', icon: '🌱', threshold: 'Welcome' },
  { name: 'Active Contributor', desc: 'Accumulated 100+ community activity points.', icon: '⚡', threshold: '100 pts' },
  { name: 'Task Master', desc: 'Completed 5 or more on-ground or digital tasks.', icon: '🎯', threshold: '5 tasks' },
  { name: 'Community Hero', desc: 'Accumulated 500+ impact points across multiple drives.', icon: '🦸', threshold: '500 pts' },
  { name: 'Legendary Impact Maker', desc: 'Accumulated 1,000+ points and led volunteer teams.', icon: '👑', threshold: '1,000 pts' },
];

export const ProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || 'Karachi',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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
    setSaving(true);
    setMessage('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('city', formData.city);
      data.append('bio', formData.bio);
      data.append('skills', formData.skills);

      if (avatarFile) {
        data.append('avatar', avatarFile);
      }

      const res = await authAPI.updateProfile(data);
      if (res.data?.success) {
        setMessage('Profile updated successfully!');
        await refreshProfile();
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <img
          src={
            avatarPreview ||
            user?.avatar ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
          }
          alt={user?.name}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-saylani-500/50 shadow-xl shadow-saylani-500/20"
        />

        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-2xl font-black text-white">{user?.name}</h2>
            <Badge variant={user?.role === 'admin' ? 'danger' : user?.role === 'manager' ? 'warning' : 'primary'} size="sm">
              {user?.role?.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-3">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-saylani-400" /> {user?.city}
            </span>
          </p>
          <p className="text-xs text-slate-300 italic pt-1">{user?.bio}</p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-center min-w-[130px]">
          <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block">
            Impact Points
          </span>
          <span className="text-2xl font-black text-amber-400 block">
            {user?.points?.toLocaleString() || 0}
          </span>
          <span className="text-[10px] text-saylani-400 font-semibold">
            {user?.hoursContributed || 0} hrs served
          </span>
        </div>
      </div>

      {/* Badges Collection */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>My Badges & Honors Showcase</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BADGE_CATALOG.map((b, i) => {
            const isUnlocked = user?.badges?.includes(b.name);

            return (
              <div
                key={i}
                className={`p-4 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-sm shadow-amber-500/10'
                    : 'bg-slate-900/40 border-slate-800/80 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{b.icon}</span>
                  <Badge variant={isUnlocked ? 'gold' : 'default'} size="sm">
                    {isUnlocked ? 'Unlocked' : b.threshold}
                  </Badge>
                </div>
                <h4 className="text-sm font-bold text-white mt-2">{b.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <h3 className="text-lg font-bold text-white tracking-tight">
          Edit Profile Information
        </h3>

        {message && (
          <div className="p-3 bg-saylani-500/10 border border-saylani-500/30 rounded-xl text-xs text-saylani-300">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                City / Location
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Short Bio
            </label>
            <textarea
              rows="2"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Update Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-saylani-400 hover:file:bg-slate-700 cursor-pointer"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-saylani-500 hover:bg-saylani-400 text-slate-950 font-bold text-xs shadow-md shadow-saylani-500/20 flex items-center gap-1.5 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
