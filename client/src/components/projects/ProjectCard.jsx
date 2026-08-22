import React from 'react';
import {
  MapPin,
  Calendar,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
  Clock,
} from 'lucide-react';
import { Badge, ProgressBar } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';

export const ProjectCard = ({ project, onSelect, onApply }) => {
  const { user, isStudent } = useAuth();

  const isMember = project.members?.some(
    (m) => (typeof m === 'string' ? m : m._id || m.id) === (user?.id || user?._id)
  );

  const categoryColorMap = {
    Environment: 'emerald',
    Education: 'blue',
    Health: 'rose',
    Technology: 'purple',
    'Emergency Relief': 'amber',
    'Community Welfare': 'success',
  };

  const formattedDeadline = new Date(project.endDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group border border-slate-800 hover:border-saylani-500/50 transition-all duration-300">
      {/* Top Banner Image & Badges */}
      <div>
        <div className="relative h-48 w-full overflow-hidden bg-slate-950">
          <img
            src={
              project.image ||
              'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=800'
            }
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <Badge variant={categoryColorMap[project.category] || 'primary'} size="sm">
              {project.category}
            </Badge>

            <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-500/40 text-amber-300 text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Score: {project.impactScore?.toLocaleString() || 0}</span>
            </div>
          </div>

          {/* Location & Status overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded-md backdrop-blur-sm border border-slate-700/50 font-medium">
              <MapPin className="w-3.5 h-3.5 text-saylani-400" />
              {project.location}
            </span>
            {project.status === 'completed' ? (
              <Badge variant="purple" size="sm">
                Completed
              </Badge>
            ) : (
              <Badge variant="success" size="sm">
                Active
              </Badge>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          <h3
            onClick={() => onSelect(project._id)}
            className="text-lg font-bold text-white group-hover:text-saylani-300 cursor-pointer transition-colors line-clamp-1"
          >
            {project.title}
          </h3>

          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {project.description}
          </p>

          {/* Skills Required Tags */}
          {project.skillsRequired && project.skillsRequired.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {project.skillsRequired.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/40"
                >
                  {skill}
                </span>
              ))}
              {project.skillsRequired.length > 3 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
                  +{project.skillsRequired.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Progress & Volunteers Metric */}
          <div className="mt-4 pt-3 border-t border-slate-800/70 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-saylani-400" />
                <span>
                  <strong className="text-white">
                    {project.members ? project.members.length : 0}
                  </strong>{' '}
                  / {project.requiredVolunteers} Volunteers
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Due {formattedDeadline}</span>
              </div>
            </div>

            <ProgressBar progress={project.progress || 0} height="h-1.5" />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-5 pb-5 pt-1 flex items-center justify-between gap-2">
        <button
          onClick={() => onSelect(project._id)}
          className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 py-2"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>

        {isMember ? (
          <div className="flex items-center gap-1 text-xs font-bold text-saylani-400 bg-saylani-500/10 border border-saylani-500/30 px-3 py-1.5 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Joined</span>
          </div>
        ) : isStudent && project.status === 'active' ? (
          <button
            onClick={() => onApply(project)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-saylani-500 hover:bg-saylani-400 text-slate-950 shadow-md shadow-saylani-500/20 transition-all active:scale-95"
          >
            Apply Now
          </button>
        ) : null}
      </div>
    </div>
  );
};
