import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Sparkles,
  Award,
  Medal,
  Users,
  CheckCircle2,
  FolderKanban,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { leaderboardAPI } from '../services/api';
import { Badge } from '../components/common/Badge';

export const LeaderboardPage = ({ navigateToProject }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [topProjects, setTopProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leaderboardAPI
      .getLeaderboard()
      .then((res) => {
        if (res.data?.success) {
          setLeaderboard(res.data.leaderboard);
          setTopProjects(res.data.topProjects);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const remainingVolunteers = leaderboard.slice(3);

  return (
    <div className="space-y-12 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Saylani Community Leaderboard</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Top Contributors & Impact Scores
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Recognizing outstanding student volunteers and top-performing community impact initiatives across Pakistan.
        </p>
      </div>

      {/* Podium for Top 3 */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-4">
          {/* 2nd Place */}
          {top3[1] && (
            <div className="glass-card p-6 rounded-2xl border border-slate-700/80 text-center space-y-3 order-2 md:order-1">
              <span className="text-3xl block">🥈</span>
              <img
                src={
                  top3[1].avatar ||
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
                }
                alt={top3[1].name}
                className="w-16 h-16 rounded-2xl object-cover mx-auto border-2 border-slate-500 shadow-md"
              />
              <div>
                <h4 className="text-sm font-bold text-white">{top3[1].name}</h4>
                <p className="text-[11px] text-slate-400">{top3[1].city}</p>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-lg font-black text-amber-400 block">
                  {top3[1].points?.toLocaleString()} pts
                </span>
                <span className="text-[10px] text-slate-500">
                  {top3[1].completedTasks} tasks • {top3[1].hoursContributed} hrs
                </span>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <div className="glass-card p-8 rounded-3xl border-2 border-amber-500/60 bg-gradient-to-b from-amber-500/15 via-slate-900/90 to-slate-950 text-center space-y-4 shadow-2xl shadow-amber-500/10 order-1 md:order-2 md:-translate-y-4">
              <span className="text-4xl block animate-bounce">🥇</span>
              <img
                src={
                  top3[0].avatar ||
                  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200'
                }
                alt={top3[0].name}
                className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-amber-400 shadow-lg shadow-amber-500/30"
              />
              <div>
                <Badge variant="gold" size="sm" className="mb-1">
                  Champion Contributor
                </Badge>
                <h3 className="text-lg font-black text-white">{top3[0].name}</h3>
                <p className="text-xs text-slate-400">{top3[0].city}</p>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-amber-500/30">
                <span className="text-2xl font-black text-amber-400 block">
                  {top3[0].points?.toLocaleString()} pts
                </span>
                <span className="text-xs text-slate-400">
                  {top3[0].completedTasks} tasks • {top3[0].hoursContributed} hrs contributed
                </span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div className="glass-card p-6 rounded-2xl border border-slate-700/80 text-center space-y-3 order-3">
              <span className="text-3xl block">🥉</span>
              <img
                src={
                  top3[2].avatar ||
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
                }
                alt={top3[2].name}
                className="w-16 h-16 rounded-2xl object-cover mx-auto border-2 border-amber-700/60 shadow-md"
              />
              <div>
                <h4 className="text-sm font-bold text-white">{top3[2].name}</h4>
                <p className="text-[11px] text-slate-400">{top3[2].city}</p>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-lg font-black text-amber-400 block">
                  {top3[2].points?.toLocaleString()} pts
                </span>
                <span className="text-[10px] text-slate-500">
                  {top3[2].completedTasks} tasks • {top3[2].hoursContributed} hrs
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <span>Top Volunteer Rankings</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Volunteer</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Tasks Done</th>
                <th className="py-3 px-4">Hours</th>
                <th className="py-3 px-4">Badges</th>
                <th className="py-3 px-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {leaderboard.map((vol) => (
                <tr key={vol.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-400">
                    {vol.rank === 1
                      ? '🥇 #1'
                      : vol.rank === 2
                      ? '🥈 #2'
                      : vol.rank === 3
                      ? '🥉 #3'
                      : `#${vol.rank}`}
                  </td>
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <img
                      src={
                        vol.avatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
                      }
                      alt={vol.name}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                    />
                    <span className="font-bold text-white">{vol.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{vol.city || 'Pakistan'}</td>
                  <td className="py-3.5 px-4">{vol.completedTasks || 0}</td>
                  <td className="py-3.5 px-4 text-slate-400">{vol.hoursContributed || 0} hrs</td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {vol.badges?.slice(0, 2).map((b, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-amber-400 text-sm">
                    {vol.points?.toLocaleString()} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Projects by Impact Score */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Top Projects by Impact Score</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topProjects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => navigateToProject(proj.id)}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-saylani-500/50 cursor-pointer space-y-3 transition-all group"
            >
              <div className="flex items-center justify-between">
                <Badge variant="primary" size="sm">
                  {proj.category}
                </Badge>
                <div className="flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full">
                  <span>Score: {proj.impactScore?.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-saylani-300 transition-colors">
                  {proj.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Manager: {proj.manager} • Location: {proj.location}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>{proj.volunteersCount} Volunteers Mobilized</span>
                <span className="text-saylani-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  View Workspace <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Volunteer Points Rules Card */}
      <div className="glass-panel p-8 rounded-3xl border border-saylani-500/30 space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Award className="w-5 h-5 text-saylani-400" />
          <span>How to Earn Volunteer Activity Points</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <strong className="text-saylani-400 text-sm block">+10 Points</strong>
            <span className="text-slate-400">Join a community project</span>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <strong className="text-saylani-400 text-sm block">+20 Points</strong>
            <span className="text-slate-400">Complete an assigned task</span>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <strong className="text-saylani-400 text-sm block">+25 Points</strong>
            <span className="text-slate-400">Receive 5-star project review</span>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <strong className="text-saylani-400 text-sm block">+100 Points</strong>
            <span className="text-slate-400">Complete full project milestone</span>
          </div>
        </div>
      </div>
    </div>
  );
};
