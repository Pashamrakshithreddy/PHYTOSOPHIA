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
  ChevronDown,
  ChevronUp,
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
  const [visualizerMode, setVisualizerMode] = useState<'tree' | '3d'>('tree');
  const [expandedAdvisoryId, setExpandedAdvisoryId] = useState<string | null>(null);
  const [advisoryExecutedToast, setAdvisoryExecutedToast] = useState<string | null>(null);

  const [isWatering, setIsWatering] = useState(false);
  const [isFertilizing, setIsFertilizing] = useState(false);
  const [isSunlightActive, setIsSunlightActive] = useState(false);

  const activePlant = plants.find((p) => p.id === activePlantId) || plants[0];
  const weather: WeatherTelemetry = getMicroclimateTelemetry(microclimateLocation);
  const gardenStats = roomDb.plantDao.getGardenStats();
  const outdoorCount = plants.filter((p) => p.location === 'Outdoor').length;
  const microclimateAdvice = generateMicroclimateAdvice(weather, outdoorCount);

  // Check if any plant in the selected location/zone has a severe health issue
  const activeZonePlants = plants.filter((p) => {
    if (microclimateLocation === 'balcony') return p.location === 'Outdoor' || p.roomZone?.includes('Balcony');
    if (microclimateLocation === 'indoor') return p.location === 'Indoor' || p.roomZone?.includes('Living') || p.roomZone?.includes('Bedroom');
    return p.roomZone?.includes('Greenhouse');
  });

  const hasPathologyAlert = activeZonePlants.some((p) => p.healthScore < 75);
  const isMoistureLow = weather.humidityPercent < 45 || activePlant?.healthScore < 80;

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
    setPlants(roomDb.plantDao.getAll());
    setTimeout(() => setIsWatering(false), 2200);
  };

  const triggerFertilize = async () => {
    if (!activePlant) return;
    setIsFertilizing(true);
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.85 } });
    roomDb.fertilizerScheduleDao.logApplication(activePlant.id);
    const updated = roomDb.plantDao.getById(activePlant.id);
    if (updated) setPlants(roomDb.plantDao.getAll());
    setTimeout(() => setIsFertilizing(false), 2200);
  };

  const triggerSunlight = () => {
    setIsSunlightActive(true);
    setTimeout(() => setIsSunlightActive(false), 2200);
  };

  const handleCompleteTask = (taskId: string) => {
    const res = roomDb.careTaskDao.completeTask(taskId);
    if (res) {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.85 } });
      setTodayTasks(roomDb.careTaskDao.getTodayTasks());
      setPlants(roomDb.plantDao.getAll());
    }
  };

  const executeAdvisoryProtocol = (title: string, action: string) => {
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.85 } });
    setAdvisoryExecutedToast(`Executed [${title}]: ${action}`);
    setTimeout(() => setAdvisoryExecutedToast(null), 3500);
  };

  // 30-Day Activity Heatmap simulation data
  const heatmapDays = Array.from({ length: 30 }, (_, i) => {
    const dayNum = 30 - i;
    // Generate organic activity levels (0: none, 1: low, 2: med, 3: high)
    const level = (i % 4 === 0) ? 3 : (i % 3 === 0) ? 2 : (i % 5 === 0) ? 1 : 2;
    return { day: `Day -${dayNum}`, level, count: level * 2 };
  });

  return (
    <div className="space-y-8 pb-24 animate-in fade-in max-w-7xl mx-auto">
      {/* Top Welcome Context Header */}
      <div className="luxury-card p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#729C65]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4E763B]">
              Stateful Digital Twin Management System
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#193C0D] tracking-tight">
            Garden Intelligence Dashboard
          </h1>

          <p className="text-xs sm:text-sm text-[#637462] font-medium max-w-xl leading-relaxed">
            Real-time synchronization of ambient sensor telemetry, ViT taxonomy profiles, and longitudinal digital twins.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('scanner')}
            className="luxury-btn-outline flex items-center gap-2 px-4 py-2.5 text-xs font-semibold"
          >
            <Scan className="w-4 h-4 text-[#4E763B]" />
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

      {advisoryExecutedToast && (
        <div className="bg-[#F4F7F2] border border-[#6D835C] text-[#193C0D] text-xs font-semibold px-4 py-3 rounded-2xl shadow-xs flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#729C65]" />
            {advisoryExecutedToast}
          </span>
          <button onClick={() => setAdvisoryExecutedToast(null)} className="text-[#637462] hover:text-[#193C0D]">✕</button>
        </div>
      )}

      {/* =================================================================== */}
      {/* SECTION 1: AMBIENT WEATHER TELEMETRY & ADVISORY */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Weather Telemetry Box (7 Cols) */}
        <div className="lg:col-span-7 luxury-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4ECE2]">
            <div>
              <h3 className="text-sm font-bold text-[#193C0D] tracking-tight">
                Ambient Environmental Telemetry
              </h3>
              <p className="text-xs text-[#637462] mt-0.5">
                Location: {weather.locationName} • Sensor Sync: {weather.lastUpdated}
              </p>
            </div>

            {/* Microclimate Preset Selector */}
            <div className="flex items-center gap-1 bg-[#F4F7F2] p-1 rounded-full text-xs font-medium border border-[#E4ECE2]">
              {(['balcony', 'indoor', 'greenhouse'] as const).map((loc) => (
                <button
                  key={loc}
                  onClick={() => setMicroclimateLocation(loc)}
                  className={`px-3 py-1 rounded-full transition-all capitalize ${
                    microclimateLocation === loc
                      ? 'bg-[#6D835C] text-white font-bold shadow-xs'
                      : 'text-[#637462] hover:text-[#193C0D]'
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
              <span className="text-[10px] font-bold text-[#637462] uppercase tracking-wider block">
                Temperature
              </span>
              <div className="text-2xl font-bold text-[#193C0D]">
                {weather.temperatureC}°C
              </div>
              <span className="text-[10px] text-[#4E763B] font-semibold block">
                Target: 18°–28°C
              </span>
            </div>

            <div className="telemetry-tile p-4 space-y-1">
              <span className="text-[10px] font-bold text-[#637462] uppercase tracking-wider block">
                Humidity
              </span>
              <div className="text-2xl font-bold text-[#193C0D]">
                {weather.humidityPercent}%
              </div>
              <span className="text-[10px] text-[#637462] block">Relative RH</span>
            </div>

            <div className="telemetry-tile p-4 space-y-1">
              <span className="text-[10px] font-bold text-[#637462] uppercase tracking-wider block">
                Solar UV Index
              </span>
              <div className="text-2xl font-bold text-[#193C0D]">
                {weather.uvIndex} <span className="text-xs font-normal text-[#637462]">UV</span>
              </div>
              <span className="text-[10px] text-amber-700 font-semibold block">Moderate Level</span>
            </div>

            <div className="telemetry-tile p-4 space-y-1">
              <span className="text-[10px] font-bold text-[#637462] uppercase tracking-wider block">
                Precipitation
              </span>
              <div className="text-2xl font-bold text-[#193C0D]">
                {weather.rainProbabilityPercent}%
              </div>
              <span className="text-[10px] text-[#4E763B] font-semibold block">Auto-Sync On</span>
            </div>
          </div>
        </div>

        {/* AI Microclimate Advisory Box (5 Cols) with Expandable Protocols */}
        <div className="lg:col-span-5 luxury-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4ECE2]">
            <div>
              <h3 className="text-sm font-bold text-[#193C0D] tracking-tight">
                AI Microclimate Advisory
              </h3>
              <p className="text-xs text-[#637462] mt-0.5">
                Autonomous botanical recommendations
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4E763B] bg-[#F4F7F2] border border-[#6D835C]/30 px-2.5 py-0.5 rounded-full">
              Real-Time
            </span>
          </div>

          <div className="space-y-3">
            {microclimateAdvice.slice(0, 2).map((adv) => {
              const isExpanded = expandedAdvisoryId === adv.id;

              return (
                <div
                  key={adv.id}
                  className="p-4 rounded-2xl bg-[#F4F7F2] border border-[#E4ECE2] space-y-2 transition-all hover:border-[#6D835C]"
                >
                  <div
                    onClick={() => setExpandedAdvisoryId(isExpanded ? null : adv.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-[#193C0D]">
                      <span className="w-2 h-2 rounded-full bg-[#729C65]" />
                      <span>{adv.title.replace(/[^\w\s:()\-]/gi, '').trim()}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#637462]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#637462]" />
                    )}
                  </div>

                  <p className="text-xs text-[#637462] leading-relaxed font-normal">
                    {adv.message}
                  </p>

                  {/* Expandable Protocol Action Section */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-[#E4ECE2] space-y-2 animate-in fade-in">
                      <div className="text-[11px] text-[#4E763B] font-semibold">
                        Action Protocol: {adv.recommendedAction}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => executeAdvisoryProtocol(adv.title, adv.recommendedAction)}
                          className="luxury-btn-primary px-3 py-1.5 text-[11px]"
                        >
                          Deploy Recommended Action
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SECTION 2: BOTANICAL VISUALIZER & DAILY TASKS */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Center Stage: Animated Botanical Tree / 3D Viewer (8 Cols) */}
        <div className="lg:col-span-8 luxury-card overflow-hidden flex flex-col justify-between">
          <div className="p-6 border-b border-[#E4ECE2] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <select
                value={activePlantId}
                onChange={(e) => setActivePlantId(e.target.value)}
                className="bg-[#F7F9F5] border border-[#E4ECE2] text-xs font-bold text-[#193C0D] rounded-full px-3.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#4E763B]"
              >
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species})
                  </option>
                ))}
              </select>

              <span className="text-xs font-semibold text-[#4E763B] bg-[#F4F7F2] px-3 py-0.5 rounded-full border border-[#6D835C]/30">
                {activePlant?.growthStage} Stage
              </span>
            </div>

            {/* Toggle between Animated Botanical System Tree & 3D WebGL Model */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#F4F7F2] p-1 rounded-full border border-[#E4ECE2] text-xs font-semibold">
                <button
                  onClick={() => setVisualizerMode('tree')}
                  className={`px-3 py-1 rounded-full transition-all ${
                    visualizerMode === 'tree' ? 'bg-[#6D835C] text-white shadow-xs' : 'text-[#637462]'
                  }`}
                >
                  Botanical SVG Tree
                </button>
                <button
                  onClick={() => setVisualizerMode('3d')}
                  className={`px-3 py-1 rounded-full transition-all ${
                    visualizerMode === '3d' ? 'bg-[#6D835C] text-white shadow-xs' : 'text-[#637462]'
                  }`}
                >
                  3D Digital Twin
                </button>
              </div>

              <button
                onClick={() => onNavigateTab('plant-detail', { plantId: activePlant?.id })}
                className="text-xs font-semibold text-[#4E763B] hover:text-[#193C0D] flex items-center gap-1 transition-all"
              >
                <span>Curves</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Visualizer Stage Container */}
          <div className="relative w-full h-[450px] bg-gradient-to-b from-[#FFFFFF] to-[#F7F9F5] flex items-center justify-center overflow-hidden">
            {visualizerMode === 'tree' ? (
              /* ANIMATED SVG BOTANICAL SYSTEM TREE */
              <div className="relative w-full h-full flex items-center justify-center select-none">
                {/* SVG Botanical Graphic with Status Glow & Swaying Foliage */}
                <svg className="w-80 h-80 sm:w-96 sm:h-96" viewBox="0 0 300 300">
                  {/* Subtle Growth Progress Ring */}
                  <circle
                    cx="150"
                    cy="150"
                    r="135"
                    fill="none"
                    stroke="#E4ECE2"
                    strokeWidth="4"
                    strokeDasharray="4 6"
                  />
                  <circle
                    cx="150"
                    cy="150"
                    r="135"
                    fill="none"
                    stroke={hasPathologyAlert ? '#D32F2F' : '#729C65'}
                    strokeWidth="4"
                    strokeDasharray="850"
                    strokeDashoffset={850 - (850 * (activePlant?.healthScore || 85)) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />

                  {/* Planter Pot Base */}
                  <path
                    d="M 120 235 L 180 235 L 172 270 L 128 270 Z"
                    fill="#E4ECE2"
                    stroke="#6D835C"
                    strokeWidth="2"
                  />
                  <ellipse cx="150" cy="235" rx="30" ry="6" fill="#637462" opacity="0.25" />

                  {/* Central Stem Trunk */}
                  <path
                    d="M 150 235 Q 146 180 150 130 Q 152 90 150 65"
                    fill="none"
                    stroke="#193C0D"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />

                  {/* Secondary Branches */}
                  <path d="M 148 185 Q 125 170 105 160" fill="none" stroke="#4E763B" strokeWidth="4.5" strokeLinecap="round" />
                  <path d="M 150 165 Q 175 145 195 135" fill="none" stroke="#4E763B" strokeWidth="4.5" strokeLinecap="round" />
                  <path d="M 149 135 Q 120 115 100 100" fill="none" stroke="#4E763B" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M 150 115 Q 180 95 200 80" fill="none" stroke="#4E763B" strokeWidth="3.5" strokeLinecap="round" />

                  {/* Dynamic Botanical Leaves Group with Sway Animation */}
                  <g className="animate-leaf-sway">
                    {/* Top Central Apical Leaf */}
                    <path
                      d="M 150 65 C 138 45 142 25 150 15 C 158 25 162 45 150 65 Z"
                      fill={hasPathologyAlert ? '#D32F2F' : isMoistureLow ? '#6D835C' : '#729C65'}
                      stroke="#193C0D"
                      strokeWidth="1.5"
                    />

                    {/* Left Upper Leaf */}
                    <path
                      d="M 100 100 C 80 90 75 70 85 55 C 98 65 108 82 100 100 Z"
                      fill={hasPathologyAlert ? '#D32F2F' : isMoistureLow ? '#6D835C' : '#729C65'}
                      stroke="#193C0D"
                      strokeWidth="1.5"
                    />

                    {/* Right Upper Leaf */}
                    <path
                      d="M 200 80 C 220 70 230 55 220 40 C 205 50 195 68 200 80 Z"
                      fill={isMoistureLow ? '#6D835C' : '#729C65'}
                      stroke="#193C0D"
                      strokeWidth="1.5"
                    />

                    {/* Left Lower Leaf (Pathology Alert Beacon if active) */}
                    <path
                      d="M 105 160 C 82 155 70 140 76 122 C 92 130 105 145 105 160 Z"
                      fill={hasPathologyAlert ? '#D32F2F' : '#6D835C'}
                      stroke="#193C0D"
                      strokeWidth="1.5"
                      className={hasPathologyAlert ? 'animate-pulse' : ''}
                    />

                    {/* Right Lower Leaf */}
                    <path
                      d="M 195 135 C 220 135 235 120 230 100 C 212 110 200 125 195 135 Z"
                      fill={isMoistureLow ? '#6D835C' : '#729C65'}
                      stroke="#193C0D"
                      strokeWidth="1.5"
                    />
                  </g>
                </svg>

                {/* Status Float Badges */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#E4ECE2] text-xs font-semibold shadow-xs flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${hasPathologyAlert ? 'bg-[#D32F2F] animate-ping' : 'bg-[#729C65]'}`} />
                  <span className="text-[#193C0D]">
                    {hasPathologyAlert ? 'Zone Pathology Alert' : isMoistureLow ? 'Moisture Low' : 'Optimal Telemetry'}
                  </span>
                </div>

                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#E4ECE2] text-xs font-bold text-[#4E763B] shadow-xs">
                  Vitality: {activePlant?.healthScore || 88}%
                </div>
              </div>
            ) : (
              /* 3D WebGL Digital Twin */
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
            )}

            {/* Quick Actions HUD Toolbar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-[#E4ECE2] shadow-[0px_4px_16px_rgba(25,60,13,0.08)] flex items-center gap-2.5 z-20">
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
                className="px-3.5 py-1.5 bg-[#F4F7F2] hover:bg-[#E4ECE2] text-[#4E763B] text-xs font-semibold rounded-full transition-all border border-[#6D835C]/30 flex items-center gap-1.5 hover:-translate-y-0.5"
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

        {/* Daily Care Protocol (4 Cols) */}
        <div className="lg:col-span-4 luxury-card p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4ECE2]">
            <div>
              <h3 className="text-sm font-bold text-[#193C0D] tracking-tight">
                Daily Care Protocol
              </h3>
              <p className="text-xs text-[#637462] mt-0.5">
                Pending operational tasks
              </p>
            </div>
            <span className="text-xs font-semibold text-[#4E763B] bg-[#F4F7F2] border border-[#6D835C]/30 px-2.5 py-0.5 rounded-full">
              {todayTasks.length} Due
            </span>
          </div>

          {todayTasks.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#729C65] mx-auto" />
              <p className="text-xs text-[#637462] font-medium">
                All daily care routines completed.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl bg-[#F7F9F5] border border-[#E4ECE2] hover:border-[#6D835C] transition-all flex items-center justify-between gap-3 hover:-translate-y-0.5"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#193C0D] truncate">
                      {task.plantName}
                    </h4>
                    <span className="text-[11px] text-[#637462] block">
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

      {/* =================================================================== */}
      {/* SECTION 3: COMPLETE BOTTOM ROW METRICS (ZERO WHITESPACE) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Average Vitality Index (Radial Meter) */}
        <div className="luxury-card p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#637462]">
                Average Vitality Index
              </span>
              <span className="text-xs font-bold text-[#729C65] bg-[#F4F7F2] px-2 py-0.5 rounded-full border border-[#E4ECE2]">
                Optimal Tier
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#193C0D] mt-1">Garden Health Aggregate</h4>
          </div>

          {/* Radial SVG Gauge */}
          <div className="flex items-center justify-center relative py-2">
            <svg className="w-32 h-32" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#E4ECE2"
                strokeWidth="9"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#729C65"
                strokeWidth="9"
                strokeDasharray="251"
                strokeDashoffset={251 - (251 * gardenStats.avgHealth) / 100}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-[#193C0D]">{gardenStats.avgHealth}%</span>
              <span className="text-[10px] font-semibold text-[#637462]">Optimal</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E4ECE2] text-xs text-[#637462] flex justify-between">
            <span>Healthy Twins: {gardenStats.healthyCount}/{gardenStats.total}</span>
            <span className="text-[#4E763B] font-semibold">Tier 1 Vigor</span>
          </div>
        </div>

        {/* Metric 2: Persistent Twins Grid */}
        <div className="luxury-card p-6 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#637462]">
              Persistent Twins
            </span>
            <span className="text-[10px] font-bold text-[#4E763B] bg-[#F4F7F2] px-2 py-0.5 rounded-full border border-[#E4ECE2]">
              {plants.length} Synced
            </span>
          </div>

          {/* Mini Thumbnail Grid */}
          <div className="space-y-2 max-h-36 overflow-y-auto no-scrollbar">
            {plants.slice(0, 3).map((p) => (
              <div
                key={p.id}
                onClick={() => onNavigateTab('plant-detail', { plantId: p.id })}
                className="p-2 rounded-xl bg-[#F7F9F5] border border-[#E4ECE2] hover:border-[#6D835C] transition-all flex items-center justify-between gap-2 cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#193C0D] block truncate">{p.name}</span>
                    <span className="text-[10px] text-[#637462] block truncate">{p.species}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  p.healthScore >= 80 ? 'bg-[#F4F7F2] text-[#4E763B]' : 'bg-[#FFEBEE] text-[#D32F2F]'
                }`}>
                  {p.healthScore}%
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateTab('plants')}
            className="w-full py-1.5 text-[11px] font-semibold text-[#4E763B] hover:text-[#193C0D] bg-[#F4F7F2] rounded-full border border-[#E4ECE2]"
          >
            View All Garden Twins
          </button>
        </div>

        {/* Metric 3: 30-Day Care Consistency Heatmap */}
        <div className="luxury-card p-6 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#637462]">
              Care Consistency
            </span>
            <span className="text-xs font-bold text-[#4E763B] flex items-center gap-1">
              🔥 {gardenStats.longestStreak} Days
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-[#637462]">30-Day Hydration & Pruning Matrix:</span>
            {/* Heatmap Grid */}
            <div className="grid grid-cols-6 gap-1.5 py-1">
              {heatmapDays.map((d, i) => (
                <div
                  key={i}
                  title={`${d.day}: ${d.count} actions recorded`}
                  className={`h-5 rounded-md transition-all cursor-pointer ${
                    d.level === 3
                      ? 'bg-[#4E763B]'
                      : d.level === 2
                      ? 'bg-[#729C65]'
                      : d.level === 1
                      ? 'bg-[#6D835C]/40'
                      : 'bg-[#E4ECE2]'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#E4ECE2] flex items-center justify-between text-[10px] text-[#637462]">
            <span>Less Active</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[#E4ECE2]" />
              <span className="w-2.5 h-2.5 rounded bg-[#6D835C]/40" />
              <span className="w-2.5 h-2.5 rounded bg-[#729C65]" />
              <span className="w-2.5 h-2.5 rounded bg-[#4E763B]" />
            </div>
            <span>High Vigor</span>
          </div>
        </div>

        {/* Metric 4: Pathology Clearance Donut Chart */}
        <div className="luxury-card p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#637462]">
              Pathology Clearance
            </span>
            <span className="text-xs font-bold text-[#729C65] bg-[#F4F7F2] px-2 py-0.5 rounded-full border border-[#E4ECE2]">
              94% Cured
            </span>
          </div>

          {/* Donut Chart */}
          <div className="flex items-center justify-center relative py-2">
            <svg className="w-32 h-32" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#FFEBEE"
                strokeWidth="11"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#4E763B"
                strokeWidth="11"
                strokeDasharray="238"
                strokeDashoffset={238 - (238 * 0.94)}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-[#193C0D]">94%</span>
              <span className="text-[9px] font-bold text-[#4E763B]">Cleared</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E4ECE2] text-xs text-[#637462] flex justify-between">
            <span>Remediated Lesions</span>
            <span className="text-[#4E763B] font-semibold">1 Active Case</span>
          </div>
        </div>
      </div>
    </div>
  );
};
