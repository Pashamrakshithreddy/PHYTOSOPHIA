import React, { useState } from 'react';
import { roomDb, type PlantEntity } from '../../services/roomDatabase';
import {
  MapPin,
  Sun,
  Droplets,
  Thermometer,
  Compass,
  Sparkles,
  Share2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Printer,
  Copy,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HomeSpatialHubProps {
  onNavigateTab: (tab: string, extraData?: any) => void;
  onOpenAddModal: (prefill?: { roomZone?: string; sunlight?: any }) => void;
}

interface SpatialSpot {
  id: string;
  name: string;
  room: string;
  exposure: string;
  lux: string;
  idealFor: string[];
  humidity: string;
  description: string;
}

export const HomeSpatialHubView: React.FC<HomeSpatialHubProps> = ({
  onNavigateTab,
  onOpenAddModal,
}) => {
  const [plants, setPlants] = useState<PlantEntity[]>(() => roomDb.plantDao.getAll());
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [isSitterModalOpen, setIsSitterModalOpen] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [wateredToast, setWateredToast] = useState<string | null>(null);

  // Vacant Spatial Spots tracker data
  const vacantSpots: SpatialSpot[] = [
    {
      id: 'spot-balcony-south',
      name: 'South-Facing Balcony Corner',
      room: 'Balcony Terrace',
      exposure: 'Direct Sunlight (6+ hrs)',
      lux: '45,000 Lux',
      humidity: '55% RH',
      idealFor: ['Succulents', 'Cacti', 'Olive Tree', 'Hibiscus'],
      description: 'Prime intense solar exposure with excellent cross-ventilation. Ideal for drought-resistant arid species.',
    },
    {
      id: 'spot-kitchen-sill',
      name: 'Kitchen North-East Windowsill',
      room: 'Kitchen Windowsill',
      exposure: 'Filtered Morning Light',
      lux: '14,000 Lux',
      humidity: '68% RH',
      idealFor: ['Culinary Herbs (Basil, Mint)', 'Peperomia', 'Pothos'],
      description: 'Gentle sunrise illumination without harsh midday scorching. Elevated ambient vapor from sink moisture.',
    },
    {
      id: 'spot-living-shelf',
      name: 'Living Room Floating Shelf Top',
      room: 'Living Room',
      exposure: 'Bright Indirect Light',
      lux: '7,500 Lux',
      humidity: '62% RH',
      idealFor: ['Heartleaf Philodendron', 'Trailing Hoya', 'Cast Iron Plant'],
      description: 'Elevated ambient shelf at 1.8m height. Soft reflected wall light protects foliage from solar burning.',
    },
    {
      id: 'spot-greenhouse-bench',
      name: 'Greenhouse Misting Tier 2',
      room: 'Greenhouse',
      exposure: 'Diffused Canopy Light',
      lux: '22,000 Lux',
      humidity: '82% RH',
      idealFor: ['Orchids', 'Calathea', 'Bird of Paradise', 'Pitcher Plant'],
      description: 'Automated ultra-sonic misting zone with stable 25°C warmth. Peak environment for tropical cultivars.',
    },
  ];

  const roomsList = [
    { id: 'all', name: 'All Household', icon: '🏡', orientation: 'Overview' },
    { id: 'Living Room', name: 'Living Room', icon: '🛋️', orientation: 'West-Facing', temp: '22°C', rh: '64%', lux: '6,800 Lux' },
    { id: 'Balcony Terrace', name: 'Balcony Terrace', icon: '☀️', orientation: 'South-Facing', temp: '27°C', rh: '55%', lux: '42,000 Lux' },
    { id: 'Kitchen Windowsill', name: 'Kitchen Windowsill', icon: '🍳', orientation: 'East-Facing', temp: '23°C', rh: '70%', lux: '14,500 Lux' },
    { id: 'Bedroom', name: 'Bedroom', icon: '🛏️', orientation: 'North-Facing', temp: '20°C', rh: '60%', lux: '3,200 Lux' },
    { id: 'Greenhouse', name: 'Greenhouse', icon: '🌿', orientation: 'Roof Solarium', temp: '25°C', rh: '82%', lux: '24,000 Lux' },
  ];

  const filteredPlants = selectedRoom === 'all'
    ? plants
    : plants.filter((p) => (p.roomZone || 'Living Room').toLowerCase() === selectedRoom.toLowerCase());

  const quickWaterPlant = (plant: PlantEntity) => {
    confetti({ particleCount: 30, spread: 45, origin: { y: 0.85 } });
    const updated: PlantEntity = {
      ...plant,
      lastWatered: new Date().toISOString(),
      healthScore: Math.min(100, plant.healthScore + 2),
      careStreak: (plant.careStreak || 0) + 1,
    };
    roomDb.plantDao.update(updated);
    setPlants(roomDb.plantDao.getAll());
    setWateredToast(`Hydrated ${plant.name}. Telemetry updated!`);
    setTimeout(() => setWateredToast(null), 3000);
  };

  const handleCopyPass = () => {
    const text = `PhytoSophia Botanical Care Pass:\nHousehold: 5 active plant twins across 5 zones.\nEmergency Contact: +1 555-0192\nView live: https://phytosophia.local/pass`;
    navigator.clipboard?.writeText(text);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2500);
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="luxury-card p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#729C65]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4E763B]">
              Spatial Architecture & Microclimate Allocation
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#193C0D] tracking-tight">
            Home Spatial Layout Hub
          </h1>

          <p className="text-xs sm:text-sm text-[#637462] font-medium max-w-2xl leading-relaxed">
            Map the physical location of every plant digital twin across household microclimates. Identify light exposure niches, monitor vacant spatial spots, and generate customized plant sitter care passes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setIsSitterModalOpen(true)}
            className="luxury-btn-outline flex items-center gap-2 px-4 py-2.5 text-xs font-semibold"
          >
            <Share2 className="w-4 h-4 text-[#4E763B]" />
            <span>Plant Sitter Pass</span>
          </button>

          <button
            onClick={() => onOpenAddModal()}
            className="luxury-btn-primary flex items-center gap-2 px-4 py-2.5 text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Register Plant to Room</span>
          </button>
        </div>
      </div>

      {wateredToast && (
        <div className="bg-[#F4F7F2] border border-[#6D835C]/30 text-[#193C0D] text-xs font-semibold px-4 py-3 rounded-2xl shadow-xs flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#729C65]" />
            {wateredToast}
          </span>
          <button onClick={() => setWateredToast(null)} className="text-[#637462] hover:text-[#193C0D]">✕</button>
        </div>
      )}

      {/* Room & Zone Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {roomsList.map((room) => {
          const isActive = selectedRoom === room.id;
          const count = room.id === 'all'
            ? plants.length
            : plants.filter((p) => (p.roomZone || 'Living Room').toLowerCase() === room.id.toLowerCase()).length;

          return (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'bg-[#6D835C] text-white shadow-[0px_4px_14px_rgba(109,131,92,0.35)] -translate-y-0.5'
                  : 'bg-white text-[#637462] hover:text-[#193C0D] border border-[#E4ECE2] hover:border-[#6D835C]'
              }`}
            >
              <span>{room.icon}</span>
              <span>{room.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-[#F4F7F2] text-[#4E763B]'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Room Telemetry Overview Bar (if specific room selected) */}
      {selectedRoom !== 'all' && (
        <div className="luxury-card p-5 bg-[#F4F7F2] border border-[#E4ECE2] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#E4ECE2] flex items-center justify-center text-lg shadow-xs">
              {roomsList.find((r) => r.id === selectedRoom)?.icon || '🌿'}
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#193C0D]">{selectedRoom} Microclimate</h4>
              <span className="text-xs text-[#637462] font-medium">
                Orientation: {roomsList.find((r) => r.id === selectedRoom)?.orientation}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-[#193C0D]">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#E4ECE2]">
              <Thermometer className="w-3.5 h-3.5 text-[#4E763B]" />
              <span>{roomsList.find((r) => r.id === selectedRoom)?.temp || '23°C'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#E4ECE2]">
              <Droplets className="w-3.5 h-3.5 text-sky-600" />
              <span>{roomsList.find((r) => r.id === selectedRoom)?.rh || '62%'} RH</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#E4ECE2]">
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>{roomsList.find((r) => r.id === selectedRoom)?.lux || '12,000 Lux'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Household Grid: Plant Location Map */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#193C0D]">
              Physical Location Map ({filteredPlants.length} Plants)
            </h3>
            <p className="text-xs text-[#637462]">
              Assigned placement of digital twins in the current spatial area.
            </p>
          </div>
        </div>

        {filteredPlants.length === 0 ? (
          <div className="luxury-card p-12 text-center space-y-3">
            <span className="text-4xl">🪴</span>
            <h4 className="text-base font-bold text-[#193C0D]">No Plants Assigned to this Zone</h4>
            <p className="text-xs text-[#637462] max-w-sm mx-auto">
              This microclimate currently has zero resident botanical digital twins. Place an existing plant here or register a new one.
            </p>
            <button
              onClick={() => onOpenAddModal({ roomZone: selectedRoom !== 'all' ? selectedRoom : 'Living Room' })}
              className="luxury-btn-primary px-4 py-2 text-xs font-semibold mt-2"
            >
              + Place Plant in {selectedRoom !== 'all' ? selectedRoom : 'House'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlants.map((plant) => {
              const isWarning = plant.healthScore < 80;
              const isCritical = plant.healthScore < 70;

              return (
                <div
                  key={plant.id}
                  className={`luxury-card p-5 space-y-4 flex flex-col justify-between ${
                    isCritical ? 'border-[#FFD2D2] hover:border-[#D32F2F]' : isWarning ? 'border-amber-200' : ''
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-[#E4ECE2]">
                        <img src={plant.imageUrl} alt={plant.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 text-[9px] bg-white/95 px-1 rounded font-bold text-[#193C0D]">
                          {plant.healthScore}%
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-sm font-bold text-[#193C0D] truncate">{plant.name}</h4>
                          {isCritical ? (
                            <span className="danger-badge text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-[#D32F2F]" />
                              Alert
                            </span>
                          ) : (
                            <span className="bg-[#F4F7F2] text-[#4E763B] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#6D835C]/30">
                              {plant.healthState}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#637462] italic truncate">{plant.species}</div>

                        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#4E763B]">
                          <MapPin className="w-3.5 h-3.5 text-[#4E763B] shrink-0" />
                          <span className="truncate">{plant.roomZone || 'Living Room'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="bg-[#F4F7F2] p-2 rounded-xl border border-[#E4ECE2]">
                        <span className="text-[#637462] block text-[10px]">Sunlight Fit</span>
                        <strong className="text-[#193C0D] font-semibold">{plant.sunlight}</strong>
                      </div>
                      <div className="bg-[#F4F7F2] p-2 rounded-xl border border-[#E4ECE2]">
                        <span className="text-[#637462] block text-[10px]">Water Cycle</span>
                        <strong className="text-[#193C0D] font-semibold">Every {plant.waterIntervalDays} days</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#E4ECE2]">
                    <button
                      onClick={() => quickWaterPlant(plant)}
                      className="luxury-btn-outline flex-1 py-1.5 text-[11px] flex items-center justify-center gap-1"
                    >
                      <Droplets className="w-3 h-3 text-sky-600" />
                      <span>Water Now</span>
                    </button>
                    <button
                      onClick={() => onNavigateTab('plant-detail', { plantId: plant.id })}
                      className="luxury-btn-primary flex-1 py-1.5 text-[11px] flex items-center justify-center gap-1"
                    >
                      <span>Twin 3D</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Vacant Light Spot Tracker */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#729C65]" />
              <h3 className="text-base font-bold text-[#193C0D]">
                Vacant Light Spot Tracker
              </h3>
            </div>
            <p className="text-xs text-[#637462]">
              Unoccupied household spatial niches measured by sensor telemetry, ready for new botanical twin acquisition.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vacantSpots.map((spot) => (
            <div
              key={spot.id}
              className="luxury-card p-6 border-dashed border-[#6D835C]/40 bg-gradient-to-br from-white to-[#F4F7F2] space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#4E763B] bg-[#E4ECE2] px-2.5 py-0.5 rounded-full inline-block mb-1">
                      {spot.room} • Available
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-[#193C0D]">{spot.name}</h4>
                  </div>
                  <span className="text-xs font-bold text-[#729C65] bg-white border border-[#E4ECE2] px-2.5 py-1 rounded-full shadow-xs shrink-0">
                    {spot.lux}
                  </span>
                </div>

                <p className="text-xs text-[#637462] leading-relaxed">
                  {spot.description}
                </p>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#637462] block">
                    Ideal Botanical Cultivars:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {spot.idealFor.map((item, idx) => (
                      <span
                        key={idx}
                        className="bg-white text-[#193C0D] border border-[#E4ECE2] text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E4ECE2] flex items-center justify-between">
                <span className="text-xs text-[#637462] flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-[#4E763B]" />
                  {spot.exposure}
                </span>

                <button
                  onClick={() => onOpenAddModal({ roomZone: spot.room })}
                  className="luxury-btn-primary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Place Plant Here</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plant Sitter Pass Modal */}
      {isSitterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="luxury-card max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto" id="printable-sitter-pass">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4ECE2]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F4F7F2] border border-[#6D835C]/30 text-[#4E763B] flex items-center justify-center font-bold">
                  🌱
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#193C0D]">
                    Plant Sitter Care & Location Pass
                  </h3>
                  <p className="text-xs text-[#637462]">
                    Clear household guide for family members or botanical caretakers.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSitterModalOpen(false)}
                className="p-2 rounded-full text-[#637462] hover:text-[#193C0D] bg-[#F4F7F2]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Emergency Info Callout */}
            <div className="bg-[#F4F7F2] p-4 rounded-2xl border border-[#E4ECE2] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#637462] uppercase tracking-wider block">Homeowner / Lead Caretaker</span>
                <strong className="text-[#193C0D] text-sm">PhytoKeeper Emergency Contact: +1 (555) 0192</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#637462] uppercase tracking-wider block">Important Sitter Rule</span>
                <strong className="text-[#D32F2F] text-xs">⚠️ When in doubt, DO NOT overwater succulents or Monstera.</strong>
              </div>
            </div>

            {/* Room by Room Plant Checklist */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#193C0D]">Room-by-Room Care Checklist</h4>
              <div className="space-y-3">
                {plants.map((plant) => (
                  <div
                    key={plant.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#E4ECE2] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={plant.imageUrl} alt={plant.name} className="w-11 h-11 rounded-xl object-cover shrink-0 border border-[#E4ECE2]" />
                      <div className="min-w-0">
                        <h5 className="font-bold text-[#193C0D] truncate">{plant.name} ({plant.species})</h5>
                        <span className="text-[11px] text-[#4E763B] font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Location: {plant.roomZone || 'Living Room'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-bold text-[#193C0D] block">
                        Water every {plant.waterIntervalDays} days
                      </span>
                      <span className="text-[10px] text-[#637462]">
                        {plant.sunlight}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-[#E4ECE2] flex items-center justify-between gap-3">
              <button
                onClick={() => window.print()}
                className="luxury-btn-outline px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Physical Pass</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPass}
                  className="luxury-btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedPass ? 'Pass Copied!' : 'Copy Shareable Link'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
