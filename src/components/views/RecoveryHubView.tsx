import React, { useState } from 'react';
import { roomDb } from '../../services/roomDatabase';
import {
  Layers,
  Grid3X3,
  GitCompare,
  TrendingUp,
  Clock,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle,
  ShieldAlert,
  Activity,
  Sparkles,
  Columns,
  Sliders,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RecoveryHubViewProps {
  onNavigateTab?: (tab: string, extraData?: any) => void;
}

interface SymptomItem {
  id: string;
  label: string;
  severity: 'moderate' | 'severe';
  category: string;
  description: string;
}

interface ProtocolStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  recoveryBoostDays: number;
  vitalityGain: number;
}

interface PlantRecoveryBinding {
  baselinePhoto: string;
  baselineHealth: number;
  baselineDate: string;
  currentPhoto: string;
  currentHealth: number;
  currentDate: string;
}

const DEFAULT_RECOVERY_BINDINGS: Record<string, PlantRecoveryBinding> = {
  'plant-monstera-1': {
    baselinePhoto: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80',
    baselineHealth: 58,
    baselineDate: 'Day 0 (Initial Chlorosis Onset)',
    currentPhoto: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80',
    currentHealth: 88,
    currentDate: 'Day 18 (Active Remission)',
  },
  'plant-mango-1': {
    baselinePhoto: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1200&q=80',
    baselineHealth: 61,
    baselineDate: 'Day 0 (Colletotrichum Blight)',
    currentPhoto: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1200&q=80',
    currentHealth: 86,
    currentDate: 'Day 21 (Pruned & Treated)',
  },
  'plant-rose-1': {
    baselinePhoto: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    baselineHealth: 68,
    baselineDate: 'Day 0 (Powdery Mildew Film)',
    currentPhoto: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    currentHealth: 94,
    currentDate: 'Day 14 (Full Foliar Turgor)',
  },
  'plant-aloe-1': {
    baselinePhoto: 'https://images.unsplash.com/photo-1567688993206-43c34131b21f?auto=format&fit=crop&w=1200&q=80',
    baselineHealth: 70,
    baselineDate: 'Day 0 (Solar Scald & Desiccation)',
    currentPhoto: 'https://images.unsplash.com/photo-1567688993206-43c34131b21f?auto=format&fit=crop&w=1200&q=80',
    currentHealth: 92,
    currentDate: 'Day 25 (Repigmentation)',
  },
};

