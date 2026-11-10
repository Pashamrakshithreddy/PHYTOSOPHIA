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
  Search,
  Scan,
  Grid3X3,
  Sprout,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MyGardenAndHomeMapProps {
  onSelectPlant: (plantId: string) => void;
  onOpenAddModal: (prefill?: { roomZone?: string; sunlight?: any }) => void;
  onNavigateTab: (tab: string, extraData?: any) => void;
  initialMode?: 'spatial' | 'inventory' | 'vacant';
}

interface SpatialSpot {
  id: string;
  name: string;
  room: string;
  lightProfile: 'Direct Sunlight' | 'Bright Indirect' | 'Partial Shade' | 'Low Light';
  optimalSpecies: string[];
  description: string;
  isOccupied: boolean;
  residentPlantId?: string;
}

export const MyGardenAndHomeMapView: React.FC<MyGardenAndHomeMapProps> = ({
  onSelectPlant,
  onOpenAddModal,
  onNavigateTab,
  initialMode = 'spatial',
}) => {
  const [viewMode, setViewMode] = useState<'spatial' | 'inventory' | 'vacant'>(initialMode);
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [plants, setPlants] = useState<PlantEntity[]>(() => roomDb.plantDao.getAll());
  const [isSitterPassOpen, setIsSitterPassOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const rooms = [
    { id: 'all', name: 'Whole House', icon: Compass, temp: '22.8°C', humidity: '58%', light: 'Ambient Mixed' },
    { id: 'Living Room', name: 'Living Room', icon: MapPin, temp: '22.5°C', humidity: '55%', light: 'Bright Indirect' },
    { id: 'Balcony Terrace', name: 'Balcony Terrace', icon: Sun, temp: '26.4°C', humidity: '64%', light: 'Direct Sunlight' },
    { id: 'Kitchen Windowsill', name: 'Kitchen Windowsill', icon: Droplets, temp: '23.1°C', humidity: '68%', light: 'Bright Indirect' },
    { id: 'Bedroom', name: 'Bedroom', icon: MapPin, temp: '21.0°C', humidity: '50%', light: 'Low to Filtered' },
    { id: 'Greenhouse', name: 'Greenhouse', icon: Thermometer, temp: '27.2°C', humidity: '76%', light: 'High Diffused' },
  ];

  const spatialSpots: SpatialSpot[] = [
    {
      id: 'spot-balcony-east',
      name: 'East Balcony Tier Rack',
      room: 'Balcony Terrace',
      lightProfile: 'Direct Sunlight',
      optimalSpecies: ['Mangifera indica', 'Rosa rubiginosa', 'Cacti', 'Succulents'],
      description: 'Receives 6+ hours of unobstructed direct morning solar radiation. Excellent air circulation.',
      isOccupied: false,
    },
    {
      id: 'spot-kitchen-sill',
      name: 'Kitchen Sink Windowsill Shelf',
      room: 'Kitchen Windowsill',
      lightProfile: 'Bright Indirect',
      optimalSpecies: ['Epipremnum aureum (Pothos)', 'Ocimum basilicum (Basil)', 'Peperomia'],
      description: 'High ambient humidity from cooking and sink misting. Soft filtered morning luminosity.',
      isOccupied: false,
    },
    {
      id: 'spot-living-alcove',
      name: 'North Living Room Media Console',
      room: 'Living Room',
      lightProfile: 'Low Light',
      optimalSpecies: ['Dracaena trifasciata (Snake Plant)', 'Zamioculcas (ZZ Plant)', 'Aglaonema'],
      description: 'Deep interior shadow zone with only indirect ambient bounce. Tolerates shade-loving specimens.',
      isOccupied: false,
    },
    {
      id: 'spot-bedroom-stand',
      name: 'Master Bedroom Nightstand',
      room: 'Bedroom',
      lightProfile: 'Partial Shade',
      optimalSpecies: ['Chlorophytum comosum (Spider Plant)', 'Spathiphyllum (Peace Lily)'],
      description: 'Controlled temperature and nighttime oxygen enrichment location.',
      isOccupied: true,
      residentPlantId: 'plant-spider-1',
    },
    {
      id: 'spot-greenhouse-top',
      name: 'Greenhouse Upper Humidity Bench',
      room: 'Greenhouse',
      lightProfile: 'Bright Indirect',
      optimalSpecies: ['Monstera deliciosa', 'Calathea orbifolia', 'Boston Fern'],
      description: 'Steady 75% relative humidity microclimate with diffused polycarbonate overhead shading.',
      isOccupied: false,
    },
  ];

  const activeRoomData = rooms.find((r) => r.id === selectedRoom) || rooms[0];

  // Filter plants
  const filteredPlants = plants.filter((p) => {
    const matchesRoom = selectedRoom === 'all' || p.roomZone === selectedRoom;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.roomZone && p.roomZone.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      categoryFilter === 'all' ||
      (categoryFilter === 'indoor' && p.location === 'Indoor') ||
      (categoryFilter === 'outdoor' && p.location === 'Outdoor') ||
      (categoryFilter === 'warning' && p.healthScore < 80);

    return matchesRoom && matchesSearch && matchesCategory;
  });

  const quickWaterPlant = (plant: PlantEntity) => {
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.85 } });
    const updated = {
      ...plant,
      lastWatered: new Date().toISOString(),
      healthScore: Math.min(100, plant.healthScore + 2),
      careStreak: (plant.careStreak || 0) + 1,
    };
    roomDb.plantDao.update(updated);
    setPlants(roomDb.plantDao.getAll());
    setToastMessage(`Hydrated ${plant.name} (+2% Vitality). Substrate moisture restored.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const vacantSpots = spatialSpots.filter((s) => !s.isOccupied);

  return (
    <div className="space-y-8 pb-24 animate-in fade-in max-w-7xl mx-auto">
      {/* Top Banner & Overview */}
      <div className="luxury-card p-5 sm:p-7 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#729C65]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4E763B]">
              Integrated Botanical Inventory & Home Microclimate Mapping
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#193C0D] tracking-tight">
            My Garden & Home Map
          </h1>
          <p className="text-xs sm:text-sm text-[#637462] font-medium max-w-2xl leading-relaxed">
            Monitor your complete digital twin collection and track their physical placement across home microclimates. Coordinate care with household members and plant sitters effortlessly.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
          <button
            onClick={() => setIsSitterPassOpen(true)}
            className="luxury-btn-outline px-4 py-2 text-xs font-semibold flex items-center gap-2"
            title="Generate shareable care guide for plant sitters"
          >
            <Share2 className="w-4 h-4 text-[#4E763B]" />
            <span>Plant Sitter Pass</span>
          </button>

          <button
            onClick={() => onOpenAddModal({ roomZone: selectedRoom !== 'all' ? selectedRoom : 'Living Room' })}
            className="luxury-btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Plant to Zone</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-[#F4F7F2] border border-[#6D835C]/30 text-[#193C0D] text-xs font-semibold px-4 py-3 rounded-2xl shadow-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#729C65]" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-[#637462] hover:text-[#193C0D]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Row: Total Twins, Healthy Twins, Active Zones, Vacant Spots */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <div className="luxury-card p-5 space-y-1">
          <span className="text-[10px] font-bold text-[#637462] uppercase tracking-wider block">Total Digital Twins</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#193C0D]">{plants.length} Plants</div>
          <span className="text-xs text-[#4E763B] font-medium">Synchronized in local memory</span>
        </div>

        <div className="luxury-card p-5 space-y-1">
          <span className="text-[10px] font-bold text-[#637462] uppercase tracking-wider block">Average Vitality</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#729C65]">
            {Math.round(plants.reduce((acc, p) => acc + p.healthScore, 0) / (plants.length || 1))}%
          </div>
          <span className="text-xs text-[#637462] font-medium">Optimal photosynthesis turgor</span>
        </div>

        <div className="luxury-card p-5 space-y-1">
          <span className="text-[10px] font-bold text-[#637462] uppercase tracking-wider block">Spatial Zones</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#193C0D]">5 Rooms</div>
          <span className="text-xs text-[#637462] font-medium">Active residential microclimates</span>
        </div>

        <div className="luxury-card p-5 space-y-1">
          <span className="text-[10px] font-bold text-[#637462] uppercase tracking-wider block">Vacant Light Spots</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#4E763B]">
            {vacantSpots.length} Available
          </div>
          <span className="text-xs text-[#637462] font-medium">Ready for new specimen placement</span>
        </div>
      </div>

      {/* View Mode Pill Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-[#F4F7F2] p-1.5 rounded-full border border-[#E4ECE2] self-start">
          <button
            onClick={() => setViewMode('spatial')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              viewMode === 'spatial'
                ? 'bg-[#4E763B] text-white shadow-xs font-bold'
                : 'text-[#637462] hover:text-[#193C0D]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Room-by-Room Spatial Map</span>
          </button>

          <button
            onClick={() => setViewMode('inventory')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              viewMode === 'inventory'
                ? 'bg-[#4E763B] text-white shadow-xs font-bold'
                : 'text-[#637462] hover:text-[#193C0D]'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>All Plants Inventory ({plants.length})</span>
          </button>

          <button
            onClick={() => setViewMode('vacant')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              viewMode === 'vacant'
                ? 'bg-[#4E763B] text-white shadow-xs font-bold'
                : 'text-[#637462] hover:text-[#193C0D]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vacant Light Spots ({vacantSpots.length})</span>
          </button>
        </div>

        {/* Search input in inventory or spatial view */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#637462] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plant or room..."
            className="w-full bg-white border border-[#E4ECE2] rounded-full pl-10 pr-4 py-2 text-xs text-[#193C0D] focus:outline-none focus:ring-1 focus:ring-[#4E763B]"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: ROOM-BY-ROOM SPATIAL MAP VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'spatial' && (
        <div className="space-y-6">
          {/* Room Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {rooms.map((room) => {
              const count = room.id === 'all' ? plants.length : plants.filter((p) => p.roomZone === room.id).length;
              const isSelected = selectedRoom === room.id;
              const Icon = room.icon;
              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-[#F4F7F2] border-[#4E763B] text-[#193C0D] shadow-xs font-bold'
                      : 'bg-white border-[#E4ECE2] text-[#637462] hover:bg-[#F7F9F5]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#4E763B]' : 'text-[#637462]'}`} />
                  <span>{room.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${isSelected ? 'bg-[#4E763B] text-white' : 'bg-[#F4F7F2] text-[#637462]'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Room Telemetry Banner */}
          <div className="luxury-card p-6 bg-gradient-to-r from-white via-[#F4F7F2]/40 to-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4E763B]">
                  Zone Microclimate Telemetry
                </span>
                <span className="bg-[#F4F7F2] text-[#193C0D] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#E4ECE2]">
                  {filteredPlants.length} Digital Twins Active
                </span>
              </div>
              <h3 className="text-base font-bold text-[#193C0D] mt-0.5">
                {activeRoomData.name} Microclimate
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-[#E4ECE2] text-center">
                <span className="text-[10px] text-[#637462] block">Temperature</span>
                <strong className="text-[#193C0D] font-bold">{activeRoomData.temp}</strong>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#E4ECE2] text-center">
                <span className="text-[10px] text-[#637462] block">Humidity</span>
                <strong className="text-[#4E763B] font-bold">{activeRoomData.humidity}</strong>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#E4ECE2] text-center">
                <span className="text-[10px] text-[#637462] block">Sun Exposure</span>
                <strong className="text-[#193C0D] font-bold truncate block">{activeRoomData.light}</strong>
              </div>
            </div>
          </div>

          {/* Plant Cards in this Room */}
          {filteredPlants.length === 0 ? (
            <div className="luxury-card p-12 text-center space-y-3">
              <Sprout className="w-10 h-10 text-[#6D835C] mx-auto opacity-70" />
              <h4 className="text-sm font-bold text-[#193C0D]">No resident plants in this zone</h4>
              <p className="text-xs text-[#637462] max-w-sm mx-auto">
                This room currently has 0 registered botanical twins. Place an existing plant here or register a new one.
              </p>
              <button
                onClick={() => onOpenAddModal({ roomZone: selectedRoom !== 'all' ? selectedRoom : 'Living Room' })}
                className="luxury-btn-primary px-4 py-2 text-xs font-semibold mt-2"
              >
                + Register Plant in {selectedRoom !== 'all' ? selectedRoom : 'House'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlants.map((plant) => {
                const isCritical = plant.healthScore < 70;
                const isWarning = plant.healthScore < 80;

                return (
                  <div
                    key={plant.id}
                    className={`luxury-card p-5 space-y-4 flex flex-col justify-between ${
                      isCritical ? 'border-[#FFD2D2] hover:border-[#D32F2F]' : isWarning ? 'border-amber-200' : ''
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3.5">
                        <div
                          onClick={() => onSelectPlant(plant.id)}
                          className="relative w-18 h-18 rounded-2xl overflow-hidden shrink-0 border border-[#E4ECE2] cursor-pointer group"
                        >
                          <img src={plant.imageUrl} alt={plant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <span className={`absolute bottom-1 right-1 text-[9px] px-1.5 py-0.5 rounded font-bold ${
                            isCritical ? 'bg-[#FFEBEE] text-[#D32F2F]' : 'bg-white/95 text-[#193C0D]'
                          }`}>
                            {plant.healthScore}%
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4
                              onClick={() => onSelectPlant(plant.id)}
                              className="text-sm font-bold text-[#193C0D] truncate cursor-pointer hover:text-[#4E763B]"
                            >
                              {plant.name}
                            </h4>
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

                      {/* Care Parameters */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="bg-[#F4F7F2] p-2 rounded-xl border border-[#E4ECE2]">
                          <span className="text-[#637462] block text-[10px]">Sunlight Fit</span>
                          <strong className="text-[#193C0D] font-semibold truncate block">{plant.sunlight}</strong>
                        </div>
                        <div className="bg-[#F4F7F2] p-2 rounded-xl border border-[#E4ECE2]">
                          <span className="text-[#637462] block text-[10px]">Water Cycle</span>
                          <strong className="text-[#193C0D] font-semibold">Every {plant.waterIntervalDays}d</strong>
                        </div>
                      </div>
                    </div>

                    {/* Quick Care Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-[#E4ECE2]">
                      <button
                        onClick={() => quickWaterPlant(plant)}
                        className="luxury-btn-outline flex-1 py-1.5 text-[11px] flex items-center justify-center gap-1"
                        title="Water now"
                      >
                        <Droplets className="w-3.5 h-3.5 text-sky-600" />
                        <span>Hydrate</span>
                      </button>

                      <button
                        onClick={() => onNavigateTab('scanner', { plantId: plant.id })}
                        className="luxury-btn-outline flex-1 py-1.5 text-[11px] flex items-center justify-center gap-1"
                        title="Scan foliage"
                      >
                        <Scan className="w-3.5 h-3.5 text-[#4E763B]" />
                        <span>Scan</span>
                      </button>

                      <button
                        onClick={() => onSelectPlant(plant.id)}
                        className="p-1.5 rounded-full hover:bg-[#F4F7F2] text-[#4E763B] border border-[#E4ECE2]"
                        title="View Full Profile"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: ALL PLANTS INVENTORY VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'inventory' && (
        <div className="space-y-6">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'All Specimens' },
              { id: 'indoor', label: 'Indoor Collection' },
              { id: 'outdoor', label: 'Outdoor Canopy' },
              { id: 'warning', label: 'Requires Attention (<80%)' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  categoryFilter === cat.id
                    ? 'bg-[#4E763B] text-white shadow-xs font-bold'
                    : 'bg-white text-[#637462] border border-[#E4ECE2] hover:bg-[#F4F7F2]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlants.map((plant) => (
              <div
                key={plant.id}
                onClick={() => onSelectPlant(plant.id)}
                className="luxury-card p-5 space-y-4 cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="relative h-48 rounded-2xl overflow-hidden border border-[#E4ECE2] bg-[#F7F9F5]">
                    <img src={plant.imageUrl} alt={plant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-[#193C0D] border border-[#E4ECE2]">
                      {plant.healthScore}% Vitality
                    </div>
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-[#4E763B] border border-[#E4ECE2] flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{plant.roomZone || 'Living Room'}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-[#193C0D] group-hover:text-[#4E763B] transition-colors truncate">
                      {plant.name}
                    </h4>
                    <p className="text-xs text-[#637462] italic truncate">{plant.species}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-[#F4F7F2] p-2 rounded-xl border border-[#E4ECE2]">
                      <span className="text-[10px] text-[#637462] block">Sunlight</span>
                      <strong className="text-[#193C0D] font-semibold truncate block">{plant.sunlight}</strong>
                    </div>
                    <div className="bg-[#F4F7F2] p-2 rounded-xl border border-[#E4ECE2]">
                      <span className="text-[10px] text-[#637462] block">Water Cadence</span>
                      <strong className="text-[#193C0D] font-semibold">Every {plant.waterIntervalDays}d</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E4ECE2] flex items-center justify-between text-xs text-[#4E763B] font-semibold">
                  <span>View Digital Twin</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: VACANT LIGHT SPOT TRACKER */}
      {/* ========================================================================= */}
      {viewMode === 'vacant' && (
        <div className="space-y-6">
          <div className="luxury-card p-6 border-[#6D835C]/30 bg-[#F4F7F2]/40 space-y-2">
            <h3 className="text-sm font-bold text-[#193C0D] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#729C65]" />
              <span>Vacant Residential Microclimate Opportunities</span>
            </h3>
            <p className="text-xs text-[#637462] max-w-2xl leading-relaxed">
              These unoccupied areas in your home have measured solar and humidity conditions ideal for specific botanical clades. Tap "+ Place Plant Here" to register a digital twin directly into that spot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {spatialSpots.map((spot) => (
              <div
                key={spot.id}
                className={`luxury-card p-6 space-y-4 flex flex-col justify-between ${
                  spot.isOccupied ? 'opacity-70 bg-[#F7F9F5]' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#4E763B] uppercase tracking-wider block">
                        {spot.room}
                      </span>
                      <h4 className="text-base font-bold text-[#193C0D]">{spot.name}</h4>
                    </div>

                    {spot.isOccupied ? (
                      <span className="bg-[#E4ECE2] text-[#637462] text-[10px] font-bold px-2.5 py-1 rounded-full">
                        Occupied
                      </span>
                    ) : (
                      <span className="bg-[#F4F7F2] text-[#729C65] border border-[#729C65]/40 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        Spot Vacant
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#637462] leading-relaxed">{spot.description}</p>

                  <div className="p-3 bg-[#F4F7F2] rounded-xl border border-[#E4ECE2] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#637462]">Lighting Profile:</span>
                      <strong className="text-[#193C0D]">{spot.lightProfile}</strong>
                    </div>
                    <div className="pt-1 border-t border-[#E4ECE2]/80">
                      <span className="text-[10px] text-[#637462] block mb-1">Recommended Species Fit:</span>
                      <div className="flex flex-wrap gap-1">
                        {spot.optimalSpecies.map((spec, i) => (
                          <span key={i} className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-[#E4ECE2] text-[#193C0D] font-medium">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {!spot.isOccupied ? (
                  <button
                    onClick={() => onOpenAddModal({ roomZone: spot.room, sunlight: spot.lightProfile })}
                    className="luxury-btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Place Plant in {spot.name}</span>
                  </button>
                ) : (
                  <div className="text-xs text-[#637462] italic pt-2 border-t border-[#E4ECE2]">
                    Resident twin active in this spot.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PLANT SITTER PASS MODAL */}
      {/* ========================================================================= */}
      {isSitterPassOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E4ECE2] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-[#E4ECE2]">
              <div>
                <span className="text-[10px] font-bold text-[#4E763B] uppercase tracking-wider block">
                  PhytoSophia Care Pass
                </span>
                <h2 className="text-2xl font-bold text-[#193C0D]">
                  Plant Sitter Home Map & Dossier
                </h2>
                <p className="text-xs text-[#637462] mt-0.5">
                  Print or share this complete spatial guide with plant sitters, house guests, or family members.
                </p>
              </div>

              <button
                onClick={() => setIsSitterPassOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-[#637462] hover:text-[#193C0D] rounded-full hover:bg-[#F4F7F2] transition-colors"
                aria-label="Close plant sitter pass"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Emergency Botanical Instructions */}
            <div className="p-4 rounded-2xl bg-[#F4F7F2] border border-[#6D835C]/30 text-xs space-y-1.5">
              <strong className="text-[#193C0D] block font-bold">House Sitter Instructions:</strong>
              <p className="text-[#637462] leading-relaxed">
                Check soil moisture by inserting index finger 1 inch into substrate before watering. If moist, skip watering. All indoor rooms are climate-controlled between 20°C and 24°C.
              </p>
            </div>

            {/* Room-by-Room Checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#193C0D] uppercase tracking-wider">
                Room-by-Room Plant Checklist
              </h4>

              <div className="space-y-2">
                {plants.map((plant) => (
                  <div key={plant.id} className="p-3 rounded-xl border border-[#E4ECE2] bg-[#F7F9F5] flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-[#193C0D] block font-bold">{plant.name}</strong>
                      <span className="text-[#637462] text-[11px] italic">{plant.species}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-[#4E763B] block">{plant.roomZone || 'Living Room'}</span>
                      <span className="text-[10px] text-[#637462]">Water: Every {plant.waterIntervalDays} days</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-[#E4ECE2]">
              <button
                onClick={() => window.print()}
                className="luxury-btn-outline flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Sitter Pass</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setToastMessage('Plant Sitter Pass link copied to clipboard.');
                  setIsSitterPassOpen(false);
                }}
                className="luxury-btn-primary flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Shareable Link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
