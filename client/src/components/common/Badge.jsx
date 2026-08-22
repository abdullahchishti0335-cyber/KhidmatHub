import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variantStyles = {
    default: 'bg-slate-700/60 text-slate-300 border-slate-600',
    primary: 'bg-saylani-500/20 text-saylani-300 border-saylani-500/40',
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    danger: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    info: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    gold: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 shadow-sm shadow-yellow-500/10',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const ProgressBar = ({ progress = 0, color = 'saylani', showLabel = false, height = 'h-2' }) => {
  const cleanProgress = Math.min(100, Math.max(0, Math.round(progress)));

  const colorStyles = {
    saylani: 'bg-gradient-to-r from-saylani-600 to-saylani-400',
    blue: 'bg-gradient-to-r from-sky-600 to-cyan-400',
    amber: 'bg-gradient-to-r from-amber-600 to-yellow-400',
    purple: 'bg-gradient-to-r from-purple-600 to-indigo-400',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Progress</span>
          <span className="font-semibold text-slate-200">{cleanProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${height} border border-slate-700/40`}>
        <div
          className={`${height} ${colorStyles[color] || colorStyles.saylani} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${cleanProgress}%` }}
        />
      </div>
    </div>
  );
};

export const StatsCard = ({ title, value, subtitle, icon: Icon, trend, color = 'emerald' }) => {
  const colorMap = {
    emerald: 'from-emerald-500/20 to-saylani-600/10 text-saylani-400 border-emerald-500/30',
    blue: 'from-sky-500/20 to-blue-600/10 text-sky-400 border-sky-500/30',
    amber: 'from-amber-500/20 to-yellow-600/10 text-amber-400 border-amber-500/30',
    purple: 'from-purple-500/20 to-indigo-600/10 text-purple-400 border-purple-500/30',
    rose: 'from-rose-500/20 to-pink-600/10 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color]} border shadow-inner group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center text-xs text-emerald-400">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};
