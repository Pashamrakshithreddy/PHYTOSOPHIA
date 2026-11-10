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
  Thermometer,
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
    { id: 'all', label: 'All Botanical Specimens' },
    { id: 'indoor', label: 'Indoor Foliage' },
    { id: 'outdoor', label: 'Outdoor Canopy' },
    { id: 'flowering', label: 'Flowering Perennials' },
    { id: 'succulent', label: 'Succulents & Cacti' },
    { id: 'herbs', label: 'Aromatic Herbs' },
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
      roomZone: plant.category === 'outdoor' ? 'Balcony Terrace' : 'Living Room',
      sunlight: plant.sunlight,
      category: plant.category,
      addedDate: now,
      healthScore: 96,
      growthScore: 32,
      growthStage: 'HEALTHY',
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
    <div className="space-y-8 pb-24 animate-in fade-in max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="luxury-card p-5 sm:p-7 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#729C65]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4E763B]">
              Taxonomic Hierarchy & ASPCA Safety Catalog
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#193C0D] tracking-tight">
            Botanical Encyclopedia
          </h1>
          <p className="text-xs sm:text-sm text-[#637462] font-medium max-w-xl">
            Explore verified taxonomic hierarchies, ASPCA pet-safety profiles, and register any botanical specimen directly into your digital twin sanctuary with one tap.
          </p>
        </div>

        {/* Pet Safety Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-[#F4F7F2] p-1 rounded-2xl border border-[#E4ECE2] text-xs font-semibold self-start md:self-auto shrink-0">
          <button
            onClick={() => setPetFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              petFilter === 'all'
                ? 'bg-white text-[#4E763B] font-bold shadow-xs'
                : 'text-[#637462] hover:text-[#193C0D]'
            }`}
          >
            All Plants
          </button>
          <button
            onClick={() => setPetFilter('safe')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              petFilter === 'safe'
                ? 'bg-white text-[#4E763B] font-bold shadow-xs'
                : 'text-[#637462] hover:text-[#193C0D]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#729C65]" />
            <span>Pet Safe</span>
          </button>
          <button
            onClick={() => setPetFilter('toxic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              petFilter === 'toxic'
                ? 'bg-white text-[#D32F2F] font-bold shadow-xs'
                : 'text-[#637462] hover:text-[#193C0D]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#D32F2F]" />
            <span>Toxic</span>
          </button>
        </div>
      </div>

      {importedToast && (
        <div className="bg-[#F4F7F2] border border-[#6D835C]/30 text-[#193C0D] text-xs font-semibold px-4 py-3 rounded-2xl shadow-xs flex items-center justify-between animate-in fade-in">
          <span>{importedToast}</span>
          <CheckCircle2 className="w-4 h-4 text-[#729C65]" />
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#637462] absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by botanical binomial, common name, or family (e.g., Monstera, Pothos, Snake Plant, Ficus)..."
            className="w-full bg-white border border-[#E4ECE2] rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-[#193C0D] shadow-xs focus:outline-none focus:ring-1 focus:ring-[#4E763B]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#6D835C] text-white shadow-xs'
                  : 'bg-white text-[#637462] border border-[#E4ECE2] hover:bg-[#F4F7F2]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plant Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlants.map((plant) => (
          <div
            key={plant.id}
            className="luxury-card overflow-hidden flex flex-col justify-between group"
          >
            <div>
              {/* Plant Image Box */}
              <div
                onClick={() => setSelectedPlant(plant)}
                className="relative h-60 overflow-hidden cursor-pointer bg-[#F7F9F5]"
              >
                <img
                  src={plant.imageUrl}
                  alt={plant.commonName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Pet Safety Pill */}
                <div className="absolute top-3.5 right-3.5">
                  {plant.petSafe ? (
                    <span className="flex items-center gap-1 bg-white/95 backdrop-blur-md text-[#4E763B] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs border border-[#E4ECE2]">
                      <ShieldCheck className="w-3 h-3 text-[#729C65]" />
                      Pet Safe
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 bg-white/95 backdrop-blur-md text-[#D32F2F] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs border border-[#FFD2D2]">
                      <AlertTriangle className="w-3 h-3 text-[#D32F2F]" />
                      Toxic to Pets
                    </span>
                  )}
                </div>

                {/* Family Badge */}
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider block">
                    {plant.taxonomy.family} • {plant.taxonomy.genus}
                  </span>
                  <h3 className="text-base font-bold truncate text-white">
                    {plant.commonName}
                  </h3>
                </div>
              </div>

              {/* Body Details & Care Specifications */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#637462]">
                  <span className="italic font-medium text-[#4E763B]">{plant.scientificName}</span>
                  <span className="font-semibold text-[#193C0D] bg-[#F4F7F2] px-2.5 py-0.5 rounded-full text-[10px] border border-[#E4ECE2]">
                    {plant.difficulty}
                  </span>
                </div>

                <p className="text-xs text-[#637462] line-clamp-2 leading-relaxed">
                  {plant.description}
                </p>

                {/* Care Specs Grid (Light, Water, Humidity, Temp) */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-semibold">
                  <div className="flex items-center gap-1.5 bg-[#F4F7F2] p-2 rounded-xl border border-[#E4ECE2] text-[#193C0D]">
                    <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">{plant.sunlight}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#F4F7F2] p-2 rounded-xl border border-[#E4ECE2] text-[#193C0D]">
                    <Droplets className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>Every {plant.waterFrequencyDays}d</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#F4F7F2] p-2 rounded-xl border border-[#E4ECE2] text-[#193C0D]">
                    <Droplets className="w-3.5 h-3.5 text-[#4E763B] shrink-0" />
                    <span className="truncate">{plant.idealHumidity}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#F4F7F2] p-2 rounded-xl border border-[#E4ECE2] text-[#193C0D]">
                    <Thermometer className="w-3.5 h-3.5 text-[#6D835C] shrink-0" />
                    <span className="truncate">{plant.idealTemp.split('(')[0].trim()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-5 pt-0 flex items-center gap-2.5">
              <button
                onClick={() => setSelectedPlant(plant)}
                className="luxury-btn-outline flex-1 py-2 text-xs"
              >
                Taxonomy Dossier
              </button>

              <button
                onClick={() => handleImportToGarden(plant)}
                className="luxury-btn-primary flex-1 py-2 text-xs gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>My Garden</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Botanical Dossier Modal */}
      {selectedPlant && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E4ECE2] shadow-2xl space-y-6 p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#4E763B] uppercase tracking-wider block">
                  Taxonomic Profile & ViT Metadata
                </span>
                <h2 className="text-2xl font-bold text-[#193C0D]">
                  {selectedPlant.commonName}
                </h2>
                <p className="text-xs text-[#637462] italic mt-0.5">
                  {selectedPlant.scientificName} • Native to {selectedPlant.origin}
                </p>
              </div>

              <button
                onClick={() => setSelectedPlant(null)}
                className="p-2 text-[#637462] hover:text-[#193C0D] rounded-full hover:bg-[#F4F7F2] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-56 rounded-2xl overflow-hidden relative border border-[#E4ECE2]">
              <img
                src={selectedPlant.imageUrl}
                alt={selectedPlant.commonName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* ViT Taxonomy Hierarchy Table */}
            <div className="bg-[#F4F7F2] p-5 rounded-2xl border border-[#E4ECE2] space-y-2">
              <h4 className="text-xs font-bold text-[#193C0D] uppercase tracking-wider">
                ViT Hierarchical Classification
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[#637462] block text-[10px] font-semibold">Kingdom</span>
                  <strong className="text-[#193C0D]">{selectedPlant.taxonomy.kingdom}</strong>
                </div>
                <div>
                  <span className="text-[#637462] block text-[10px] font-semibold">Order</span>
                  <strong className="text-[#193C0D]">{selectedPlant.taxonomy.order}</strong>
                </div>
                <div>
                  <span className="text-[#637462] block text-[10px] font-semibold">Family</span>
                  <strong className="text-[#193C0D]">{selectedPlant.taxonomy.family}</strong>
                </div>
                <div>
                  <span className="text-[#637462] block text-[10px] font-semibold">Genus</span>
                  <strong className="text-[#193C0D]">{selectedPlant.taxonomy.genus}</strong>
                </div>
              </div>
            </div>

            {/* Toxicity / Pet Alert */}
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 ${
                selectedPlant.petSafe
                  ? 'bg-[#F4F7F2] border-[#6D835C]/30 text-[#193C0D]'
                  : 'bg-[#FFEBEE] border-[#FFD2D2] text-[#D32F2F]'
              }`}
            >
              {selectedPlant.petSafe ? (
                <ShieldCheck className="w-5 h-5 text-[#729C65] shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-[#D32F2F] shrink-0 mt-0.5" />
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
              <div className="p-3 bg-[#F4F7F2] rounded-xl border border-[#E4ECE2]">
                <span className="text-[#637462] block text-[10px] font-semibold">Sunlight</span>
                <span className="font-bold text-[#193C0D]">{selectedPlant.sunlight}</span>
              </div>
              <div className="p-3 bg-[#F4F7F2] rounded-xl border border-[#E4ECE2]">
                <span className="text-[#637462] block text-[10px] font-semibold">Irrigation Interval</span>
                <span className="font-bold text-[#193C0D]">Every {selectedPlant.waterFrequencyDays} days</span>
              </div>
              <div className="p-3 bg-[#F4F7F2] rounded-xl border border-[#E4ECE2]">
                <span className="text-[#637462] block text-[10px] font-semibold">Ideal Temperature</span>
                <span className="font-bold text-[#193C0D]">{selectedPlant.idealTemp}</span>
              </div>
              <div className="p-3 bg-[#F4F7F2] rounded-xl border border-[#E4ECE2]">
                <span className="text-[#637462] block text-[10px] font-semibold">Relative Humidity</span>
                <span className="font-bold text-[#193C0D]">{selectedPlant.idealHumidity}</span>
              </div>
              <div className="p-3 bg-[#F4F7F2] rounded-xl border border-[#E4ECE2]">
                <span className="text-[#637462] block text-[10px] font-semibold">Soil pH</span>
                <span className="font-bold text-[#193C0D]">{selectedPlant.soilPh}</span>
              </div>
              <div className="p-3 bg-[#F4F7F2] rounded-xl border border-[#E4ECE2]">
                <span className="text-[#637462] block text-[10px] font-semibold">Propagation</span>
                <span className="font-bold text-[#193C0D] truncate">{selectedPlant.propagation}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-[#E4ECE2]">
              <button
                onClick={() => setSelectedPlant(null)}
                className="luxury-btn-outline flex-1 py-3 text-xs"
              >
                Close
              </button>
              <button
                onClick={() => handleImportToGarden(selectedPlant)}
                className="luxury-btn-primary flex-1 py-3 text-xs gap-2"
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
