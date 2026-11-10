import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, Bell, Lock, LogOut, CheckCircle2, User } from 'lucide-react';

interface SettingsViewProps {
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onLogout }) => {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || 'Dedi Suheri');
  const [email, setEmail] = useState(user?.email || 'risuheri@hello.mail');
  const [careReminders, setCareReminders] = useState(true);
  const [aiInsights, setAiInsights] = useState(true);
  const [diseaseAlerts, setDiseaseAlerts] = useState(true);
  const [leaderboardVisible, setLeaderboardVisible] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in max-w-4xl mx-auto">
      <div className="agri-panel p-6 sm:p-8 rounded-3xl border border-white flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-lime-700 font-semibold text-xs uppercase mb-1">
            <Settings className="w-4 h-4" />
            System Preferences
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ⚙️ Account & Security Settings
          </h1>
        </div>

        {savedSuccess && (
          <div className="bg-lime-100 text-lime-800 border border-lime-300 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-lime-600" />
            Preferences Saved!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="agri-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-lime-600" />
            ACCOUNT INFORMATION
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-lime-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-lime-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="agri-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            NOTIFICATIONS & ALERTS
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-slate-900">Care Reminders</div>
                <div className="text-[11px] text-slate-500">Watering, fertilization, and environmental checks</div>
              </div>
              <input
                type="checkbox"
                checked={careReminders}
                onChange={(e) => setCareReminders(e.target.checked)}
                className="w-4 h-4 text-lime-600 rounded border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-slate-900">PhytoAI Insights</div>
                <div className="text-[11px] text-slate-500">Weekly growth analysis & photosynthetic trends</div>
              </div>
              <input
                type="checkbox"
                checked={aiInsights}
                onChange={(e) => setAiInsights(e.target.checked)}
                className="w-4 h-4 text-lime-600 rounded border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-slate-900">Disease Risk Alerts</div>
                <div className="text-[11px] text-slate-500">SAM Pathology warning notifications</div>
              </div>
              <input
                type="checkbox"
                checked={diseaseAlerts}
                onChange={(e) => setDiseaseAlerts(e.target.checked)}
                className="w-4 h-4 text-lime-600 rounded border-slate-300"
              />
            </label>
          </div>
        </div>

        <div className="agri-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            PRIVACY & LEADERBOARD VISIBILITY
          </h3>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-slate-900">Public Leaderboard Visibility</div>
              <div className="text-[11px] text-slate-500">Allow other gardeners to see your rank & tips</div>
            </div>
            <input
              type="checkbox"
              checked={leaderboardVisible}
              onChange={(e) => setLeaderboardVisible(e.target.checked)}
              className="w-4 h-4 text-lime-600 rounded border-slate-300"
            />
          </label>
        </div>

        <div className="agri-panel p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="submit"
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-lg transition-all"
          >
            Save All Preferences
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full sm:w-auto bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout Account
          </button>
        </div>
      </form>
    </div>
  );
};
