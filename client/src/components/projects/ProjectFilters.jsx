import React from 'react';
import { Search, Filter, ArrowUpDown, X, MapPin } from 'lucide-react';

const CATEGORIES = [
  'all',
  'Environment',
  'Education',
  'Health',
  'Technology',
  'Emergency Relief',
  'Community Welfare',
];

const CITIES = ['all', 'Rawalpindi', 'Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Faisalabad'];

const SORT_OPTIONS = [
  { value: 'newest', label: '✨ Newest First' },
  { value: 'highest_impact', label: '🌟 Highest Impact Score' },
  { value: 'nearest_deadline', label: '⏳ Nearest Deadline' },
  { value: 'most_volunteers', label: '👥 Most Volunteers Needed' },
  { value: 'oldest', label: '📅 Oldest First' },
];

export const ProjectFilters = ({
  search,
  setSearch,
  category,
  setCategory,
  location,
  setLocation,
  status,
  setStatus,
  sortBy,
  setSortBy,
  onReset,
}) => {
  const hasActiveFilters =
    search || category !== 'all' || location !== 'all' || status !== 'all' || sortBy !== 'newest';

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 mb-8">
      {/* Top row: Search input & Sort Dropdown */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by title, description, or skills (e.g. 'Clean Rawalpindi', 'Python')..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-saylani-500 focus:ring-1 focus:ring-saylani-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Location Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[150px]">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-saylani-400 pointer-events-none" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-saylani-500 appearance-none cursor-pointer"
            >
              {CITIES.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c === 'all' ? '📍 All Cities' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative min-w-[180px]">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-400 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-saylani-500 appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3 text-saylani-400" />
          Category:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              category === cat
                ? 'bg-saylani-500 text-slate-950 shadow-md shadow-saylani-500/20'
                : 'bg-slate-900/70 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            {cat === 'all' ? 'All Categories' : cat}
          </button>
        ))}
      </div>
    </div>
  );
};
