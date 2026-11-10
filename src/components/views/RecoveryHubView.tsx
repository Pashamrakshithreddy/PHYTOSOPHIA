import React, { useState } from 'react';
import { roomDb, type ScanLogEntity } from '../../services/roomDatabase';
import {
  Layers,
  Grid3X3,
  GitCompare,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface RecoveryHubViewProps {
  onNavigateTab?: (tab: string, extraData?: any) => void;
}

export const RecoveryHubView: React.FC<RecoveryHubViewProps> = () => {
  const [viewMode, setViewMode] = useState<'compare' | 'timeline' | 'grid'>('compare');
  const [selectedPlantId, setSelectedPlantId] = useState<string>('plant-monstera-1');
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  const plants = roomDb.plantDao.getAll();
  const allScans = roomDb.scanLogDao.getAll();
  const currentPlant = plants.find((p) => p.id === selectedPlantId) || plants[0];
  const plantScans = roomDb.scanLogDao.getByPlantId(currentPlant?.id || '');

  // Compare pair
  const recoveryPair = roomDb.scanLogDao.getRecoveryPair(currentPlant?.id || '');
  const beforeScan: ScanLogEntity | undefined = recoveryPair.before || plantScans[plantScans.length - 1];
  const afterScan: ScanLogEntity | undefined = recoveryPair.after || plantScans[0];

  const healthDelta =
    afterScan?.pathology && beforeScan?.pathology
      ? afterScan.pathology.healthScore - beforeScan.pathology.healthScore
      : 24;

  const daysBetween =
    afterScan && beforeScan
      ? Math.max(
          1,
          Math.round(
            (new Date(afterScan.timestamp).getTime() - new Date(beforeScan.timestamp).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 16;

  return (
    <div className="space-y-10 pb-24 animate-in fade-in max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="luxury-card rounded-3xl p-8 sm:p-10 border border-slate-200/70 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Longitudinal Recovery Tracking & Analytics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Scan Gallery & Recovery Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl">
            Track digital twin recovery from pathology over time using Segment Anything Model (SAM) scans, chronological timelines, and interactive before-and-after comparison.
          </p>
        </div>

        {/* View Mode Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start md:self-auto shrink-0">
          <button
            onClick={() => setViewMode('compare')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'compare'
                ? 'bg-white text-emerald-800 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Before & After</span>
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'timeline'
                ? 'bg-white text-emerald-800 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-emerald-800 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Gallery ({allScans.length})</span>
          </button>
        </div>
      </div>

      {/* Plant Selector Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/80 luxury-shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600">Filter by Digital Twin:</span>
          <select
            value={selectedPlantId}
            onChange={(e) => setSelectedPlantId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {plants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.species})
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          {plantScans.length} historical scan checkpoints recorded
        </span>
      </div>

      {/* ================================================================= */}
      {/* MODE 1: BEFORE & AFTER SLIDER COMPARISON */}
      {/* ================================================================= */}
      {viewMode === 'compare' && (
        <div className="space-y-8">
          {/* Recovery Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="luxury-card rounded-3xl p-6 border border-slate-200/70 bg-white space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Health Delta</span>
              <div className="text-3xl font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                +{healthDelta}%
              </div>
              <span className="text-xs text-slate-500 font-medium">From {beforeScan?.pathology?.healthScore || 68}% to {afterScan?.pathology?.healthScore || 92}%</span>
            </div>

            <div className="luxury-card rounded-3xl p-6 border border-slate-200/70 bg-white space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lesion Area Decrease</span>
              <div className="text-3xl font-bold text-slate-900">
                -78%
              </div>
              <span className="text-xs text-slate-500 font-medium">SAM segmentation area reduction</span>
            </div>

            <div className="luxury-card rounded-3xl p-6 border border-slate-200/70 bg-white space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remediation Window</span>
              <div className="text-3xl font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-5 h-5 text-sky-600" />
                {daysBetween} Days
              </div>
              <span className="text-xs text-slate-500 font-medium">RAG treatment execution</span>
            </div>

            <div className="luxury-card rounded-3xl p-6 border border-slate-200/70 bg-white space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recovery Verdict</span>
              <div className="text-lg font-bold text-emerald-700 mt-2">
                Tissue Remediated
              </div>
              <span className="text-xs text-slate-500 font-medium">Cellular vigor restored</span>
            </div>
          </div>

          {/* Interactive Split-Screen Slider Card */}
          <div className="luxury-card rounded-3xl p-6 sm:p-8 border border-slate-200/70 bg-white space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Interactive Before & After Split Visualizer
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Drag the slider handle to inspect tissue repigmentation and lesion clearing.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Baseline Scan (Day 0)
                </span>
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Recovery Scan (Day {daysBetween})
                </span>
              </div>
            </div>

            {/* Visualizer Frame in Clean White Container */}
            <div className="relative w-full h-[400px] sm:h-[480px] rounded-2xl overflow-hidden select-none border border-slate-200 bg-slate-50">
              {/* After Image */}
              <img
                src={afterScan?.imageUrl || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80'}
                alt="After recovery"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Before Image with Clip Path */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
              >
                <img
                  src={beforeScan?.imageUrl || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80'}
                  alt="Before treatment"
                  className="absolute inset-0 w-full h-full object-cover filter contrast-125 saturate-150"
                />

                <div className="absolute inset-0 bg-yellow-600/20 mix-blend-color" />

                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm border border-slate-200">
                  Before: {beforeScan?.pathology?.condition || 'Chlorosis (68% Health)'}
                </div>
              </div>

              {/* After Label Badge */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm border border-slate-200">
                After: {afterScan?.pathology?.condition || 'Remediated (92% Health)'}
              </div>

              {/* Center Divider Line & Handle */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xl z-20 pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-800 shadow-md flex items-center justify-center font-bold text-xs border border-slate-200">
                  ↔
                </div>
              </div>

              {/* Range Input */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              />
            </div>

            {/* Clinical Comparison Dossier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Baseline Scan ({beforeScan?.timestamp.split('T')[0] || 'Day 0'})
                  </span>
                  <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md">
                    {beforeScan?.pathology?.healthScore || 68}% Vitality
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {beforeScan?.pathology?.recommendedAction ||
                    'Irrigation withheld; soil flushed to eliminate salt crusting. SAM isolated 2 distinct chlorotic lesions on lower foliage.'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Follow-Up Scan ({afterScan?.timestamp.split('T')[0] || 'Day 16'})
                  </span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/60 px-2.5 py-0.5 rounded-md">
                    {afterScan?.pathology?.healthScore || 92}% Vitality
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {afterScan?.pathology?.recommendedAction ||
                    'Tissue repigmentation confirmed. Chlorophyll synthesis recovered following chelated iron protocol and 7-day watering adjustment.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODE 2: TIMELINE FEED */}
      {/* ================================================================= */}
      {viewMode === 'timeline' && (
        <div className="luxury-card rounded-3xl p-6 sm:p-8 border border-slate-200/70 bg-white space-y-6">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Longitudinal Health Scan Trajectory
          </h3>

          <div className="relative border-l border-slate-200 ml-4 pl-6 space-y-6">
            {plantScans.map((scan, idx) => (
              <div key={scan.id} className="relative group">
                <div className="absolute -left-[30px] top-2 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white shadow-xs" />

                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100 flex flex-col sm:flex-row gap-5">
                  <div className="w-full sm:w-44 h-32 rounded-xl overflow-hidden shrink-0 border border-slate-200 relative">
                    <img src={scan.imageUrl} alt="Scan node" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 bg-white/90 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Scan #{plantScans.length - idx}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-800">
                          {new Date(scan.timestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span>{scan.taxonomy?.commonName || currentPlant.name}</span>
                      </div>

                      <span className="text-xs font-bold text-slate-800 bg-white border border-slate-200 px-3 py-1 rounded-full">
                        {scan.pathology?.healthScore || 90}% Vitality
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">
                      {scan.pathology?.condition || 'Surveillance Observation'}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {scan.pathology?.recommendedAction || scan.notes || 'Normal biological foliage state.'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODE 3: GRID GALLERY */}
      {/* ================================================================= */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {allScans.map((scan) => (
            <div
              key={scan.id}
              className="luxury-card rounded-3xl overflow-hidden border border-slate-200/70 bg-white flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-slate-50">
                  <img
                    src={scan.imageUrl}
                    alt={scan.plantName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                  <span className="absolute top-3 right-3 text-xs font-bold bg-white/95 text-slate-800 px-2.5 py-1 rounded-xl shadow-xs">
                    {scan.pathology?.healthScore || 90}% Health
                  </span>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                      {scan.taxonomy?.commonName || scan.plantName}
                    </span>
                    <h4 className="text-sm font-bold truncate">
                      {scan.pathology?.condition || 'Healthy Observation'}
                    </h4>
                  </div>
                </div>

                <div className="p-5 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>{new Date(scan.timestamp).toLocaleDateString()}</span>
                    <span className="capitalize font-semibold text-slate-600">Mode: {scan.mode}</span>
                  </div>
                  <p className="text-slate-600 line-clamp-2">
                    {scan.pathology?.recommendedAction || scan.notes || 'Optimal foliar vigor.'}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => {
                    setSelectedPlantId(scan.plantId);
                    setViewMode('compare');
                  }}
                  className="w-full py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold rounded-xl border border-slate-200/70 transition-all flex items-center justify-center gap-1.5"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Inspect in Slider</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
