import React, { useState } from 'react';
import { roomDb, type PlantEntity } from '../../services/roomDatabase';
import {
  Plus,
  Search,
  Droplets,
  ChevronRight,
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
      p.taxonomy.commonName.toLowerCase().includes(searchQuery.toLowerCase());
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
      setPlants([...roomDb.plantDao.getAll()]);
      confetti({ particleCount: 25, spread: 40, origin: { y: 0.85 } });
      setToastMessage(`Watering recorded for ${plant.name}.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-10 pb-24 animate-in fade-in max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="luxury-card rounded-3xl p-8 sm:p-10 border border-slate-200/70 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Personal Digital Twin Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Plant Collection ({plants.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Each plant maintains a stateful digital twin tracking longitudinal growth curves and care history.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register Plant</span>
        </button>
      </div>

      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold px-4 py-3 rounded-2xl shadow-xs animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by plant name, botanical binomial, or family..."
            className="w-full bg-white border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plant Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPlants.map((plant) => (
          <div
            key={plant.id}
            onClick={() => onSelectPlant(plant.id)}
            className="luxury-card rounded-3xl overflow-hidden border border-slate-200/70 bg-white hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Plant Image Box */}
              <div className="relative h-60 overflow-hidden bg-slate-50">
                <img
                  src={plant.imageUrl}
                  alt={plant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                {/* Health Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-xl backdrop-blur-md shadow-xs ${
                      plant.healthScore >= 85
                        ? 'bg-white/95 text-emerald-800'
                        : 'bg-white/95 text-amber-800'
                    }`}
                  >
                    {plant.healthScore}% Vitality
                  </span>
                </div>

                {/* Category Pill */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-semibold px-2.5 py-1 rounded-xl">
                  {plant.location} • {plant.sunlight}
                </div>

                {/* Title Overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
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
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Streak</span>
                    <strong className="text-slate-800">{plant.careStreak}d</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Water</span>
                    <strong className="text-slate-800">{plant.waterIntervalDays}d</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Feed</span>
                    <strong className="text-slate-800">{plant.fertilizerIntervalDays}d</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-1 italic">
                  "{plant.notes}"
                </p>
              </div>
            </div>

            {/* Bottom Quick Actions */}
            <div className="p-6 pt-0 flex items-center gap-3">
              <button
                onClick={(e) => handleQuickWater(e, plant.id)}
                className="flex-1 py-2.5 bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-800 text-xs font-semibold rounded-xl transition-all border border-slate-200/70 flex items-center justify-center gap-1.5"
              >
                <Droplets className="w-3.5 h-3.5 text-sky-600" />
                <span>Quick Water</span>
              </button>

              <button
                onClick={() => onSelectPlant(plant.id)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1 shadow-xs"
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
