import React, { useState } from 'react';
import { useGarden } from '../../context/GardenContext';
import { Target, Trophy, CheckCircle2, Award, Zap } from 'lucide-react';

export const MissionsView: React.FC = () => {
  const { missions, user, claimMissionReward } = useGarden();

  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'achievements'>('daily');

  const dailyMissions = missions.filter((m) => m.type === 'daily');
  const weeklyMissions = missions.filter((m) => m.type === 'weekly');

  return (
    <div className="space-y-6 pb-16 animate-in fade-in max-w-5xl mx-auto">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase mb-1">
            <Target className="w-4 h-4" />
            Gardening Challenge System
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            🎯 Missions & Achievements
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Complete daily and weekly care activities to earn XP, level up, and unlock prestigious gardening badges.
          </p>
        </div>

        <div className="bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-emerald-500/30 flex items-center gap-3">
          <Award className="w-6 h-6 text-amber-400" />
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Unlocked Badges</span>
            <span className="text-sm font-extrabold text-white">{user.badges.length} Badges</span>
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-800 pb-3 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('daily')}
          className={`pb-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'daily'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          Daily Missions ({dailyMissions.length})
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`pb-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'weekly'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          Weekly Challenges ({weeklyMissions.length})
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`pb-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'achievements'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-teal-400" />
          Achievements & Badges ({user.achievements.length})
        </button>
      </div>

      {(activeTab === 'daily' || activeTab === 'weekly') && (
        <div className="space-y-4">
          {(activeTab === 'daily' ? dailyMissions : weeklyMissions).map((mission) => {
            const isReadyToClaim = mission.progress >= mission.maxProgress;

            return (
              <div
                key={mission.id}
                className="glass-card p-5 rounded-3xl border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-3 rounded-2xl ${isReadyToClaim ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-400'}`}>
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {mission.title}
                      {mission.badgeReward && (
                        <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                          Badge: {mission.badgeReward}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">{mission.description}</p>

                    <div className="w-48 bg-slate-900 h-2 rounded-full overflow-hidden mt-3.5 border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (mission.progress / mission.maxProgress) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Progress: {mission.progress} / {mission.maxProgress}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-500/30">
                    +{mission.xpReward} XP
                  </span>

                  {isReadyToClaim ? (
                    <button
                      onClick={() => claimMissionReward(mission.id)}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-105"
                    >
                      Claim Reward
                    </button>
                  ) : (
                    <button disabled className="bg-slate-900 text-slate-500 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-800 cursor-not-allowed">
                      In Progress
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.achievements.map((ach) => (
              <div
                key={ach.id}
                className={`glass-card p-5 rounded-3xl border transition-all ${
                  ach.unlocked
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : 'border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-2xl border border-slate-800 shrink-0">
                    {ach.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{ach.title}</h4>
                      {ach.unlocked ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-500/30">
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500">Locked</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{ach.description}</p>

                    {ach.unlockedAt && (
                      <div className="text-[10px] text-slate-400 mt-2">Unlocked on {ach.unlockedAt}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
