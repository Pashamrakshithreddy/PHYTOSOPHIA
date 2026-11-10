import React, { useState } from 'react';
import { roomDb, type PlantEntity, type CareTaskEntity } from '../../services/roomDatabase';
import {
  getMicroclimateTelemetry,
  generateMicroclimateAdvice,
  type WeatherTelemetry,
} from '../../services/weatherService';
import { Plant3DViewer } from '../3d/Plant3DViewer';
import {
  Droplets,
  Sun,
  Scan,
  Sprout,
  CheckCircle2,
  Plus,
  ArrowUpRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AgriDashboardProps {
  onNavigateTab: (tab: string, extraData?: any) => void;
  onOpenAddModal: () => void;
}

export const AgriDashboardView: React.FC<AgriDashboardProps> = ({
  onNavigateTab,
  onOpenAddModal,
}) => {
  const [plants, setPlants] = useState<PlantEntity[]>(() => roomDb.plantDao.getAll());
  const [activePlantId, setActivePlantId] = useState<string>(plants[0]?.id || 'plant-monstera-1');
  const [microclimateLocation, setMicroclimateLocation] = useState<'balcony' | 'indoor' | 'greenhouse'>('balcony');
  const [todayTasks, setTodayTasks] = useState<CareTaskEntity[]>(() => roomDb.careTaskDao.getTodayTasks());

  const [isWatering, setIsWatering] = useState(false);
  const [isFertilizing, setIsFertilizing] = useState(false);
  const [isSunlightActive, setIsSunlightActive] = useState(false);

  const activePlant = plants.find((p) => p.id === activePlantId) || plants[0];
  const weather: WeatherTelemetry = getMicroclimateTelemetry(microclimateLocation);
  const gardenStats = roomDb.plantDao.getGardenStats();
  const outdoorCount = plants.filter((p) => p.location === 'Outdoor').length;
  const microclimateAdvice = generateMicroclimateAdvice(weather, outdoorCount);

  const triggerWater = async () => {
    if (!activePlant) return;
    setIsWatering(true);
    confetti({ particleCount: 30, spread: 45, origin: { y: 0.85 } });
    const updated = {
      ...activePlant,
      lastWatered: new Date().toISOString(),
      healthScore: Math.min(100, activePlant.healthScore + 2),
      careStreak: (activePlant.careStreak || 0) + 1,
    };
    roomDb.plantDao.update(updated);
    setPlants([...roomDb.plantDao.getAll()]);
    setTimeout(() => setIsWatering(false), 2500);
  };

  const triggerFertilize = async () => {
    if (!activePlant) return;
    setIsFertilizing(true);
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.85 } });
    roomDb.fertilizerScheduleDao.logApplication(activePlant.id);
    const updated = roomDb.plantDao.getById(activePlant.id);
    if (updated) setPlants([...roomDb.plantDao.getAll()]);
    setTimeout(() => setIsFertilizing(false), 2500);
  };

  const triggerSunlight = () => {
    setIsSunlightActive(true);
    setTimeout(() => setIsSunlightActive(false), 2500);
  };

  const handleCompleteTask = (taskId: string) => {
    const res = roomDb.careTaskDao.completeTask(taskId);
    if (res) {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.85 } });
      setTodayTasks(roomDb.careTaskDao.getTodayTasks());
      setPlants([...roomDb.plantDao.getAll()]);
    }
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in max-w-7xl mx-auto">
      {/* Top Welcome Context Header */}
      <div className="luxury-card p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34c759]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2c6b4f]">
              Stateful Digital Twin Management System
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172a21] tracking-tight">
            Garden Intelligence Dashboard
          </h1>

          <p className="text-xs sm:text-sm text-[#4a5d52] font-medium max-w-xl leading-relaxed">
            Real-time synchronization of ambient sensor telemetry, ViT taxonomy profiles, and longitudinal digital twins.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('scanner')}
            className="luxury-btn-outline flex items-center gap-2 px-4 py-2.5 text-xs font-semibold"
          >
            <Scan className="w-4 h-4 text-[#2c6b4f]" />
            <span>Launch Scanner</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="luxury-btn-primary flex items-center gap-2 px-4 py-2.5 text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Register Twin</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SECTION 1: AMBIENT WEATHER TELEMETRY & ADVICE */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Weather Telemetry Box (7 Cols) */}
        <div className="lg:col-span-7 luxury-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e8f0e9]">
            <div>
              <h3 className="text-sm font-bold text-[#172a21] tracking-tight">
                Ambient Environmental Telemetry
              </h3>
              <p className="text-xs text-[#83978b] mt-0.5">
                Location: {weather.locationName} • Sensor Sync: {weather.lastUpdated}
              </p>
            </div>

            {/* Microclimate Preset Selector */}
            <div className="flex items-center gap-1 bg-[#f2f7f3] p-1 rounded-full text-xs font-medium">
              {(['balcony', 'indoor', 'greenhouse'] as const).map((loc) => (
                <button
                  key={loc}
                  onClick={() => setMicroclimateLocation(loc)}
                  className={`px-3 py-1 rounded-full transition-all capitalize ${
                    microclimateLocation === loc
                      ? 'bg-white text-[#2c6b4f] font-bold shadow-xs'
                      : 'text-[#4a5d52] hover:text-[#172a21]'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Environmental Sensor Gauge Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="telemetry-tile p-4 space-y-1">
              <span className="text-[10px] font-bold text-[#83978b] uppercase tracking-wider block">
                Temperature
              </span>
              <div className="text-2xl font-bold text-[#172a21]">
                {weather.temperatureC}°C
              </div>
              <span className="text-[10px] text-[#2c6b4f] font-semibold block">
                Target: 18°–28°C
              </span>
            </div>

            <div className="telemetry-tile p-4 space-y-1">
              <span className="text-[10px] font-bold text-[#83978b] uppercase tracking-wider block">
                Humidity
              </span>
              <div className="text-2xl font-bold text-[#172a21]">
                {weather.humidityPercent}%
              </div>
              <span className="text-[10px] text-[#4a5d52] block">Relative RH</span>
            </div>

            <div className="telemetry-tile p-4 space-y-1">
              <span className="text-[10px] font-bold text-[#83978b] uppercase tracking-wider block">
                Solar UV Index
              </span>
              <div className="text-2xl font-bold text-[#172a21]">
                {weather.uvIndex} <span className="text-xs font-normal text-[#83978b]">UV</span>
              </div>
              <span className="text-[10px] text-amber-700 font-semibold block">Moderate Level</span>
            </div>

            <div className="telemetry-tile p-4 space-y-1">
              <span className="text-[10px] font-bold text-[#83978b] uppercase tracking-wider block">
                Precipitation
              </span>
              <div className="text-2xl font-bold text-[#172a21]">
                {weather.rainProbabilityPercent}%
              </div>
              <span className="text-[10px] text-[#2c6b4f] font-semibold block">Auto-Sync On</span>
            </div>
          </div>
        </div>

        {/* AI Microclimate Advisory Box (5 Cols) */}
        <div className="lg:col-span-5 luxury-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e8f0e9]">
            <div>
              <h3 className="text-sm font-bold text-[#172a21] tracking-tight">
                AI Microclimate Advisory
              </h3>
              <p className="text-xs text-[#83978b] mt-0.5">
                Autonomous botanical recommendations
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2c6b4f] bg-[#e8f0e9] border border-[#c5ddc7] px-2.5 py-0.5 rounded-full">
              Real-Time
            </span>
          </div>

          <div className="space-y-3">
            {microclimateAdvice.slice(0, 2).map((adv) => (
              <div
                key={adv.id}
                className="p-4 rounded-2xl bg-[#e8f0e9]/50 border border-[#c5ddc7] space-y-1.5 transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#172a21]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34c759]" />
                  <span>{adv.title.replace(/[^\w\s:()\-]/gi, '').trim()}</span>
                </div>
                <p className="text-xs text-[#4a5d52] leading-relaxed font-normal">
                  {adv.message}
                </p>
                <div className="text-[11px] text-[#2c6b4f] font-semibold pt-1">
                  Protocol: {adv.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SECTION 2: HEALTH STATISTICS GAUGES */}
      {/* =================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <div className="luxury-card p-6 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#83978b] block">
            Average Vitality
          </span>
          <div className="text-3xl font-bold text-[#172a21]">
            {gardenStats.avgHealth}%
          </div>
          <span className="text-xs text-[#4a5d52] font-medium block pt-1">
            {gardenStats.healthyCount} of {gardenStats.total} plants in optimal state
          </span>
        </div>

        <div className="luxury-card p-6 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#83978b] block">
            Persistent Twins
          </span>
          <div className="text-3xl font-bold text-[#172a21]">
            {gardenStats.total}
          </div>
          <span className="text-xs text-[#4a5d52] font-medium block pt-1">
            Room Database synchronized
          </span>
        </div>

        <div className="luxury-card p-6 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#83978b] block">
            Care Consistency
          </span>
          <div className="text-3xl font-bold text-[#2c6b4f]">
            {gardenStats.longestStreak} Days
          </div>
          <span className="text-xs text-[#4a5d52] font-medium block pt-1">
            Unbroken hydration cycle
          </span>
        </div>

        <div className="luxury-card p-6 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#83978b] block">
            Pathology Clearance
          </span>
          <div className="text-3xl font-bold text-[#172a21]">
            94%
          </div>
          <span className="text-xs text-[#4a5d52] font-medium block pt-1">
            Remediated leaf lesions
          </span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SECTION 3: 3D DIGITAL TWIN & DAILY CARE TASKS */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Center Stage 3D Digital Twin Viewer (8 Cols) */}
        <div className="lg:col-span-8 luxury-card overflow-hidden flex flex-col justify-between">
          <div className="p-6 border-b border-[#e8f0e9] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <select
                value={activePlantId}
                onChange={(e) => setActivePlantId(e.target.value)}
                className="bg-[#fbf9f5] border border-[#e8f0e9] text-xs font-bold text-[#172a21] rounded-full px-3.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#2c6b4f]"
              >
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species})
                  </option>
                ))}
              </select>

              <span className="text-xs font-semibold text-[#2c6b4f] bg-[#e8f0e9] px-3 py-0.5 rounded-full border border-[#c5ddc7]">
                {activePlant?.growthStage} Stage
              </span>
            </div>

            <button
              onClick={() => onNavigateTab('plant-detail', { plantId: activePlant?.id })}
              className="text-xs font-semibold text-[#2c6b4f] hover:text-[#1e4d38] flex items-center gap-1 transition-all"
            >
              <span>Profile & Growth Curves</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3D Canvas Viewport in Crisp White Studio */}
          <div className="relative w-full h-[440px]">
            <Plant3DViewer
              growthStage={activePlant?.growthStage || 'HEALTHY'}
              healthState={activePlant?.healthState || 'EXCELLENT'}
              healthScore={activePlant?.healthScore || 90}
              growthScore={activePlant?.growthScore || 70}
              speciesName={activePlant?.species || 'Monstera deliciosa'}
              plantName={activePlant?.name || 'Swiss Monster'}
              isWatering={isWatering}
              isFertilizing={isFertilizing}
              isSunlightActive={isSunlightActive}
            />

            {/* Quick Actions HUD */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-[#e8f0e9] shadow-[0px_4px_16px_rgba(44,107,79,0.08)] flex items-center gap-2.5">
              <button
                onClick={triggerWater}
                disabled={isWatering}
                className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold rounded-full transition-all border border-sky-200/60 flex items-center gap-1.5 hover:-translate-y-0.5"
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>Water</span>
              </button>
              <button
                onClick={triggerFertilize}
                disabled={isFertilizing}
                className="px-3.5 py-1.5 bg-[#e8f0e9] hover:bg-[#d8e7da] text-[#2c6b4f] text-xs font-semibold rounded-full transition-all border border-[#c5ddc7] flex items-center gap-1.5 hover:-translate-y-0.5"
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>Fertilize</span>
              </button>
              <button
                onClick={triggerSunlight}
                className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-full transition-all border border-amber-200/60 flex items-center gap-1.5 hover:-translate-y-0.5"
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Solar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Today's Care Tasks (4 Cols) */}
        <div className="lg:col-span-4 luxury-card p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#e8f0e9]">
            <div>
              <h3 className="text-sm font-bold text-[#172a21] tracking-tight">
                Daily Care Protocol
              </h3>
              <p className="text-xs text-[#83978b] mt-0.5">
                Pending operational tasks
              </p>
            </div>
            <span className="text-xs font-semibold text-[#2c6b4f] bg-[#e8f0e9] border border-[#c5ddc7] px-2.5 py-0.5 rounded-full">
              {todayTasks.length} Due
            </span>
          </div>

          {todayTasks.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#34c759] mx-auto" />
              <p className="text-xs text-[#4a5d52] font-medium">
                All daily care routines completed.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl bg-[#f7faf8] border border-[#e8f0e9] hover:border-[#2c6b4f]/40 transition-all flex items-center justify-between gap-3 hover:-translate-y-0.5"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#172a21] truncate">
                      {task.plantName}
                    </h4>
                    <span className="text-[11px] text-[#4a5d52] block">
                      {task.taskType} • +{task.xpReward} XP
                    </span>
                  </div>

                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className="luxury-btn-primary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1 shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => onNavigateTab('calendar')}
            className="luxury-btn-outline w-full py-2.5 text-xs font-semibold block text-center"
          >
            Open Full Care Calendar
          </button>
        </div>
      </div>
    </div>
  );
};
