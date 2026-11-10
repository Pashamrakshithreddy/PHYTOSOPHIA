import React from 'react';
import { useGarden } from '../../context/GardenContext';
import {
  Sprout,
  Heart,
  Zap,
  Flame,
  PlusCircle,
  Droplets,
  Sparkles,
  Scan,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface HomeViewProps {
  onSelectPlant: (plantId: string) => void;
  onOpenAddModal: () => void;
  onNavigateTab: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSelectPlant, onOpenAddModal, onNavigateTab }) => {
  const { plants, user, missions, handleCareAction } = useGarden();

  const totalPlants = plants.length;
  const avgHealth = Math.round(
    plants.reduce((acc, p) => acc + p.healthScore, 0) / (totalPlants || 1)
  );

  const plantsNeedingAttention = plants.filter((p) => p.healthScore < 85);
  const todaysMissions = missions.filter((m) => m.type === 'daily');

  const getStatusBadge = (healthState: string) => {
    switch (healthState) {
      case 'EXCELLENT':
        return { label: 'Excellent', color: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' };
      case 'NEEDS_ATTENTION':
        return { label: 'Needs Attention', color: 'bg-amber-950/80 text-amber-300 border-amber-500/40' };
      case 'UNHEALTHY':
        return { label: 'Unhealthy', color: 'bg-orange-950/80 text-orange-300 border-orange-500/40' };
      default:
        return { label: 'Critical', color: 'bg-rose-950/80 text-rose-300 border-rose-500/40' };
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in">
      <div className="relative glass-panel rounded-3xl p-6 sm:p-8 overflow-hidden border border-emerald-500/30">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Sprout className="w-4 h-4" />
              Stateful Digital Twin Garden Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user.username}! 🌱
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Your digital garden is currently operating at <strong className="text-emerald-400">{avgHealth}% average health</strong> with a <strong className="text-amber-400">{user.careStreak}-day streak</strong> active.
            </p>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm px-5 py-3 rounded-2xl shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-105 active:scale-95 shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            + ADD PLANT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Plants</div>
            <div className="text-xl font-bold text-white mt-0.5">{totalPlants} Twins</div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-400">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Garden Health</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{avgHealth}%</div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Current XP</div>
            <div className="text-xl font-bold text-amber-300 mt-0.5">{user.xp.toLocaleString()} XP</div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Care Streak</div>
            <div className="text-xl font-bold text-rose-400 mt-0.5">{user.careStreak} Days</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-emerald-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Today's Care Tasks
            </h3>
            <button
              onClick={() => onNavigateTab('missions')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              View All Missions <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todaysMissions.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${task.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{task.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{task.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30">
                    +{task.xpReward} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-amber-500/20 bg-amber-950/10">
          <h3 className="text-base font-bold text-amber-300 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Needing Attention ({plantsNeedingAttention.length})
          </h3>

          {plantsNeedingAttention.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-300">All plants in optimal condition!</p>
              <p className="text-[11px] text-slate-400 mt-1">Keep up your consistent care streak.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {plantsNeedingAttention.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectPlant(p.id)}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all flex items-center gap-3"
                >
                  <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                    <p className="text-[11px] text-amber-400 mt-0.5">Health: {p.healthScore}%</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Sprout className="w-6 h-6 text-emerald-400" />
              My Digital Twin Garden
            </h2>
            <p className="text-xs text-slate-400">Interactive stateful 3D companions</p>
          </div>
          <button
            onClick={() => onNavigateTab('plants')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800"
          >
            View All Plants ({plants.length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plants.map((plant) => {
            const badge = getStatusBadge(plant.healthState);
            return (
              <div
                key={plant.id}
                className="glass-card rounded-3xl overflow-hidden border border-emerald-500/20 group hover:border-emerald-400/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div
                    onClick={() => onSelectPlant(plant.id)}
                    className="relative h-48 cursor-pointer overflow-hidden"
                  >
                    <img
                      src={plant.imageUrl}
                      alt={plant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-1 rounded-lg">
                      {plant.growthStage}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-base font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                        🌱 {plant.name}
                      </h3>
                      <p className="text-xs text-emerald-400 italic">{plant.species}</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Health Score</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Heart className="w-3.5 h-3.5 text-rose-400" />
                          <span className="font-bold text-emerald-400 text-sm">{plant.healthScore}%</span>
                        </div>
                      </div>

                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Growth Score</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
                          <span className="font-bold text-teal-300 text-sm">{plant.growthScore}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 flex items-center justify-between pt-1">
                      <span className="text-slate-400">Next Care Task:</span>
                      <span className="font-semibold text-emerald-400">{plant.nextTask.type}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleCareAction(plant.id, 'water')}
                    className="py-2 px-2 bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <Droplets className="w-3.5 h-3.5" />
                    Water
                  </button>
                  <button
                    onClick={() => handleCareAction(plant.id, 'fertilize')}
                    className="py-2 px-2 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Fertilize
                  </button>
                  <button
                    onClick={() => onSelectPlant(plant.id)}
                    className="py-2 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <Scan className="w-3.5 h-3.5" />
                    Inspect
                  </button>
                </div>
              </div>
            );
          })}

          <div
            onClick={onOpenAddModal}
            className="glass-card rounded-3xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-400 p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[320px] transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300">
              + Add New Digital Twin
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Identify species, scan leaf pathology, and track real 3D growth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
