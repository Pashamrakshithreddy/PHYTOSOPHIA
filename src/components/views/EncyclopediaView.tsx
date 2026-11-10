import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ENCYCLOPEDIA_PLANTS,
  type EncyclopediaPlant,
} from '../../services/botanicalData';
import { roomDb, type PlantEntity } from '../../services/roomDatabase';
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  Sun,
  Droplets,
  Plus,
  X,
  CheckCircle2,
} from 'lucide-react';

interface EncyclopediaViewProps {
  onImportSuccess?: (plantId: string) => void;
  onNavigateTab?: (tab: string, extraData?: any) => void;
}

export const EncyclopediaView: React.FC<EncyclopediaViewProps> = ({ onImportSuccess }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [petFilter, setPetFilter] = useState<'all' | 'safe' | 'toxic'>('all');
  const [selectedPlant, setSelectedPlant] = useState<EncyclopediaPlant | null>(null);
  const [importedToast, setImportedToast] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Plants' },
    { id: 'indoor', label: 'Indoor Foliage' },
    { id: 'outdoor', label: 'Outdoor Canopy' },
    { id: 'flowering', label: 'Flowering' },
    { id: 'succulent', label: 'Succulents & Cacti' },
    { id: 'herbs', label: 'Culinary Herbs' },
  ];

  const filteredPlants = ENCYCLOPEDIA_PLANTS.filter((plant) => {
    const matchesSearch =
      plant.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.taxonomy.family.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.taxonomy.genus.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || plant.category === selectedCategory;

    const matchesPet =
      petFilter === 'all' ||
      (petFilter === 'safe' && plant.petSafe) ||
      (petFilter === 'toxic' && !plant.petSafe);

    return matchesSearch && matchesCategory && matchesPet;
  });

  const handleImportToGarden = (plant: EncyclopediaPlant) => {
    const newId = `plant-${plant.taxonomy.genus.toLowerCase()}-${Date.now()}`;
    const now = new Date().toISOString();

    const newTwin: PlantEntity = {
      id: newId,
      name: plant.commonName.split('/')[0].trim(),
      species: plant.scientificName,
      taxonomy: {
        kingdom: plant.taxonomy.kingdom,
        order: plant.taxonomy.order,
        family: plant.taxonomy.family,
        genus: plant.taxonomy.genus,
        species: plant.taxonomy.species,
        commonName: plant.commonName,
        confidence: 0.99,
      },
      imageUrl: plant.imageUrl,
      location: plant.category === 'outdoor' ? 'Outdoor' : 'Indoor',
      sunlight: plant.sunlight,
      category: plant.category,
      addedDate: now,
      healthScore: 95,
      growthScore: 30,
      growthStage: 'SPROUT',
      healthState: 'EXCELLENT',
      careStreak: 1,
      lastWatered: now,
      lastFertilized: now,
      lastScanned: now,
      notes: `Imported from Botanical Encyclopedia. Origin: ${plant.origin}`,
      petSafe: plant.petSafe,
      waterIntervalDays: plant.waterFrequencyDays,
      fertilizerIntervalDays: plant.fertilizerFrequencyDays,
      idealTempRange: plant.idealTemp,
      idealHumidityRange: plant.idealHumidity,
      soilEcTarget: '1.2 - 1.5 mS/cm',
    };

    roomDb.plantDao.insert(newTwin);

    roomDb.careTaskDao.insert({
      id: `task-init-${Date.now()}`,
      plantId: newId,
      plantName: newTwin.name,
      plantSpecies: newTwin.species,
      taskType: 'Watering',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * plant.waterFrequencyDays).toISOString().split('T')[0],
      isCompleted: false,
      frequencyDays: plant.waterFrequencyDays,
      xpReward: 35,
      priority: 'medium',
    });

    confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    setImportedToast(`"${newTwin.name}" registered to My Garden as a new Digital Twin.`);
    setTimeout(() => setImportedToast(null), 4000);

    if (selectedPlant) setSelectedPlant(null);
    if (onImportSuccess) onImportSuccess(newId);
  };

  return (
    <div className="space-y-10 pb-24 animate-in fade-in max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="luxury-card rounded-3xl p-8 sm:p-10 border border-slate-200/70 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Taxonomic Hierarchy & ASPCA Safety Catalog
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Botanical Encyclopedia
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl">
            Explore verified taxonomic hierarchies, ASPCA pet-safety profiles, and register any botanical specimen directly into your digital twin sanctuary with one tap.
          </p>
        </div>

        {/* Pet Safety Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start md:self-auto shrink-0">
          <button
            onClick={() => setPetFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              petFilter === 'all'
                ? 'bg-white text-emerald-800 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Plants
          </button>
          <button
            onClick={() => setPetFilter('safe')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              petFilter === 'safe'
                ? 'bg-white text-emerald-800 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pet Safe</span>
          </button>
          <button
            onClick={() => setPetFilter('toxic')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              petFilter === 'toxic'
                ? 'bg-white text-rose-800 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Toxic</span>
          </button>
        </div>
      </div>

      {importedToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold px-4 py-3 rounded-2xl shadow-xs flex items-center justify-between animate-in fade-in">
          <span>{importedToast}</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by botanical binomial, common name, or family (e.g., Monstera, Araceae, Rose)..."
            className="w-full bg-white border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plant Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPlants.map((plant) => (
          <div
            key={plant.id}
            className="luxury-card rounded-3xl overflow-hidden border border-slate-200/70 bg-white flex flex-col justify-between group"
          >
            <div>
              {/* Plant Image Box */}
              <div
                onClick={() => setSelectedPlant(plant)}
                className="relative h-64 overflow-hidden cursor-pointer bg-slate-50"
              >
                <img
                  src={plant.imageUrl}
                  alt={plant.commonName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                {/* Pet Safety Pill */}
                <div className="absolute top-4 right-4">
                  {plant.petSafe ? (
                    <span className="flex items-center gap-1 bg-white/95 backdrop-blur-md text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-xl shadow-xs">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Pet Safe
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 bg-white/95 backdrop-blur-md text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded-xl shadow-xs">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      Toxic to Pets
                    </span>
                  )}
                </div>

                {/* Family Badge */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                    {plant.taxonomy.family} • {plant.taxonomy.genus}
                  </span>
                  <h3 className="text-base font-bold truncate">
                    {plant.commonName}
                  </h3>
                </div>
              </div>

              {/* Body Details */}
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="italic font-medium">{plant.scientificName}</span>
                  <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full text-[11px]">
                    {plant.difficulty}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {plant.description}
                </p>

                {/* Care specs chips */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-semibold text-slate-600">
                  <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{plant.sunlight}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <Droplets className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span>Every {plant.waterFrequencyDays}d</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 pt-0 flex items-center gap-3">
              <button
                onClick={() => setSelectedPlant(plant)}
                className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200/70 transition-all"
              >
                Taxonomy Dossier
              </button>

              <button
                onClick={() => handleImportToGarden(plant)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>My Garden</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Botanical Dossier Modal */}
      {selectedPlant && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl space-y-6 p-8">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Taxonomic Profile
                </span>
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedPlant.commonName}
                </h2>
                <p className="text-xs text-slate-500 italic mt-0.5">
                  {selectedPlant.scientificName} • Native to {selectedPlant.origin}
                </p>
              </div>

              <button
                onClick={() => setSelectedPlant(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-56 rounded-2xl overflow-hidden relative border border-slate-200">
              <img
                src={selectedPlant.imageUrl}
                alt={selectedPlant.commonName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* ViT Taxonomy Hierarchy Table */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                ViT Hierarchical Classification
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold">Kingdom</span>
                  <strong className="text-slate-800">{selectedPlant.taxonomy.kingdom}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold">Order</span>
                  <strong className="text-slate-800">{selectedPlant.taxonomy.order}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold">Family</span>
                  <strong className="text-slate-800">{selectedPlant.taxonomy.family}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold">Genus</span>
                  <strong className="text-slate-800">{selectedPlant.taxonomy.genus}</strong>
                </div>
              </div>
            </div>

            {/* Toxicity / Pet Alert */}
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 ${
                selectedPlant.petSafe
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/60 border-rose-200 text-rose-900'
              }`}
            >
              {selectedPlant.petSafe ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <span className="font-bold block">
                  {selectedPlant.petSafe ? 'ASPCA Verified Pet-Safe' : 'Toxicity Notice'}
                </span>
                <p className="mt-0.5 leading-relaxed">
                  {selectedPlant.petSafe
                    ? 'Non-toxic to domestic felines and canines. Suitable for pet-friendly urban environments.'
                    : selectedPlant.petWarning || 'Toxic if ingested. Keep out of reach of curious cats and dogs.'}
                </p>
              </div>
            </div>

            {/* Care Protocol Specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold">Sunlight</span>
                <span className="font-bold text-slate-800">{selectedPlant.sunlight}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold">Irrigation Interval</span>
                <span className="font-bold text-slate-800">Every {selectedPlant.waterFrequencyDays} days</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold">Ideal Temperature</span>
                <span className="font-bold text-slate-800">{selectedPlant.idealTemp}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold">Relative Humidity</span>
                <span className="font-bold text-slate-800">{selectedPlant.idealHumidity}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold">Soil pH</span>
                <span className="font-bold text-slate-800">{selectedPlant.soilPh}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold">Propagation</span>
                <span className="font-bold text-slate-800 truncate">{selectedPlant.propagation}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedPlant(null)}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => handleImportToGarden(selectedPlant)}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Register as Digital Twin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
