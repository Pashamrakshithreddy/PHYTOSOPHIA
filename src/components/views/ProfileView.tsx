import React, { useState } from 'react';
import { useGarden } from '../../context/GardenContext';
import { Lock } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, updateUserBio } = useGarden();

  const [usernameInput, setUsernameInput] = useState(user.username);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
  const [isEditing, setIsEditing] = useState(false);

  const avatarOptions = ['🌱', '👨‍🌾', '👩‍🌾', '🪴', '🌺', '🌳', '🌾', '🍀'];

  const handleSaveBio = () => {
    updateUserBio(usernameInput, selectedAvatar);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in max-w-4xl mx-auto">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-slate-900 border-2 border-emerald-400/50 flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/20 shrink-0">
            {user.avatar}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">{user.username}</h1>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                Level {user.level}
              </span>
            </div>
            <p className="text-xs text-emerald-400 font-semibold mt-0.5">{user.title}</p>
            <p className="text-xs text-slate-400 mt-1">Garden Keeper • Active 12 days streak</p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:border-emerald-500/40"
        >
          {isEditing ? 'Cancel Edit' : 'Edit Avatar & Username'}
        </button>
      </div>

      {isEditing && (
        <div className="glass-panel p-5 rounded-3xl border border-emerald-500/30 space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-white">Customize Public Profile Avatar</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Username</label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Avatar Symbol</label>
              <div className="flex gap-1 overflow-x-auto">
                {avatarOptions.map((av) => (
                  <button
                    key={av}
                    onClick={() => setSelectedAvatar(av)}
                    className={`p-2 rounded-xl text-lg border ${
                      selectedAvatar === av ? 'border-emerald-400 bg-emerald-950' : 'border-slate-800 bg-slate-900'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={handleSaveBio}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
          >
            Save Profile
          </button>
        </div>
      )}

      <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-300">Level {user.level}: {user.title}</span>
          <span className="text-amber-400">{user.xp.toLocaleString()} / {user.xpToNextLevel.toLocaleString()} XP</span>
        </div>
        <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, ((user.xp % 1000) / 1000) * 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl">
          <span className="text-slate-400 text-xs font-medium block">Total Waterings</span>
          <span className="text-xl font-bold text-sky-400 mt-1 block">{user.stats.totalWaterings}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl">
          <span className="text-slate-400 text-xs font-medium block">AI Health Scans</span>
          <span className="text-xl font-bold text-teal-400 mt-1 block">{user.stats.totalScans}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl">
          <span className="text-slate-400 text-xs font-medium block">Disease Recoveries</span>
          <span className="text-xl font-bold text-emerald-400 mt-1 block">{user.stats.diseaseRecoveries}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl">
          <span className="text-slate-400 text-xs font-medium block">Care Consistency</span>
          <span className="text-xl font-bold text-amber-300 mt-1 block">{user.stats.careConsistencyScore}%</span>
        </div>
      </div>

      <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-xs text-slate-400 flex items-center gap-3">
        <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <strong className="text-slate-200 block">Strict Data Privacy Guard:</strong>
          PhytoSophia never stores or exposes email addresses, passwords, phone numbers, or exact addresses.
        </div>
      </div>
    </div>
  );
};
