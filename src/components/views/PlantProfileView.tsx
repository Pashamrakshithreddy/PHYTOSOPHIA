import React, { useState } from 'react';
import { roomDb, type PlantEntity } from '../../services/roomDatabase';
import { Plant3DViewer } from '../3d/Plant3DViewer';
import { PdfReportModal } from '../modals/PdfReportModal';
import {
  ArrowLeft,
  Droplets,
  Sun,
  Sprout,
  Scan,
  FileText,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlantProfileViewProps {
  plantId: string;
  onBack: () => void;
  onNavigateTab: (tab: string, extraData?: any) => void;
}

export const PlantProfileView: React.FC<PlantProfileViewProps> = ({
  plantId,
  onBack,
  onNavigateTab,
}) => {
  const [plant, setPlant] = useState<PlantEntity | undefined>(() => roomDb.plantDao.getById(plantId));
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isWatering, setIsWatering] = useState<boolean>(false);
  const [isFertilizing, setIsFertilizing] = useState<boolean>(false);
  const [isSunlightActive, setIsSunlightActive] = useState<boolean>(false);
  const [activeChartMetric, setActiveChartMetric] = useState<'height' | 'leaves' | 'health'>('height');
  const [fertilizerLoggedToast, setFertilizerLoggedToast] = useState<string | null>(null);

  if (!plant) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-[#83978b]">Digital Twin not found in Room Database.</p>
        <button
          onClick={onBack}
          className="luxury-btn-forest px-4 py-2 text-xs font-semibold"
        >
          Return to My Garden
        </button>
      </div>
    );
  }

  const growthHistory = roomDb.growthHistoryDao.getByPlantId(plant.id);
  const fertilizerSchedule = roomDb.fertilizerScheduleDao.getByPlantId(plant.id);

  const triggerWater = async () => {
    setIsWatering(true);
    confetti({ particleCount: 30, spread: 45, origin: { y: 0.85 } });
    const now = new Date().toISOString();
    const updated = {
      ...plant,
      lastWatered: now,
      healthScore: Math.min(100, plant.healthScore + 2),
      careStreak: (plant.careStreak || 0) + 1,
    };
    roomDb.plantDao.update(updated);
    setPlant(updated);
    setTimeout(() => setIsWatering(false), 2500);
  };

  const triggerFertilize = async () => {
    setIsFertilizing(true);
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.85 } });
    roomDb.fertilizerScheduleDao.logApplication(plant.id, 'Routine feeding via Digital Twin console');
    const updated = roomDb.plantDao.getById(plant.id);
    if (updated) setPlant(updated);
    setFertilizerLoggedToast('Fertilizer application recorded in Room DB.');
    setTimeout(() => {
      setIsFertilizing(false);
      setFertilizerLoggedToast(null);
    }, 3500);
  };

  const triggerSunlight = () => {
    setIsSunlightActive(true);
    setTimeout(() => setIsSunlightActive(false), 2500);
  };

  // Interactive Growth Curve SVG points calculation
  const maxVal = Math.max(
    ...growthHistory.map((g) =>
      activeChartMetric === 'height'
        ? g.heightCm
        : activeChartMetric === 'leaves'
        ? g.leafCount
        : g.healthScore
    ),
    activeChartMetric === 'health' ? 100 : 50
  );

  const chartPoints = growthHistory.map((g, idx) => {
    const x = growthHistory.length > 1 ? (idx / (growthHistory.length - 1)) * 400 + 40 : 240;
    const val =
      activeChartMetric === 'height'
        ? g.heightCm
        : activeChartMetric === 'leaves'
        ? g.leafCount
        : g.healthScore;
    const y = 160 - (val / maxVal) * 120;
    return { x, y, val, date: g.date, event: g.event, stage: g.stage };
  });

  const svgPathD =
    chartPoints.length > 1
      ? chartPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '')
      : '';

  return (
    <div className="space-y-8 pb-24 animate-in fade-in max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="luxury-btn-outline flex items-center gap-2 px-4 py-2 text-xs font-semibold self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Garden</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#2c6b4f] bg-[#e8f0e9] px-3.5 py-1.5 rounded-full border border-[#c5ddc7] font-semibold">
            Twin ID: {plant.id}
          </span>

          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="luxury-btn-primary flex items-center gap-2 px-4 py-2 text-xs font-semibold"
          >
            <FileText className="w-4 h-4" />
            <span>Generate A4 Dossier</span>
          </button>
        </div>
      </div>

      {fertilizerLoggedToast && (
        <div className="bg-[#e8f0e9] border border-[#c5ddc7] text-[#172a21] text-xs font-semibold px-4 py-3 rounded-2xl shadow-xs flex items-center justify-between animate-in fade-in">
          <span>{fertilizerLoggedToast}</span>
          <CheckCircle2 className="w-4 h-4 text-[#34c759]" />
        </div>
      )}

      {/* 3D Visualizer Studio */}
      <div className="relative w-full h-[470px] rounded-[24px] overflow-hidden border border-[#e8f0e9] luxury-card">
        <Plant3DViewer
          growthStage={plant.growthStage}
          healthState={plant.healthState}
          healthScore={plant.healthScore}
          growthScore={plant.growthScore}
          speciesName={plant.species}
          plantName={plant.name}
          isWatering={isWatering}
          isFertilizing={isFertilizing}
          isSunlightActive={isSunlightActive}
        />

        {/* Floating Quick Care Action HUD */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-[#e8f0e9] shadow-[0px_4px_16px_rgba(44,107,79,0.08)] flex items-center gap-2 z-30">
          <button
            onClick={triggerWater}
            disabled={isWatering}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold rounded-full border border-sky-200/60 transition-all hover:-translate-y-0.5"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Water</span>
          </button>

          <button
            onClick={triggerFertilize}
            disabled={isFertilizing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#e8f0e9] hover:bg-[#d8e7da] text-[#2c6b4f] text-xs font-semibold rounded-full border border-[#c5ddc7] transition-all hover:-translate-y-0.5"
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Fertilize</span>
          </button>

          <button
            onClick={triggerSunlight}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-full border border-amber-200/60 transition-all hover:-translate-y-0.5"
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Solar</span>
          </button>

          <button
            onClick={() => onNavigateTab('scanner', { plantId: plant.id })}
            className="luxury-btn-forest flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>AI Scan</span>
          </button>
        </div>
      </div>

      {/* Botanical Health Meters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <div className="luxury-card p-6 space-y-1">
          <span className="text-[10px] font-bold uppercase text-[#83978b] tracking-wider block">
            Vitality Index
          </span>
          <div className="text-3xl font-bold text-[#172a21]">
            {plant.healthScore}%
          </div>
          <div className="w-full bg-[#e8f0e9] h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-[#34c759] h-full rounded-full transition-all duration-700"
              style={{ width: `${plant.healthScore}%` }}
            />
          </div>
        </div>

        <div className="luxury-card p-6 space-y-1">
          <span className="text-[10px] font-bold uppercase text-[#83978b] tracking-wider block">
            Chlorosis Risk
          </span>
          <div className="text-3xl font-bold text-[#172a21]">
            {100 - plant.healthScore < 15 ? 'Low' : 'Moderate'}
          </div>
          <div className="w-full bg-[#e8f0e9] h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-[#2c6b4f] h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.max(10, 100 - plant.healthScore)}%` }}
            />
          </div>
        </div>

        <div className="luxury-card p-6 space-y-1">
          <span className="text-[10px] font-bold uppercase text-[#83978b] tracking-wider block">
            Root Hydration
          </span>
          <div className="text-3xl font-bold text-[#172a21]">
            Optimal
          </div>
          <div className="w-full bg-[#e8f0e9] h-2 rounded-full overflow-hidden mt-2">
            <div className="bg-sky-500 h-full rounded-full transition-all duration-700" style={{ width: '64%' }} />
          </div>
        </div>

        <div className="luxury-card p-6 space-y-1">
          <span className="text-[10px] font-bold uppercase text-[#83978b] tracking-wider block">
            Care Streak
          </span>
          <div className="text-3xl font-bold text-[#2c6b4f]">
            {plant.careStreak} Days
          </div>
          <div className="w-full bg-[#e8f0e9] h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-[#34c759] h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, plant.careStreak * 6)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Growth Curve Section */}
      <div className="luxury-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#172a21] tracking-tight">
              Interactive Longitudinal Growth Curve
            </h3>
            <p className="text-xs text-[#83978b] mt-0.5">
              Select metrics to plot height, foliar count, and vitality checkpoints.
            </p>
          </div>

          {/* Metric Selector Pills */}
          <div className="flex items-center gap-1 bg-[#f2f7f3] p-1 rounded-full text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setActiveChartMetric('height')}
              className={`px-3 py-1 rounded-full transition-all ${
                activeChartMetric === 'height'
                  ? 'bg-white text-[#2c6b4f] font-bold shadow-xs'
                  : 'text-[#4a5d52]'
              }`}
            >
              Height (cm)
            </button>
            <button
              onClick={() => setActiveChartMetric('leaves')}
              className={`px-3 py-1 rounded-full transition-all ${
                activeChartMetric === 'leaves'
                  ? 'bg-white text-[#2c6b4f] font-bold shadow-xs'
                  : 'text-[#4a5d52]'
              }`}
            >
              Leaf Count
            </button>
            <button
              onClick={() => setActiveChartMetric('health')}
              className={`px-3 py-1 rounded-full transition-all ${
                activeChartMetric === 'health'
                  ? 'bg-white text-[#2c6b4f] font-bold shadow-xs'
                  : 'text-[#4a5d52]'
              }`}
            >
              Health Score (%)
            </button>
          </div>
        </div>

        {/* SVG Interactive Growth Chart */}
        <div className="relative w-full h-56 bg-[#f7faf8] rounded-2xl p-4 overflow-hidden border border-[#e8f0e9]">
          <svg className="w-full h-full" viewBox="0 0 480 180" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="20" y1="40" x2="460" y2="40" stroke="#e8f0e9" strokeDasharray="3 3" />
            <line x1="20" y1="90" x2="460" y2="90" stroke="#e8f0e9" strokeDasharray="3 3" />
            <line x1="20" y1="140" x2="460" y2="140" stroke="#e8f0e9" strokeDasharray="3 3" />

            {/* Growth Curve Polyline */}
            {svgPathD && (
              <path
                d={svgPathD}
                fill="none"
                stroke="#2c6b4f"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Checkpoint Nodes */}
            {chartPoints.map((pt, idx) => (
              <g key={idx} className="group cursor-pointer">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  className="fill-[#34c759] stroke-white stroke-2 hover:r-7 transition-all"
                />
                <title>{`${pt.date}: ${pt.val} (${pt.stage}) - ${pt.event}`}</title>
              </g>
            ))}
          </svg>

          {/* X-Axis Dates */}
          <div className="flex justify-between text-[10px] text-[#83978b] font-medium px-4 pt-1">
            {growthHistory.map((g, i) => (
              <span key={i}>{g.date}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Care Specifications & Fertilizer Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="luxury-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-[#2c6b4f] font-bold text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4 text-[#2c6b4f]" />
            Care Specifications
          </div>
          <h4 className="text-base font-bold text-[#172a21]">
            Biological Parameters
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#f7faf8] rounded-xl border border-[#e8f0e9]">
              <span className="text-[10px] text-[#83978b] block font-semibold">Sunlight</span>
              <strong className="text-[#172a21]">{plant.sunlight}</strong>
            </div>

            <div className="p-3 bg-[#f7faf8] rounded-xl border border-[#e8f0e9]">
              <span className="text-[10px] text-[#83978b] block font-semibold">Water Interval</span>
              <strong className="text-[#172a21]">Every {plant.waterIntervalDays} days</strong>
            </div>

            <div className="p-3 bg-[#f7faf8] rounded-xl border border-[#e8f0e9]">
              <span className="text-[10px] text-[#83978b] block font-semibold">Temperature</span>
              <strong className="text-[#172a21]">{plant.idealTempRange}</strong>
            </div>

            <div className="p-3 bg-[#f7faf8] rounded-xl border border-[#e8f0e9]">
              <span className="text-[10px] text-[#83978b] block font-semibold">Humidity</span>
              <strong className="text-[#172a21]">{plant.idealHumidityRange}</strong>
            </div>

            <div className="p-3 bg-[#f7faf8] rounded-xl border border-[#e8f0e9]">
              <span className="text-[10px] text-[#83978b] block font-semibold">Soil EC Target</span>
              <strong className="text-[#172a21]">{plant.soilEcTarget}</strong>
            </div>

            <div className="p-3 bg-[#f7faf8] rounded-xl border border-[#e8f0e9]">
              <span className="text-[10px] text-[#83978b] block font-semibold">Pet Safety</span>
              <strong className={plant.petSafe ? 'text-[#2c6b4f]' : 'text-rose-700'}>
                {plant.petSafe ? 'Pet Safe' : 'Toxic to Pets'}
              </strong>
            </div>
          </div>
        </div>

        <div className="luxury-card p-6 sm:p-8 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#2c6b4f] font-bold text-xs uppercase tracking-wider">
                <Sprout className="w-4 h-4 text-[#34c759]" />
                Fertilizer Schedule Tracking
              </div>
              <span className="text-xs font-semibold text-[#2c6b4f] bg-[#e8f0e9] px-2.5 py-0.5 rounded-full border border-[#c5ddc7]">
                NPK {fertilizerSchedule?.npkRatio || '3-1-2'}
              </span>
            </div>

            <h4 className="text-base font-bold text-[#172a21]">
              {fertilizerSchedule?.formula || 'Balanced Tropical Liquid Formulation'}
            </h4>

            <p className="text-xs text-[#4a5d52]">
              Dosage: {fertilizerSchedule?.dosageRecommendation || '5ml diluted in 2L water every 14 days.'}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-[#f7faf8] rounded-xl border border-[#e8f0e9]">
                <span className="text-[10px] text-[#83978b] block font-semibold">Last Applied</span>
                <strong className="text-[#172a21]">
                  {fertilizerSchedule?.lastApplied.split('T')[0] || plant.lastFertilized.split('T')[0]}
                </strong>
              </div>

              <div className="p-3 bg-[#f7faf8] rounded-xl border border-[#e8f0e9]">
                <span className="text-[10px] text-[#83978b] block font-semibold">Next Scheduled Due</span>
                <strong className="text-[#2c6b4f]">
                  {fertilizerSchedule?.nextDue.split('T')[0] || 'In 7 days'}
                </strong>
              </div>
            </div>
          </div>

          <button
            onClick={triggerFertilize}
            disabled={isFertilizing}
            className="luxury-btn-forest w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 mt-4"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Record Fertilizer Application (+35 XP)</span>
          </button>
        </div>
      </div>

      {/* PDF Report Modal */}
      <PdfReportModal
        plantId={plant.id}
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />
    </div>
  );
};