export const RecoveryHubView: React.FC<RecoveryHubViewProps> = () => {
  const [viewMode, setViewMode] = useState<'compare' | 'timeline' | 'grid'>('compare');
  const [selectedPlantId, setSelectedPlantId] = useState<string>('plant-monstera-1');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [inspectorLayout, setInspectorLayout] = useState<'side-by-side' | 'slider'>('side-by-side');

  const plants = roomDb.plantDao.getAll();
  const allScans = roomDb.scanLogDao.getAll();
  const currentPlant = plants.find((p) => p.id === selectedPlantId) || plants[0];
  const plantScans = roomDb.scanLogDao.getByPlantId(currentPlant?.id || '');

  // Immutable State Binding: Load strictly linked photos per plant
  const [recoveryBindings, setRecoveryBindings] = useState<Record<string, PlantRecoveryBinding>>(() => {
    try {
      const saved = localStorage.getItem('phytosophia_recovery_bindings');
      return saved ? JSON.parse(saved) : DEFAULT_RECOVERY_BINDINGS;
    } catch {
      return DEFAULT_RECOVERY_BINDINGS;
    }
  });

  const currentBinding: PlantRecoveryBinding = recoveryBindings[selectedPlantId] || {
    baselinePhoto: currentPlant?.imageUrl || DEFAULT_RECOVERY_BINDINGS['plant-monstera-1'].baselinePhoto,
    baselineHealth: Math.max(40, (currentPlant?.healthScore || 80) - 25),
    baselineDate: 'Day 0 (Pathology Onset)',
    currentPhoto: currentPlant?.imageUrl || DEFAULT_RECOVERY_BINDINGS['plant-monstera-1'].currentPhoto,
    currentHealth: currentPlant?.healthScore || 85,
    currentDate: 'Day 14 (Current Treatment)',
  };

  const beforeImage = currentBinding.baselinePhoto;
  const afterImage = currentBinding.currentPhoto;

  // Interactive Diagnostic Checklist State
  const symptomsCatalog: SymptomItem[] = [
    { id: 'yellowing', label: 'Yellowing Leaves (Chlorosis)', severity: 'moderate', category: 'Nutritional / Moisture', description: 'Interveinal loss of chlorophyll pigment due to stagnant moisture or iron lock.' },
    { id: 'rootrot', label: 'Root Rot / Rhizoctonia', severity: 'severe', category: 'Pathological Root Collapse', description: 'Anaerobic fungal attack on root hairs with mushy brown roots and sulfur smell.' },
    { id: 'spidermites', label: 'Spider Mites / Webbing Infestation', severity: 'severe', category: 'Pest Vector', description: 'Microscopic acarine pests puncturing leaf stomata with fine silken webbing.' },
    { id: 'scorch', label: 'Leaf Scorch / Solar Scald', severity: 'moderate', category: 'Environmental', description: 'Crispy dry brown necrotic margins caused by intense unshaded midday UV.' },
    { id: 'powderymildew', label: 'Powdery Mildew Fungal Film', severity: 'moderate', category: 'Foliar Fungus', description: 'White talcum-like spore coating obstructing photosynthetic photon capture.' },
    { id: 'softstem', label: 'Stem Softening & Turgor Collapse', severity: 'severe', category: 'Vascular Wilting', description: 'Stem base losing cellular firmness indicating vascular pathogen transmission.' },
  ];

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['yellowing']);

  // Interactive Treatment Protocol Checklist State
  const [protocolSteps, setProtocolSteps] = useState<ProtocolStep[]>([
    {
      id: 'step-1',
      title: 'Quarantine & Isolate Plant',
      description: 'Move specimen 2 meters away from collection to halt active pathogen spore transmission.',
      completed: true,
      recoveryBoostDays: 3,
      vitalityGain: 6,
    },
    {
      id: 'step-2',
      title: 'Prune Compromised Foliage',
      description: 'Excise necrotic tissue using 70% isopropyl-sterilized bypass shears above healthy nodes.',
      completed: true,
      recoveryBoostDays: 4,
      vitalityGain: 8,
    },
    {
      id: 'step-3',
      title: 'Apply Cold-Pressed Neem Foliar Spray',
      description: 'Spray 0.5% organic neem oil emulsion combined with horticultural soap at twilight.',
      completed: false,
      recoveryBoostDays: 5,
      vitalityGain: 10,
    },
    {
      id: 'step-4',
      title: 'Aerate Substrate & Hydrogen Peroxide Drench',
      description: 'Flush root zone with diluted 3% H2O2 (1:4 water ratio) to eliminate anaerobic bacteria.',
      completed: false,
      recoveryBoostDays: 4,
      vitalityGain: 9,
    },
    {
      id: 'step-5',
      title: 'Withhold Irrigation & Increase Cross-Airflow',
      description: 'Allow top 3 inches of potting medium to dry and maintain active ambient air circulation.',
      completed: false,
      recoveryBoostDays: 3,
      vitalityGain: 7,
    },
  ]);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleStep = (id: string) => {
    const nextSteps = protocolSteps.map((step) =>
      step.id === id ? { ...step, completed: !step.completed } : step
    );
    setProtocolSteps(nextSteps);

    const stepToggled = nextSteps.find((s) => s.id === id);
    if (stepToggled?.completed) {
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.85 } });
    }
  };

  const hasSevereSymptom = selectedSymptoms.some((id) => {
    const s = symptomsCatalog.find((item) => item.id === id);
    return s?.severity === 'severe';
  });

  // Calculate dynamic recovery parameters based on completed protocol steps
  const completedStepsCount = protocolSteps.filter((s) => s.completed).length;
  const baseHealth = currentBinding.baselineHealth;
  const vitalityGainSum = protocolSteps
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.vitalityGain, 0);

  const projectedHealth = Math.min(99, baseHealth + vitalityGainSum);
  const totalDaysRequired = Math.max(
    5,
    28 - protocolSteps.filter((s) => s.completed).reduce((sum, s) => sum + s.recoveryBoostDays, 0)
  );

  // File Upload Handlers (Immutable State Binding to current plant)
  const handleUploadBefore = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setRecoveryBindings((prev) => {
        const updated = {
          ...prev,
          [selectedPlantId]: {
            ...(prev[selectedPlantId] || currentBinding),
            baselinePhoto: url,
          },
        };
        try {
          localStorage.setItem('phytosophia_recovery_bindings', JSON.stringify(updated));
        } catch {}
        return updated;
      });
      confetti({ particleCount: 25, spread: 45 });
    }
  };

  const handleUploadAfter = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setRecoveryBindings((prev) => {
        const updated = {
          ...prev,
          [selectedPlantId]: {
            ...(prev[selectedPlantId] || currentBinding),
            currentPhoto: url,
          },
        };
        try {
          localStorage.setItem('phytosophia_recovery_bindings', JSON.stringify(updated));
        } catch {}
        return updated;
      });
      confetti({ particleCount: 25, spread: 45 });
    }
  };

  // Dynamic Vitality Recovery Chart Points
  const chartPoints = [
    { day: 'Day 0', score: baseHealth, label: 'Baseline' },
    { day: 'Day 7', score: Math.round(baseHealth + (projectedHealth - baseHealth) * 0.35), label: 'Quarantine' },
    { day: 'Day 14', score: Math.round(baseHealth + (projectedHealth - baseHealth) * 0.65), label: 'Pruning' },
    { day: 'Day 21', score: Math.round(baseHealth + (projectedHealth - baseHealth) * 0.85), label: 'Treatment' },
    { day: 'Day 30', score: projectedHealth, label: 'Remediated' },
  ];

  return (
    <div className="space-y-8 pb-24 animate-in fade-in max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="luxury-card p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#729C65]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4E763B]">
              Longitudinal Recovery Tracking & Analytics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#193C0D] tracking-tight">
            Scan Gallery & Recovery Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#637462] font-medium max-w-xl leading-relaxed">
            Track digital twin recovery from pathology over time using Segment Anything Model (SAM) scans, chronological timelines, and interactive before-and-after comparison.
          </p>
        </div>

        {/* View Mode Pills */}
        <div className="flex items-center gap-1 bg-[#F4F7F2] p-1 rounded-full text-xs font-semibold self-start md:self-auto shrink-0 border border-[#E4ECE2]">
          <button
            onClick={() => setViewMode('compare')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
              viewMode === 'compare'
                ? 'bg-[#6D835C] text-white font-bold shadow-xs'
                : 'text-[#637462] hover:text-[#193C0D]'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Before & After</span>
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
              viewMode === 'timeline'
                ? 'bg-[#6D835C] text-white font-bold shadow-xs'
                : 'text-[#637462] hover:text-[#193C0D]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
              viewMode === 'grid'
                ? 'bg-[#6D835C] text-white font-bold shadow-xs'
                : 'text-[#637462] hover:text-[#193C0D]'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Gallery ({allScans.length})</span>
          </button>
        </div>
      </div>

      {/* Plant Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white border border-[#E4ECE2] gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#637462]">Filter by Digital Twin:</span>
          <select
            value={selectedPlantId}
            onChange={(e) => setSelectedPlantId(e.target.value)}
            className="bg-[#F7F9F5] border border-[#E4ECE2] text-xs font-semibold text-[#193C0D] rounded-full px-3.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#4E763B]"
          >
            {plants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.species})
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-[#637462] font-medium">
          {plantScans.length} historical scan checkpoints recorded
        </span>
      </div>

      {/* ================================================================= */}
      {/* MODE 1: DUAL PHOTO INSPECTOR & RECOVERY DIAGNOSTICS */}
      {/* ================================================================= */}
      {viewMode === 'compare' && (
        <div className="space-y-8">
          {/* Top Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            <div className="luxury-card p-6 space-y-1">
              <span className="text-[10px] font-bold text-[#637462] uppercase tracking-wider block">Health Delta</span>
              <div className="text-3xl font-bold text-[#193C0D] flex items-center gap-1.5">
                <TrendingUp className="w-5 h-5 text-[#729C65]" />
                +{projectedHealth - baseHealth}%
              </div>
              <span className="text-xs text-[#637462] font-medium">From {baseHealth}% to {projectedHealth}%</span>
            </div>

            <div className="luxury-card p-6 space-y-1">
              <span className="text-[10px] font-bold text-[#637462] uppercase tracking-wider block">Lesion Reduction</span>
              <div className="text-3xl font-bold text-[#193C0D]">
                -{Math.min(85, completedStepsCount * 18)}%
              </div>
              <span className="text-xs text-[#637462] font-medium">SAM segmentation clearing</span>
            </div>

            <div className="luxury-card p-6 space-y-1">
              <span className="text-[10px] font-bold text-[#637462] uppercase tracking-wider block">Remediation Window</span>
              <div className="text-3xl font-bold text-[#193C0D] flex items-center gap-1.5">
                <Clock className="w-5 h-5 text-sky-600" />
                {totalDaysRequired} Days
              </div>
              <span className="text-xs text-[#637462] font-medium">Predicted full recovery</span>
            </div>

            <div className="luxury-card p-6 space-y-1">
              <span className="text-[10px] font-bold text-[#637462] uppercase tracking-wider block">Recovery Status</span>
              <div className={`text-lg font-bold mt-2 ${hasSevereSymptom ? 'text-[#D32F2F]' : 'text-[#4E763B]'}`}>
                {completedStepsCount === protocolSteps.length ? 'Remediated Vigor' : hasSevereSymptom ? 'Critical Protocol' : 'Active Healing'}
              </div>
              <span className="text-xs text-[#637462] font-medium">
                {completedStepsCount}/{protocolSteps.length} Protocol steps done
              </span>
            </div>
          </div>

          {/* DUAL PHOTO INSPECTOR (SIDE-BY-SIDE & SPLIT SLIDER MODES) */}
          <div className="luxury-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#193C0D] tracking-tight">
                  Dual Photo Inspector & Recovery Comparison
                </h3>
                <p className="text-xs text-[#637462] mt-0.5">
                  Inspect tissue repigmentation, necrosis remission, and foliar turgor restoration side-by-side or via interactive split slider.
                </p>
              </div>

              {/* View Layout Mode & Zoom Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* View Layout Switcher (Side-by-Side vs Slider) */}
                <div className="flex items-center gap-1 bg-[#F4F7F2] p-1 rounded-full border border-[#E4ECE2]">
                  <button
                    onClick={() => setInspectorLayout('side-by-side')}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 ${
                      inspectorLayout === 'side-by-side'
                        ? 'bg-[#4E763B] text-white shadow-xs font-bold'
                        : 'text-[#637462] hover:text-[#193C0D]'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>Side-by-Side</span>
                  </button>
                  <button
                    onClick={() => setInspectorLayout('slider')}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 ${
                      inspectorLayout === 'slider'
                        ? 'bg-[#4E763B] text-white shadow-xs font-bold'
                        : 'text-[#637462] hover:text-[#193C0D]'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Split Slider</span>
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-[#F4F7F2] p-1 rounded-full border border-[#E4ECE2]">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
                    className="p-1.5 text-[#637462] hover:text-[#193C0D] rounded-full"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-bold text-[#193C0D] px-1.5">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                    className="p-1.5 text-[#637462] hover:text-[#193C0D] rounded-full"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-1.5 text-[#637462] hover:text-[#193C0D] rounded-full"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <label className="luxury-btn-outline px-3 py-1.5 text-xs cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Before</span>
                  <input type="file" accept="image/*" onChange={handleUploadBefore} className="hidden" />
                </label>

                <label className="luxury-btn-outline px-3 py-1.5 text-xs cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Current</span>
                  <input type="file" accept="image/*" onChange={handleUploadAfter} className="hidden" />
                </label>
              </div>
            </div>

            {/* Side-by-Side Dual Comparison Component */}
            {inspectorLayout === 'side-by-side' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
                {/* Left Card: Baseline / Day 0 */}
                <div className="rounded-2xl border border-[#E4ECE2] bg-[#F7F9F5] overflow-hidden space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#D32F2F] uppercase tracking-wider block">
                        Baseline Healthy / Initial Disease State
                      </span>
                      <h4 className="text-xs font-bold text-[#193C0D]">Day 0 Diagnostic Benchmark</h4>
                    </div>
                    <span className="danger-badge text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {baseHealth}% Vitality
                    </span>
                  </div>

                  <div className="relative w-full h-[340px] rounded-xl overflow-hidden bg-black/5 border border-[#E4ECE2]">
                    <div
                      className="w-full h-full"
                      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
                    >
                      <img
                        src={beforeImage}
                        alt="Baseline foliage"
                        className="w-full h-full object-cover filter contrast-110 saturate-125"
                      />
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#193C0D] border border-[#E4ECE2]">
                      Compromised Foliole Reference
                    </div>
                  </div>
                </div>

                {/* Right Card: Current / Day N */}
                <div className="rounded-2xl border border-[#E4ECE2] bg-[#F7F9F5] overflow-hidden space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#4E763B] uppercase tracking-wider block">
                        Current Damaged / Rehabilitating State
                      </span>
                      <h4 className="text-xs font-bold text-[#193C0D]">Current Clinical Progression</h4>
                    </div>
                    <span className="bg-[#F4F7F2] text-[#4E763B] border border-[#729C65]/40 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {projectedHealth}% Target Vitality
                    </span>
                  </div>

                  <div className="relative w-full h-[340px] rounded-xl overflow-hidden bg-black/5 border border-[#E4ECE2]">
                    <div
                      className="w-full h-full"
                      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
                    >
                      <img
                        src={afterImage}
                        alt="Current foliage"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#4E763B] border border-[#E4ECE2]">
                      Active Tissue Repigmentation
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Interactive Split Screen Slider Container */
              <div className="relative w-full h-[400px] sm:h-[480px] rounded-2xl overflow-hidden select-none border border-[#E4ECE2] bg-[#F7F9F5]">
                {/* After / Current Image */}
                <div
                  className="absolute inset-0 w-full h-full overflow-hidden"
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
                >
                  <img
                    src={afterImage}
                    alt="Current state"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Before / Baseline Image with Clip Path */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'center',
                  }}
                >
                  <img
                    src={beforeImage}
                    alt="Baseline state"
                    className="w-full h-full object-cover filter contrast-125 saturate-150"
                  />
                  <div className="absolute inset-0 bg-yellow-700/20 mix-blend-color" />
                </div>

                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-[#193C0D] text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs border border-[#E4ECE2] pointer-events-none">
                  Baseline / Day 0: <strong className="text-[#D32F2F]">{baseHealth}% Health</strong>
                </div>

                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-[#193C0D] text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs border border-[#E4ECE2] pointer-events-none">
                  Projected Stage: <strong className="text-[#729C65]">{projectedHealth}% Health</strong>
                </div>

                {/* Center Divider Line & Handle */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xl z-20 pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-[#193C0D] shadow-md flex items-center justify-center font-bold text-xs border border-[#E4ECE2]">
                    ↔
                  </div>
                </div>

                {/* Interactive Range Input */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                />
              </div>
            )}
          </div>

          {/* DIAGNOSTIC CHECKLIST & SEVERE PATHOLOGY WARNING */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Symptom Checklist (6 Cols) */}
            <div className={`lg:col-span-6 luxury-card p-6 sm:p-8 space-y-5 transition-all ${
              hasSevereSymptom ? 'border-[#FFD2D2] bg-[#FFEBEE]/20' : ''
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-[#E4ECE2]">
                <div>
                  <h3 className="text-base font-bold text-[#193C0D]">
                    Diagnostic Symptom Checklist
                  </h3>
                  <p className="text-xs text-[#637462]">
                    Select visible leaf and root conditions to update containment protocol.
                  </p>
                </div>
                {hasSevereSymptom && (
                  <span className="danger-badge text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse-danger">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Critical Vector
                  </span>
                )}
              </div>

              {hasSevereSymptom && (
                <div className="danger-card p-4 rounded-2xl space-y-1.5 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#C62828]">
                    <AlertTriangle className="w-4 h-4 text-[#D32F2F]" />
                    <span>Immediate Pathology Quarantine Required</span>
                  </div>
                  <p className="text-xs text-[#D32F2F] leading-relaxed">
                    Severe symptoms detected (Root Rot or Spider Mite vector). Isolate this plant immediately from healthy neighbors to prevent airborne or moisture-borne spore dispersion.
                  </p>
                </div>
              )}

              <div className="space-y-2.5">
                {symptomsCatalog.map((symptom) => {
                  const isChecked = selectedSymptoms.includes(symptom.id);
                  const isSevere = symptom.severity === 'severe';

                  return (
                    <div
                      key={symptom.id}
                      onClick={() => toggleSymptom(symptom.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isChecked
                          ? isSevere
                            ? 'bg-[#FFEBEE] border-[#FFD2D2] text-[#C62828]'
                            : 'bg-[#F4F7F2] border-[#6D835C] text-[#193C0D]'
                          : 'bg-white border-[#E4ECE2] text-[#637462] hover:bg-[#F7F9F5]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent onClick
                        className="mt-1 w-4 h-4 accent-[#4E763B] rounded cursor-pointer"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="text-xs font-bold">{symptom.label}</h5>
                          {isSevere ? (
                            <span className="danger-badge text-[9px] font-bold px-2 py-0.5 rounded-full">
                              Severe Risk
                            </span>
                          ) : (
                            <span className="bg-[#E4ECE2] text-[#4E763B] text-[9px] font-bold px-2 py-0.5 rounded-full">
                              Moderate
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] mt-0.5 opacity-90 leading-relaxed">
                          {symptom.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Treatment Protocol & Vitality Recovery Graph (6 Cols) */}
            <div className="lg:col-span-6 space-y-6">
              {/* Step-by-Step Treatment Protocol */}
              <div className="luxury-card p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4ECE2]">
                  <div>
                    <h3 className="text-base font-bold text-[#193C0D]">
                      Step-by-Step Treatment Protocol
                    </h3>
                    <p className="text-xs text-[#637462]">
                      Complete clinical steps to restore cellular turgor and accelerate recovery.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#4E763B] bg-[#F4F7F2] border border-[#6D835C]/30 px-3 py-1 rounded-full">
                    {completedStepsCount} / {protocolSteps.length} Steps
                  </span>
                </div>

                {/* Dynamic Live Recovery Progress Bar */}
                <div className="bg-[#F4F7F2] p-4 rounded-2xl border border-[#E4ECE2] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#193C0D] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#729C65]" />
                      Live Rehabilitation Progress Bar
                    </span>
                    <span className="font-bold text-[#4E763B]">
                      {Math.round((completedStepsCount / protocolSteps.length) * 100)}% Restored
                    </span>
                  </div>
                  <div className="w-full bg-[#E4ECE2] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#729C65] h-full rounded-full transition-all duration-500 shadow-xs"
                      style={{ width: `${(completedStepsCount / protocolSteps.length) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#637462]">
                    <span>{completedStepsCount} of {protocolSteps.length} Clinical Milestones Executed</span>
                    <span className="font-semibold text-[#193C0D]">Est. Full Recovery: {totalDaysRequired} Days Remaining</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {protocolSteps.map((step, idx) => (
                    <div
                      key={step.id}
                      onClick={() => toggleStep(step.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        step.completed
                          ? 'bg-[#F4F7F2] border-[#729C65] text-[#193C0D]'
                          : 'bg-white border-[#E4ECE2] text-[#637462] hover:bg-[#F7F9F5]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={step.completed}
                        onChange={() => {}}
                        className="mt-1 w-4 h-4 accent-[#4E763B] rounded cursor-pointer"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className={`text-xs font-bold ${step.completed ? 'text-[#193C0D]' : ''}`}>
                            {idx + 1}. {step.title}
                          </h5>
                          <span className="text-[10px] font-bold text-[#729C65]">
                            +{step.vitalityGain}% Vitality
                          </span>
                        </div>
                        <p className="text-[11px] text-[#637462] mt-0.5 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vitality Recovery Graph */}
              <div className="luxury-card p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#4E763B]" />
                    <h4 className="text-sm font-bold text-[#193C0D]">
                      Vitality Recovery Trajectory (7–30 Days)
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-[#729C65] bg-[#F4F7F2] px-2.5 py-0.5 rounded-full border border-[#E4ECE2]">
                    Target: {projectedHealth}%
                  </span>
                </div>

                {/* SVG Curve */}
                <div className="relative w-full h-44 bg-[#F7F9F5] rounded-2xl p-4 border border-[#E4ECE2] overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 460 140" preserveAspectRatio="none">
                    {/* Horizontal Guides */}
                    <line x1="20" y1="30" x2="440" y2="30" stroke="#E4ECE2" strokeDasharray="3 3" />
                    <line x1="20" y1="70" x2="440" y2="70" stroke="#E4ECE2" strokeDasharray="3 3" />
                    <line x1="20" y1="110" x2="440" y2="110" stroke="#E4ECE2" strokeDasharray="3 3" />

                    {/* Gradient Fill under Curve */}
                    <defs>
                      <linearGradient id="recoveryGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#729C65" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#729C65" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Polygon path */}
                    <path
                      d={`M 40 ${130 - (chartPoints[0].score / 100) * 110} 
                          L 135 ${130 - (chartPoints[1].score / 100) * 110} 
                          L 230 ${130 - (chartPoints[2].score / 100) * 110} 
                          L 325 ${130 - (chartPoints[3].score / 100) * 110} 
                          L 420 ${130 - (chartPoints[4].score / 100) * 110} 
                          L 420 135 L 40 135 Z`}
                      fill="url(#recoveryGrad)"
                    />

                    {/* Line path */}
                    <path
                      d={`M 40 ${130 - (chartPoints[0].score / 100) * 110} 
                          L 135 ${130 - (chartPoints[1].score / 100) * 110} 
                          L 230 ${130 - (chartPoints[2].score / 100) * 110} 
                          L 325 ${130 - (chartPoints[3].score / 100) * 110} 
                          L 420 ${130 - (chartPoints[4].score / 100) * 110}`}
                      fill="none"
                      stroke="#4E763B"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Data Points */}
                    {chartPoints.map((pt, i) => {
                      const cx = 40 + i * 95;
                      const cy = 130 - (pt.score / 100) * 110;
                      return (
                        <g key={i}>
                          <circle cx={cx} cy={cy} r="5" fill="#729C65" stroke="#FFFFFF" strokeWidth="2" />
                          <text x={cx} y={cy - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#193C0D">
                            {pt.score}%
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  <div className="flex justify-between text-[10px] text-[#637462] font-semibold px-2 pt-1">
                    {chartPoints.map((pt, i) => (
                      <span key={i}>{pt.day}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODE 2: TIMELINE VIEW */}
      {/* ================================================================= */}
      {viewMode === 'timeline' && (
        <div className="luxury-card p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-bold text-[#193C0D] tracking-tight">
            Longitudinal Health Scan Trajectory
          </h3>

          <div className="relative border-l border-[#E4ECE2] ml-4 pl-6 space-y-6">
            {plantScans.map((scan, idx) => (
              <div key={scan.id} className="relative group">
                <div className="absolute -left-[31px] top-2 w-3.5 h-3.5 rounded-full bg-[#4E763B] border-2 border-white shadow-xs" />

                <div className="bg-[#F7F9F5] rounded-2xl p-5 border border-[#E4ECE2] flex flex-col sm:flex-row gap-5">
                  <div className="w-full sm:w-44 h-32 rounded-xl overflow-hidden shrink-0 border border-[#E4ECE2] relative">
                    <img src={scan.imageUrl} alt="Scan node" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 bg-white/95 text-[#193C0D] text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Scan #{plantScans.length - idx}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-[#637462]">
                        <span className="font-semibold text-[#193C0D]">
                          {new Date(scan.timestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span>{scan.taxonomy?.commonName || currentPlant.name}</span>
                      </div>

                      <span className="text-xs font-bold text-[#193C0D] bg-white border border-[#E4ECE2] px-3 py-1 rounded-full">
                        {scan.pathology?.healthScore || 90}% Vitality
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#193C0D]">
                      {scan.pathology?.condition || 'Surveillance Observation'}
                    </h4>

                    <p className="text-xs text-[#637462] leading-relaxed">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {allScans.map((scan) => (
            <div
              key={scan.id}
              className="luxury-card overflow-hidden flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-[#F7F9F5]">
                  <img
                    src={scan.imageUrl}
                    alt={scan.plantName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#193C0D]/70 via-transparent to-transparent" />

                  <span className="absolute top-3 right-3 text-xs font-bold bg-white/95 text-[#193C0D] px-2.5 py-1 rounded-full shadow-xs">
                    {scan.pathology?.healthScore || 90}% Health
                  </span>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#729C65] block">
                      {scan.taxonomy?.commonName || scan.plantName}
                    </span>
                    <h4 className="text-sm font-bold truncate">
                      {scan.pathology?.condition || 'Healthy Observation'}
                    </h4>
                  </div>
                </div>

                <div className="p-5 space-y-2 text-xs">
                  <div className="flex justify-between text-[#637462] text-[11px]">
                    <span>{new Date(scan.timestamp).toLocaleDateString()}</span>
                    <span className="capitalize font-semibold text-[#193C0D]">Mode: {scan.mode}</span>
                  </div>
                  <p className="text-[#637462] line-clamp-2">
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
                  className="w-full py-2 bg-[#F4F7F2] hover:bg-[#6D835C] text-[#4E763B] hover:text-white text-xs font-semibold rounded-full border border-[#E4ECE2] transition-all flex items-center justify-center gap-1.5"
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
