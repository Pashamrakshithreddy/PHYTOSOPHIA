import React, { useState } from 'react';
import { useGarden } from '../../context/GardenContext';
import { roomDb, type PlantEntity } from '../../services/roomDatabase';
import type { DigitalTwinPlant } from '../../types';
import {
  Upload,
  Sprout,
  Sun,
  MapPin,
  X,
  Sparkles,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlantAdded: (plant: DigitalTwinPlant) => void;
  prefill?: {
    roomZone?: string;
    sunlight?: 'Direct Sunlight' | 'Bright Indirect' | 'Partial Shade' | 'Low Light';
  };
}

const SAMPLE_TEMPLATES = [
  { name: 'Swiss Monster', species: 'Monstera deliciosa', family: 'Araceae', genus: 'Monstera', room: 'Living Room', sunlight: 'Bright Indirect', img: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Mango Tree', species: 'Mangifera indica', family: 'Anacardiaceae', genus: 'Mangifera', room: 'Balcony Terrace', sunlight: 'Direct Sunlight', img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80' },
  { name: 'Hybrid Tea Rose', species: 'Rosa rubiginosa', family: 'Rosaceae', genus: 'Rosa', room: 'Greenhouse', sunlight: 'Direct Sunlight', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80' },
  { name: 'True Aloe', species: 'Aloe vera', family: 'Asphodelaceae', genus: 'Aloe', room: 'Kitchen Windowsill', sunlight: 'Bright Indirect', img: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=800&q=80' },
  { name: 'Golden Pothos', species: 'Epipremnum aureum', family: 'Araceae', genus: 'Epipremnum', room: 'Bedroom', sunlight: 'Partial Shade', img: 'https://images.unsplash.com/photo-1597055181374-4b5b7b6c59b6?auto=format&fit=crop&w=800&q=80' },
];

const ROOM_ZONES = [
  'Living Room',
  'Balcony Terrace',
  'Kitchen Windowsill',
  'Bedroom',
  'Greenhouse',
];

export const AddPlantModal: React.FC<AddPlantModalProps> = ({
  isOpen,
  onClose,
  onPlantAdded,
  prefill,
}) => {
  const { addPlant } = useGarden();

  const [inputMode, setInputMode] = useState<'template' | 'upload'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState(SAMPLE_TEMPLATES[0]);

  const [plantName, setPlantName] = useState(SAMPLE_TEMPLATES[0].name);
  const [species, setSpecies] = useState(SAMPLE_TEMPLATES[0].species);
  const [roomZone, setRoomZone] = useState<string>(prefill?.roomZone || SAMPLE_TEMPLATES[0].room);
  const [sunlight, setSunlight] = useState<'Direct Sunlight' | 'Bright Indirect' | 'Partial Shade' | 'Low Light'>(
    prefill?.sunlight || 'Bright Indirect'
  );
  const [baselineHealth, setBaselineHealth] = useState<number>(88);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setCustomImage(url);
      setInputMode('upload');
    }
  };

  const handleSelectTemplate = (tpl: typeof SAMPLE_TEMPLATES[0]) => {
    setSelectedTemplate(tpl);
    setPlantName(tpl.name);
    setSpecies(tpl.species);
    setRoomZone(prefill?.roomZone || tpl.room);
    setSunlight(tpl.sunlight as any);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const chosenImg = customImage || selectedTemplate.img;
    const finalName = plantName.trim() || selectedTemplate.name;
    const finalSpecies = species.trim() || selectedTemplate.species;

    // 1. Add to GardenContext
    const createdPlant = addPlant({
      name: finalName,
      species: finalSpecies,
      taxonomy: {
        family: selectedTemplate.family || 'Plantae Clade',
        genus: selectedTemplate.genus || finalName.split(' ')[0],
        species: finalSpecies,
        commonName: finalName,
        confidence: 0.96,
      },
      imageUrl: chosenImg,
      location: roomZone === 'Balcony Terrace' ? 'Outdoor' : 'Indoor',
      roomZone,
      sunlight,
      notes: `Registered in ${roomZone} with ${baselineHealth}% baseline cellular vitality.`,
      nextTask: { type: 'Watering', dueDate: 'In 3 days' },
    });

    // 2. Also directly ensure Room Database sync
    const newEntity: PlantEntity = {
      id: createdPlant.id,
      name: finalName,
      species: finalSpecies,
      taxonomy: {
        kingdom: 'Plantae',
        order: 'Botanical Clade',
        family: selectedTemplate.family || 'Botanical Family',
        genus: selectedTemplate.genus || finalName.split(' ')[0],
        species: finalSpecies,
        commonName: finalName,
        confidence: 0.96,
      },
      imageUrl: chosenImg,
      location: roomZone === 'Balcony Terrace' ? 'Outdoor' : 'Indoor',
      roomZone,
      sunlight,
      category: roomZone === 'Balcony Terrace' ? 'outdoor' : 'indoor',
      addedDate: new Date().toISOString(),
      healthScore: baselineHealth,
      growthScore: 70,
      growthStage: 'YOUNG',
      healthState: baselineHealth >= 80 ? 'EXCELLENT' : baselineHealth >= 65 ? 'NEEDS_ATTENTION' : 'UNHEALTHY',
      careStreak: 1,
      lastWatered: new Date().toISOString(),
      lastFertilized: new Date().toISOString(),
      lastScanned: new Date().toISOString(),
      notes: `Registered in ${roomZone}. Baseline vitality: ${baselineHealth}%.`,
      petSafe: true,
      waterIntervalDays: sunlight === 'Direct Sunlight' ? 4 : 7,
      fertilizerIntervalDays: 14,
      idealTempRange: '18°C - 28°C',
      idealHumidityRange: '55% - 75%',
      soilEcTarget: '1.2 - 1.6 mS/cm',
    };

    roomDb.plantDao.insert(newEntity);

    confetti({ particleCount: 40, spread: 55, origin: { y: 0.85 } });
    setIsSubmitting(false);
    onPlantAdded(createdPlant);
    onClose();
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-[#729C65]';
    if (score >= 60) return 'text-[#6D835C]';
    return 'text-[#D32F2F]';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-in fade-in">
      <div className="luxury-card relative w-full max-w-2xl bg-white p-6 sm:p-8 overflow-hidden max-h-[90vh] overflow-y-auto space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E4ECE2]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#F4F7F2] text-[#4E763B] border border-[#E4ECE2]">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#193C0D] flex items-center gap-2">
                Register New Plant Digital Twin
                <Sparkles className="w-4 h-4 text-[#729C65]" />
              </h3>
              <p className="text-xs text-[#637462]">
                Initialize spatial placement, species taxonomy, and baseline vitality.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-full text-[#637462] hover:text-[#193C0D] bg-[#F4F7F2] transition-colors"
            aria-label="Close registration dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Photo Selection & Live Upload Preview */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-[#193C0D]">
              1. Specimen Photo (Upload or Select Curated Preset)
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setInputMode('template')}
                className={`py-2 px-3 rounded-full text-xs font-semibold transition-all ${
                  inputMode === 'template'
                    ? 'bg-[#4E763B] text-white shadow-xs'
                    : 'bg-[#F4F7F2] text-[#637462] hover:bg-[#E4ECE2]'
                }`}
              >
                Curated Presets
              </button>
              <label
                className={`py-2 px-3 rounded-full text-xs font-semibold text-center cursor-pointer transition-all ${
                  inputMode === 'upload'
                    ? 'bg-[#4E763B] text-white shadow-xs'
                    : 'bg-[#F4F7F2] text-[#637462] hover:bg-[#E4ECE2]'
                }`}
              >
                <Upload className="w-3.5 h-3.5 inline mr-1" />
                Upload Photo
                <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
              </label>
            </div>

            {/* Presets Grid */}
            {inputMode === 'template' && (
              <div className="grid grid-cols-5 gap-2 pt-1">
                {SAMPLE_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.name}
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`p-1.5 rounded-xl border text-center cursor-pointer transition-all ${
                      selectedTemplate.name === tpl.name && !customImage
                        ? 'border-[#4E763B] bg-[#F4F7F2] ring-2 ring-[#4E763B]/20'
                        : 'border-[#E4ECE2] hover:bg-[#F7F9F5]'
                    }`}
                  >
                    <img src={tpl.img} alt={tpl.name} className="w-full h-12 object-cover rounded-lg mb-1" />
                    <span className="text-[10px] font-bold text-[#193C0D] truncate block">{tpl.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Live Upload Preview */}
            {inputMode === 'upload' && customImage && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F4F7F2] border border-[#E4ECE2]">
                <img src={customImage} alt="Uploaded foliage" className="w-16 h-16 rounded-xl object-cover border border-[#E4ECE2]" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-[#193C0D] block">Custom Leaf Photograph Uploaded</span>
                  <span className="text-[10px] text-[#729C65] font-semibold">Ready for digital twin telemetry</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomImage(null)}
                  className="text-xs text-[#D32F2F] hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* 2. Plant Name & Species Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#193C0D] mb-1.5">
                Plant Moniker / Twin Name
              </label>
              <input
                type="text"
                value={plantName}
                onChange={(e) => setPlantName(e.target.value)}
                placeholder="e.g., Swiss Monster"
                required
                className="w-full bg-[#F7F9F5] border border-[#E4ECE2] rounded-xl px-3.5 py-2.5 text-xs text-[#193C0D] focus:outline-none focus:ring-1 focus:ring-[#4E763B] font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#193C0D] mb-1.5">
                Botanical Species (Taxonomy)
              </label>
              <input
                type="text"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                placeholder="e.g., Monstera deliciosa"
                required
                className="w-full bg-[#F7F9F5] border border-[#E4ECE2] rounded-xl px-3.5 py-2.5 text-xs text-[#193C0D] focus:outline-none focus:ring-1 focus:ring-[#4E763B] italic"
              />
            </div>
          </div>

          {/* 3. Assigned Room / Zone Selector & Sunlight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#193C0D] mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#4E763B]" />
                Assigned Household Room / Zone
              </label>
              <select
                value={roomZone}
                onChange={(e) => setRoomZone(e.target.value)}
                className="w-full bg-[#F7F9F5] border border-[#E4ECE2] rounded-xl px-3.5 py-2.5 text-xs text-[#193C0D] focus:outline-none focus:ring-1 focus:ring-[#4E763B] font-semibold"
              >
                {ROOM_ZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#193C0D] mb-1.5 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-[#4E763B]" />
                Lighting Condition
              </label>
              <select
                value={sunlight}
                onChange={(e) => setSunlight(e.target.value as any)}
                className="w-full bg-[#F7F9F5] border border-[#E4ECE2] rounded-xl px-3.5 py-2.5 text-xs text-[#193C0D] focus:outline-none focus:ring-1 focus:ring-[#4E763B] font-semibold"
              >
                <option value="Direct Sunlight">Direct Sunlight (Balcony / Terrace)</option>
                <option value="Bright Indirect">Bright Indirect (Window Proximity)</option>
                <option value="Partial Shade">Partial Shade (Room Interior)</option>
                <option value="Low Light">Low Light (Hallway / Bedroom Nook)</option>
              </select>
            </div>
          </div>

          {/* 4. Baseline Health Slider */}
          <div className="space-y-2 p-4 rounded-2xl bg-[#F7F9F5] border border-[#E4ECE2]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#193C0D] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#4E763B]" />
                Baseline Health & Cellular Turgor
              </label>
              <span className={`text-sm font-extrabold ${getHealthColor(baselineHealth)}`}>
                {baselineHealth}% Vitality
              </span>
            </div>

            <input
              type="range"
              min="30"
              max="100"
              value={baselineHealth}
              onChange={(e) => setBaselineHealth(Number(e.target.value))}
              className="w-full accent-[#4E763B] cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-[#637462] font-semibold">
              <span>30% (Severe Pathology)</span>
              <span>75% (Needs Monitoring)</span>
              <span className="text-[#729C65]">100% (Pristine)</span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E4ECE2]">
            <button
              type="button"
              onClick={onClose}
              className="luxury-btn-outline px-5 py-2.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="luxury-btn-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering...' : 'Register Digital Twin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
