import React, { useState, useEffect } from 'react';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectFilters } from '../components/projects/ProjectFilters';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { ApplyModal } from '../components/projects/ApplyModal';
import { projectAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Compass, Sparkles, FolderX } from 'lucide-react';

export const ProjectsPage = ({ setTab, navigateToProject }) => {
  const { isAuthenticated, isManager, isAdmin } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedProjectForApply, setSelectedProjectForApply] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [category, location, status, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectAPI.getProjects({
        search,
        category: category !== 'all' ? category : undefined,
        location: location !== 'all' ? location : undefined,
        status: status !== 'all' ? status : undefined,
        sortBy,
        limit: 50,
      });

      if (res.data?.success) {
        setProjects(res.data.projects);
        setTotalCount(res.data.total || res.data.count);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setLocation('all');
    setStatus('all');
    setSortBy('newest');
  };

  const handleApplyClick = (project) => {
    if (!isAuthenticated) {
      setTab('login');
      return;
    }
    setSelectedProjectForApply(project);
    setApplyModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-saylani-400" />
            <span>Discover Community Projects</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse {totalCount} initiatives across Pakistan and contribute your skills to high-impact causes.
          </p>
        </div>

        {(isManager || isAdmin) && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-saylani-500 hover:bg-saylani-400 text-slate-950 shadow-lg shadow-saylani-500/25 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Launch New Campaign</span>
          </button>
        )}
      </div>

      {/* Discovery Filters */}
      <ProjectFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        location={location}
        setLocation={setLocation}
        status={status}
        setStatus={setStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onReset={handleResetFilters}
      />

      {/* Projects Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-saylani-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Querying impact campaigns from database...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-panel py-16 px-4 text-center rounded-3xl border border-slate-800 space-y-4 max-w-lg mx-auto">
          <FolderX className="w-12 h-12 text-slate-600 mx-auto opacity-60" />
          <h3 className="text-lg font-bold text-white">No Matching Projects Found</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No active projects match your search criteria. Try clearing filters or searching for different keywords.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <ProjectCard
              key={proj._id}
              project={proj}
              onSelect={(id) => navigateToProject(id)}
              onApply={handleApplyClick}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onProjectCreated={() => fetchProjects()}
      />

      <ApplyModal
        isOpen={applyModalOpen}
        onClose={() => {
          setApplyModalOpen(false);
          setSelectedProjectForApply(null);
        }}
        project={selectedProjectForApply}
        onApplied={() => fetchProjects()}
      />
    </div>
  );
};
