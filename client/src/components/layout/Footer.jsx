import React from 'react';
import { HeartHandshake, Sparkles, Github, Heart } from 'lucide-react';

export const Footer = ({ setTab }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-saylani-600 to-saylani-400 flex items-center justify-center shadow-lg shadow-saylani-500/20">
                <HeartHandshake className="w-5 h-5 text-slate-950 font-bold" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-white tracking-tight">Impact</span>
                <span className="text-xl font-bold gradient-text tracking-tight">Hub</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Saylani Community Impact Platform — Empowering students, mentors, and volunteers to create, manage, and drive high-impact community welfare and environmental initiatives across Pakistan.
            </p>
            <div className="flex items-center gap-2 text-xs text-saylani-400 font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Saylani Hackathon Challenge 2026 Edition</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-300 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button
                  onClick={() => setTab('projects')}
                  className="hover:text-saylani-400 transition-colors"
                >
                  Discover Projects
                </button>
              </li>
              <li>
                <button
                  onClick={() => setTab('leaderboard')}
                  className="hover:text-saylani-400 transition-colors"
                >
                  Top Contributors
                </button>
              </li>
              <li>
                <button
                  onClick={() => setTab('dashboard')}
                  className="hover:text-saylani-400 transition-colors"
                >
                  Role Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Key Impact Categories */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-300 mb-3">
              Focus Areas
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Environment',
                'Education',
                'Health',
                'Emergency Relief',
                'Technology',
                'Welfare',
              ].map((cat) => (
                <span
                  key={cat}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 ImpactHub. Built with passion for Saylani Community Welfare.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Powered by Next.js / React, Node.js & MongoDB</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};
