import React, { useState } from 'react';
import { useGarden } from '../../context/GardenContext';
import type { DigitalTwinPlant } from '../../types';
import { Camera, Upload, Sprout, Sun, MapPin, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlantAdded: (plant: DigitalTwinPlant) => void;
}

const SAMPLE_TEMPLATES = [
  { name: 'Mango Tree', species: 'Mangifera indica', family: 'Anacardiaceae', genus: 'Mangifera', img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80' },
  { name: 'Monstera Deliciosa', species: 'Monstera deliciosa', family: 'Araceae', genus: 'Monstera', img: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Hybrid Tea Rose', species: 'Rosa rubiginosa', family: 'Rosaceae', genus: 'Rosa', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80' },
  { name: 'Aloe Vera', species: 'Aloe vera', family: 'Asphodelaceae', genus: 'Aloe', img: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=800&q=80' },
  { name: 'Japanese Maple', species: 'Acer palmatum', family: 'Sapindaceae', genus: 'Acer', img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80' },
];

export const AddPlantModal: React.FC<AddPlantModalProps> = ({ isOpen, onClose, onPlantAdded }) => {
  const { addPlant } = useGarden();

  const [inputMode, setInputMode] = useState<'upload' | 'camera' | 'template'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState(SAMPLE_TEMPLATES[0]);

  const [plantName, setPlantName] = useState(SAMPLE_TEMPLATES[0].name);
  const [species, setSpecies] = useState(SAMPLE_TEMPLATES[0].species);
  const [location, setLocation] = useState<'Indoor' | 'Outdoor'>('Indoor');
  const [sunlight, setSunlight] = useState<'Direct Sunlight' | 'Bright Indirect' | 'Partial Shade' | 'Low Light'>('Bright Indirect');
  const [notes, setNotes] = useState('Added to my PhytoSophia digital garden twin system.');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCustomImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const chosenImg = customImage || selectedTemplate.img;
      const createdPlant = addPlant({
        name: plantName || selectedTemplate.name,
        species: species || selectedTemplate.species,
        taxonomy: {
          family: selectedTemplate.family,
          genus: selectedTemplate.genus,
          species: species || selectedTemplate.species,
          commonName: plantName || selectedTemplate.name,
          confidence: 0.95,
        },
        imageUrl: chosenImg,
        location,
        sunlight,
        notes,
        nextTask: { type: 'Watering', dueDate: 'In 2 days' },
      });

      setIsSubmitting(false);
      onPlantAdded(createdPlant);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-emerald-500/30 rounded-3xl shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Add Plant & Create Digital Twin
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </h3>
              <p className="text-xs text-slate-400">Initialize persistent 3D state telemetry for your new plant.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              1. Choose Image Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setInputMode('template')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                  inputMode === 'template'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Sprout className="w-4 h-4" />
                Preset Botanical
              </button>
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                  inputMode === 'upload'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </button>
              <button
                type="button"
                onClick={() => setInputMode('camera')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                  inputMode === 'camera'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Camera className="w-4 h-4" />
                Capture Camera
              </button>
            </div>
          </div>

          {inputMode === 'template' && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {SAMPLE_TEMPLATES.map((t, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedTemplate(t);
                    setPlantName(t.name);
                    setSpecies(t.species);
                  }}
                  className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all h-24 ${
                    selectedTemplate.species === t.species
                      ? 'border-emerald-400 ring-2 ring-emerald-400/40 scale-105'
                      : 'border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent p-1.5 flex items-end">
                    <span className="text-[10px] font-bold text-white truncate">{t.name}</span>
                  </div>
                  {selectedTemplate.species === t.species && (
                    <div className="absolute top-1 right-1 bg-emerald-500 text-white p-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {(inputMode === 'upload' || inputMode === 'camera') && (
            <div className="border-2 border-dashed border-emerald-500/30 rounded-2xl p-6 text-center bg-slate-900/50">
              {customImage ? (
                <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden border border-emerald-500/40">
                  <img src={customImage} alt="Uploaded" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setCustomImage(null)}
                    className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-full text-xs"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-2 animate-bounce" />
                  <span className="text-xs font-semibold text-slate-200 block">
                    {inputMode === 'upload' ? 'Click to select plant photo' : 'Access camera capture frame'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">PNG, JPG, WEBP up to 10MB</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Plant Name</label>
              <input
                type="text"
                required
                value={plantName}
                onChange={(e) => setPlantName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                placeholder="e.g. Mango Companion"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Botanical Species</label>
              <input
                type="text"
                required
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                placeholder="e.g. Mangifera indica"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Environment Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as 'Indoor' | 'Outdoor')}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Indoor">Indoor Home / Office</option>
                <option value="Outdoor">Outdoor Garden / Balcony</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Sunlight Exposure
              </label>
              <select
                value={sunlight}
                onChange={(e) => setSunlight(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Direct Sunlight">Direct Sunlight (6+ hrs)</option>
                <option value="Bright Indirect">Bright Indirect Light</option>
                <option value="Partial Shade">Partial Shade</option>
                <option value="Low Light">Low Light</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Optional Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              placeholder="Add care instructions or potting history..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Initializing Digital Twin...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Create Permanent Digital Twin (+100 XP)
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
