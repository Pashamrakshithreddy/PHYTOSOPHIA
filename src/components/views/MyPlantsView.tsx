import React, { useState } from 'react';
import { roomDb, type PlantEntity } from '../../services/roomDatabase';
import {
  Plus,
  Search,
  Droplets,
  ChevronRight,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MyPlantsViewProps {
  onSelectPlant: (plantId: string) => void;
  onOpenAddModal: () => void;
}

export const MyPlantsView: React.FC<MyPlantsViewProps> = ({ onSelectPlant, onOpenAddModal }) => {
  const [plants, setPlants] = useState<PlantEntity[]>(() => roomDb.plantDao.getAll());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Plants' },
    { id: 'indoor', label: 'Indoor' },
    { id: 'outdoor', label: 'Outdoor' },
    { id: 'flowering', label: 'Flowering' },
    { id: 'succulent', label: 'Succulents' },
    { id: 'herbs', label: 'Herbs' },
  ];

  const filteredPlants = plants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.taxonomy.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.roomZone && p.roomZone.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleQuickWater = (e: React.MouseEvent, plantId: string) => {
    e.stopPropagation();
    const plant = roomDb.plantDao.getById(plantId);
    if (plant) {
      plant.lastWatered = new Date().toISOString();
      plant.healthScore = Math.min(100, plant.healthScore + 2);
      plant.careStreak = (plant.careStreak || 0) + 1;
      roomDb.plantDao.update(plant);
      setPlants(roomDb.plantDao.getAll());
      confetti({ particleCount: 25, spread: 40, origin: { y: 0.85 } });
      setToastMessage(`Watering recorded for ${plant.name}.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="luxury-card p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#729C65]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4E763B]">
              Personal Digital Twin Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#193C0D] tracking-tight">
            My Plant Collection ({plants.length})
          </h1>
          <p className="text-xs sm:text-sm text-[#637462] font-medium">
            Each plant maintains a stateful digital twin tracking longitudinal growth curves and care history.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="luxury-btn-primary px-4 py-2.5 text-xs font-semibold gap-1.5 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register Plant</span>
        </button>
      </div>

      {toastMessage && (
        <div className="bg-[#F4F7F2] border border-[#6D835C] text-[#193C0D] text-xs font-semibold px-4 py-3 rounded-2xl shadow-xs flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#729C65]" />
            {toastMessage}
          </span>
          <button onClick={() => setToastMessage(null)} className="text-[#637462] hover:text-[#193C0D]">✕</button>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#637462] absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by plant name, botanical binomial, or household room..."
            className="w-full bg-white border border-[#E4ECE2] rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-[#193C0D] shadow-xs focus:outline-none focus:ring-1 focus:ring-[#4E763B]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat.id
                  ? 'bg-[#4E763B] text-white shadow-xs'
                  : 'bg-white text-[#637462] border border-[#E4ECE2] hover:bg-[#F4F7F2]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plant Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlants.map((plant) => (
          <div
            key={plant.id}
            onClick={() => onSelectPlant(plant.id)}
            className="luxury-card overflow-hidden transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Plant Image Box */}
              <div className="relative h-60 overflow-hidden bg-[#F7F9F5]">
                <img
                  src={plant.imageUrl}
                  alt={plant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#193C0D]/65 via-transparent to-transparent" />

                {/* Health Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md shadow-xs border ${
                      plant.healthScore >= 80
                        ? 'bg-white/95 text-[#4E763B] border-[#E4ECE2]'
                        : 'bg-[#FFEBEE] text-[#D32F2F] border-[#FFD2D2]'
                    }`}
                  >
                    {plant.healthScore}% Vitality
                  </span>
                </div>

                {/* Room Location Pill */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[#193C0D] text-[10px] font-semibold px-2.5 py-1 rounded-full border border-[#E4ECE2] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#4E763B]" />
                  <span>{plant.roomZone || 'Living Room'}</span>
                </div>

                {/* Title Overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#729C65] block">
                    {plant.growthStage} Stage
                  </span>
                  <h3 className="text-base font-bold truncate">
                    {plant.name}
                  </h3>
                  <p className="text-xs text-slate-200 italic truncate">{plant.species}</p>
                </div>
              </div>

              {/* Card Meta Body */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-[#F7F9F5] rounded-xl border border-[#E4ECE2]">
                    <span className="text-[10px] text-[#637462] block font-semibold">Streak</span>
                    <strong className="text-[#193C0D]">{plant.careStreak}d</strong>
                  </div>
                  <div className="p-2.5 bg-[#F7F9F5] rounded-xl border border-[#E4ECE2]">
                    <span className="text-[10px] text-[#637462] block font-semibold">Water</span>
                    <strong className="text-[#193C0D]">{plant.waterIntervalDays}d</strong>
                  </div>
                  <div className="p-2.5 bg-[#F7F9F5] rounded-xl border border-[#E4ECE2]">
                    <span className="text-[10px] text-[#637462] block font-semibold">Feed</span>
                    <strong className="text-[#193C0D]">{plant.fertilizerIntervalDays}d</strong>
                  </div>
                </div>

                <p className="text-xs text-[#637462] line-clamp-1 italic">
                  "{plant.notes}"
                </p>
              </div>
            </div>

            {/* Bottom Quick Actions */}
            <div className="p-6 pt-0 flex items-center gap-3">
              <button
                onClick={(e) => handleQuickWater(e, plant.id)}
                className="luxury-btn-outline flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
              >
                <Droplets className="w-3.5 h-3.5 text-sky-600" />
                <span>Quick Water</span>
              </button>

              <button
                onClick={() => onSelectPlant(plant.id)}
                className="luxury-btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1"
              >
                <span>Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
