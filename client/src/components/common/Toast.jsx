import React from 'react';
import { Bell, X, ArrowRight } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export const Toast = ({ onNavigate }) => {
  const { toastNotification, clearToast } = useSocket();

  if (!toastNotification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900/95 border-2 border-saylani-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-saylani-500/20 text-saylani-400 border border-saylani-500/30 flex-shrink-0 animate-bounce">
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white truncate">
              {toastNotification.title}
            </h4>
            <button
              onClick={clearToast}
              className="text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-300 mt-1 line-clamp-2">
            {toastNotification.message}
          </p>
          {toastNotification.link && (
            <button
              onClick={() => {
                clearToast();
                if (onNavigate) onNavigate(toastNotification.link);
              }}
              className="mt-2 text-xs font-semibold text-saylani-400 hover:text-saylani-300 flex items-center gap-1 group"
            >
              <span>View details</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
