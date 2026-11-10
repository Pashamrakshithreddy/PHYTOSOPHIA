import React, { useState } from 'react';
import { useGarden } from '../../context/GardenContext';
import type { LeaderboardUser } from '../../types';
import { Trophy, Flame, Heart, Sparkles, BookOpen, ShieldCheck, X } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { leaderboard } = useGarden();

  const [leaderboardType, setLeaderboardType] = useState<'weekly' | 'alltime'>('weekly');
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="text-xl">🥇</span>;
      case 2:
        return <span className="text-xl">🥈</span>;
      case 3:
        return <span className="text-xl">🥉</span>;
      default:
        return <span className="text-xs font-bold text-slate-400">#{rank}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in max-w-5xl mx-auto">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase mb-1">
            <Trophy className="w-5 h-5 text-amber-400" />
            Fair Gardening Performance Scoring Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            🏆 Global & Weekly Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Rankings are determined by our <strong>Fair Gardening Score Formula</strong> (Health + Consistency + Growth + Recovery). 3 well-cared plants outrank 50 neglected ones!
          </p>
        </div>

        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setLeaderboardType('weekly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              leaderboardType === 'weekly'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Weekly Competition
          </button>
          <button
            onClick={() => setLeaderboardType('alltime')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              leaderboardType === 'alltime'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All-Time Masters
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-3xl border border-emerald-500/20 overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400 font-semibold">
          <span>Gardener Rank & Username</span>
          <div className="flex gap-8">
            <span className="hidden sm:inline">Garden Health</span>
            <span className="hidden sm:inline">Streak</span>
            <span>Fair Score</span>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {leaderboard.map((user) => (
            <div
              key={user.username}
              onClick={() => setSelectedUser(user)}
              className="p-4 flex items-center justify-between hover:bg-slate-900/60 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  {getRankBadge(user.rank)}
                </div>

                <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shrink-0">
                  {user.avatar}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                    {user.username}
                    <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-full border border-slate-700 font-normal">
                      Lvl {user.level}: {user.title}
                    </span>
                  </h4>

                  <div className="flex items-center gap-2 mt-0.5">
                    {user.badges.map((b, idx) => (
                      <span key={idx} className="text-[10px] text-amber-300 font-medium">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs">
                <div className="hidden sm:flex items-center gap-1 text-emerald-400 font-bold">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  {user.gardenHealth}%
                </div>

                <div className="hidden sm:flex items-center gap-1 text-rose-400 font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  {user.careStreak}d
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-sm text-teal-300 block">{user.fairScore} pts</span>
                  <span className="text-[10px] text-emerald-500 font-bold">Click to Learn</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-950 border border-emerald-500/30 rounded-3xl shadow-2xl p-6 overflow-hidden space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl">
                  {selectedUser.avatar}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedUser.username}</h3>
                  <p className="text-xs text-emerald-400 font-semibold">
                    Rank #{selectedUser.rank} • Level {selectedUser.level}: {selectedUser.title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <strong>Learn From This Gardener:</strong> Public shareable tips and routines.
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-400" />
                Successful Care Routines
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedUser.publicRoutines.map((routine, idx) => (
                  <li key={idx} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    • {routine}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Top Plant-Care Advice
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedUser.topTips.map((tip, idx) => (
                  <li key={idx} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    💡 "{tip}"
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-[10px] text-slate-500 text-center pt-2 border-t border-slate-800">
              🔒 Private personal info (email, phone, address) is permanently protected.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
