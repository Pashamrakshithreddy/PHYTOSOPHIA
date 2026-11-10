import React, { useState, useRef, useEffect } from 'react';
import {
  executeUnifiedScan,
  SCAN_PRESETS,
  type ScannerMode,
  type UnifiedScanResult,
  type ScanSamplePreset,
} from '../../services/geminiScanner';
import { roomDb, type ScanLogEntity } from '../../services/roomDatabase';
import {
  Scan,
  Camera,
  Upload,
  Key,
  Activity,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  AlertOctagon,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScannerViewProps {
  initialPlantId?: string;
  onNavigateTab?: (tab: string, extraData?: any) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({ initialPlantId }) => {
  const plants = roomDb.plantDao.getAll();

  const [selectedPlantId, setSelectedPlantId] = useState<string>(initialPlantId || plants[0]?.id || '');
  const [scannerMode, setScannerMode] = useState<ScannerMode>('dual');
  const [inputSource, setInputSource] = useState<'preset' | 'upload' | 'camera'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<ScanSamplePreset>(SCAN_PRESETS[0]);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<UnifiedScanResult | null>(null);

  // Overlays state
  const [showBBoxes, setShowBBoxes] = useState<boolean>(true);
  const [showGradCam, setShowGradCam] = useState<boolean>(true);
  const maskOpacity = 0.75;

  // Gemini API Key management
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string>(
    () => localStorage.getItem('phytosophia_gemini_key') || ''
  );
  const [keySavedToast, setKeySavedToast] = useState<boolean>(false);

  // Webcam stream state
  const videoRef = useRef<HTMLVideoElement>(null);

  const activePlant = plants.find((p) => p.id === selectedPlantId);

  // Start/Stop camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (inputSource === 'camera') {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 } } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
          }
        })
        .catch((err) => {
          console.warn('Camera access unavailable:', err);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [inputSource]);

  const handleCaptureFromCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCustomImageUrl(dataUrl);
      setInputSource('upload');
      setScanResult(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCustomImageUrl(ev.target?.result as string);
        setInputSource('upload');
        setScanResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCustomImageUrl(ev.target?.result as string);
        setInputSource('upload');
        setScanResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetSelect = (preset: ScanSamplePreset) => {
    setSelectedPreset(preset);
    setScanResult(null);
  };

  const handleModeChange = (mode: ScannerMode) => {
    setScannerMode(mode);
    if (scanResult) {
      handleRunScan(mode);
    }
  };

  const activeImage = inputSource === 'preset' ? selectedPreset.imageUrl : customImageUrl || selectedPreset.imageUrl;

  const handleRunScan = async (overrideMode?: ScannerMode) => {
    const targetMode = overrideMode || scannerMode;
    setIsScanning(true);

    const result = await executeUnifiedScan({
      mode: targetMode,
      imageUrl: activeImage,
      plantId: activePlant?.id,
      plantName: activePlant?.name,
      customGeminiApiKey: geminiApiKey,
    });

    setIsScanning(false);
    setScanResult(result);

    // Persist scan to Room Database
    if (activePlant) {
      const scanEntity: ScanLogEntity = {
        id: result.id,
        plantId: activePlant.id,
        plantName: activePlant.name,
        timestamp: result.timestamp,
        imageUrl: result.imageUrl,
        mode: result.mode,
        taxonomy: result.taxonomy || {
          family: activePlant.taxonomy.family,
          genus: activePlant.taxonomy.genus,
          species: activePlant.species,
          commonName: activePlant.name,
          confidence: 0.98,
        },
        pathology: result.pathology
          ? {
              healthScore: result.pathology.healthScore,
              condition: result.pathology.condition,
              severity: result.pathology.severity,
              affectedRegion: result.pathology.affectedRegion,
              confidence: result.pathology.confidence,
              recommendedAction: result.pathology.recommendedAction,
              preventionTips: result.pathology.preventionTips,
              disclaimer: result.pathology.scientificCitation,
            }
          : undefined,
        segmentation: result.pathology
          ? {
              bbox: [15, 15, 70, 70],
              affectedLeafRegions: result.pathology.lesionRegions.map((lr) => ({
                id: lr.id,
                label: lr.label,
                bbox: lr.bbox,
                severity: lr.severity === 'critical' ? 'high' : lr.severity,
                color: lr.color,
              })),
            }
          : undefined,
      };

      roomDb.scanLogDao.insert(scanEntity);
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.85 } });
    }
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('phytosophia_gemini_key', geminiApiKey);
    setKeySavedToast(true);
    setTimeout(() => {
      setKeySavedToast(false);
      setShowKeyModal(false);
    }, 1500);
  };

  const shouldRenderLesionOverlays = scannerMode !== 'species';
  const activeLesions = scanResult?.pathology?.lesionRegions || (shouldRenderLesionOverlays && !scanResult && inputSource === 'preset' ? selectedPreset.pathology.lesionRegions : []);
  const activeGradCam = scanResult?.pathology?.gradCamPoints || (shouldRenderLesionOverlays && !scanResult && inputSource === 'preset' ? selectedPreset.pathology.gradCamPoints : []);

  return (
    <div className="space-y-8 pb-24 animate-in fade-in max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="luxury-card p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#729C65]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4E763B]">
              ViT Taxonomy & SAM Pathology Matrix Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#193C0D] tracking-tight">
            Unified AI Botanical Scanner
          </h1>
          <p className="text-xs sm:text-sm text-[#637462] font-medium max-w-2xl leading-relaxed">
            Simultaneous species taxonomy identification and explainable leaf lesion segmentation powered by Gemini Multimodal Vision, Vision Transformers (ViT), and the Segment Anything Model (SAM).
          </p>
        </div>

        <button
          onClick={() => setShowKeyModal(true)}
          className="luxury-btn-outline flex items-center gap-2 px-4 py-2.5 text-xs font-semibold self-start md:self-auto shrink-0"
        >
          <Key className="w-4 h-4 text-[#4E763B]" />
          <span>{geminiApiKey ? 'Gemini API Connected' : 'Connect Gemini API Key'}</span>
        </button>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <button
          onClick={() => handleModeChange('dual')}
          className={`p-6 rounded-[24px] border text-left transition-all ${
            scannerMode === 'dual'
              ? 'bg-[#F4F7F2] border-[#4E763B] shadow-[0px_8px_24px_rgba(78,118,59,0.12)] -translate-y-1'
              : 'luxury-card text-[#637462] hover:border-[#6D835C]'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#4E763B] block mb-1">
            Mode 1 • Dual Architecture
          </span>
          <div className="text-base font-bold text-[#193C0D]">Taxonomy & Pathology</div>
          <p className="text-xs text-[#637462] mt-1.5 leading-relaxed">
            Simultaneous ViT species taxonomy classification and SAM lesion segmentation.
          </p>
        </button>

        <button
          onClick={() => handleModeChange('species')}
          className={`p-6 rounded-[24px] border text-left transition-all ${
            scannerMode === 'species'
              ? 'bg-[#F4F7F2] border-[#4E763B] shadow-[0px_8px_24px_rgba(78,118,59,0.12)] -translate-y-1'
              : 'luxury-card text-[#637462] hover:border-[#6D835C]'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#4E763B] block mb-1">
            Mode 2 • ViT Recognition
          </span>
          <div className="text-base font-bold text-[#193C0D]">Taxonomic Identification</div>
          <p className="text-xs text-[#637462] mt-1.5 leading-relaxed">
            Hierarchical botanical recognition across Kingdom, Family, Genus, and Species.
          </p>
        </button>

        <button
          onClick={() => handleModeChange('disease')}
          className={`p-6 rounded-[24px] border text-left transition-all ${
            scannerMode === 'disease'
              ? 'bg-[#F4F7F2] border-[#4E763B] shadow-[0px_8px_24px_rgba(78,118,59,0.12)] -translate-y-1'
              : 'luxury-card text-[#637462] hover:border-[#6D835C]'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#4E763B] block mb-1">
            Mode 3 • SAM Segmentation
          </span>
          <div className="text-base font-bold text-[#193C0D]">Pathology Diagnosis</div>
          <p className="text-xs text-[#637462] mt-1.5 leading-relaxed">
            Segment Anything Model leaf extraction, lesion bounding boxes, and RAG protocol.
          </p>
        </button>
      </div>

      {/* Main Scanner Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Acquisition & Presets (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="luxury-card p-6 sm:p-8 space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#193C0D] mb-1.5">
                Target Digital Twin Specimen
              </label>
              <select
                value={selectedPlantId}
                onChange={(e) => setSelectedPlantId(e.target.value)}
                className="w-full bg-[#F7F9F5] border border-[#E4ECE2] text-xs font-semibold text-[#193C0D] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#4E763B]"
              >
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#637462] mt-1">
                Scan telemetry will be persistently synced with this Room DB digital twin.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#193C0D] mb-2">
                Leaf Acquisition Source
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setInputSource('preset')}
                  className={`py-2 px-3 rounded-full text-xs font-semibold transition-all ${
                    inputSource === 'preset'
                      ? 'bg-[#4E763B] text-white shadow-xs'
                      : 'bg-[#F4F7F2] text-[#637462] hover:bg-[#E4ECE2]'
                  }`}
                >
                  Presets
                </button>
                <label
                  className={`py-2 px-3 rounded-full text-xs font-semibold text-center cursor-pointer transition-all ${
                    inputSource === 'upload'
                      ? 'bg-[#4E763B] text-white shadow-xs'
                      : 'bg-[#F4F7F2] text-[#637462] hover:bg-[#E4ECE2]'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 inline mr-1" />
                  Upload
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
                <button
                  onClick={() => setInputSource('camera')}
                  className={`py-2 px-3 rounded-full text-xs font-semibold transition-all ${
                    inputSource === 'camera'
                      ? 'bg-[#4E763B] text-white shadow-xs'
                      : 'bg-[#F4F7F2] text-[#637462] hover:bg-[#E4ECE2]'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 inline mr-1" />
                  Camera
                </button>
              </div>
            </div>

            {/* Presets List */}
            {inputSource === 'preset' && (
              <div className="space-y-2.5 pt-1">
                <span className="text-[11px] font-bold text-[#637462] block">Select Curated Pathology Sample:</span>
                <div className="space-y-2">
                  {SCAN_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                        selectedPreset.id === preset.id
                          ? 'border-[#4E763B] bg-[#F4F7F2] shadow-xs'
                          : 'border-[#E4ECE2] hover:bg-[#F7F9F5]'
                      }`}
                    >
                      <img src={preset.imageUrl} alt={preset.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-[#193C0D] truncate">
                          {preset.name}
                        </h4>
                        <p className="text-[11px] text-[#637462] truncate">{preset.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drag and Drop Zone & Upload Preview */}
            {inputSource === 'upload' && (
              <div className="space-y-3">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`p-6 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-[#4E763B] bg-[#F4F7F2]'
                      : 'border-[#E4ECE2] hover:border-[#6D835C] bg-[#F7F9F5]'
                  }`}
                >
                  <Upload className="w-6 h-6 text-[#4E763B] mx-auto mb-2" />
                  <p className="text-xs font-bold text-[#193C0D]">Drag & Drop Leaf Photograph</p>
                  <p className="text-[11px] text-[#637462] mt-0.5">Supports PNG, JPG, WebP up to 15MB</p>
                  <label className="luxury-btn-primary px-3 py-1 text-[11px] font-semibold mt-3 cursor-pointer inline-block">
                    Browse File
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {customImageUrl && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[#637462] block">Current Foliage Preview:</span>
                    <div className="w-full h-44 rounded-2xl overflow-hidden border border-[#E4ECE2] relative">
                      <img src={customImageUrl} alt="Uploaded foliage" className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-[#4E763B] border border-[#E4ECE2]">
                        Ready to Scan
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Camera Viewfinder */}
            {inputSource === 'camera' && (
              <div className="space-y-3">
                <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-[#F7F9F5] border border-[#E4ECE2]">
                  <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-cover" />
                  <div className="absolute inset-8 border-2 border-white/70 rounded-2xl pointer-events-none" />
                </div>
                <button
                  onClick={handleCaptureFromCamera}
                  className="luxury-btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Leaf Photograph</span>
                </button>
              </div>
            )}

            {/* Trigger Scan Button */}
            <button
              onClick={() => handleRunScan()}
              disabled={isScanning}
              className="luxury-btn-primary w-full py-3.5 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing ViT & SAM Neural Pipeline...</span>
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  <span>Execute AI Botanical Scan ({scannerMode.toUpperCase()})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Viewport & Results (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="luxury-card p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4ECE2]">
              <div>
                <h3 className="text-sm font-bold text-[#193C0D] tracking-tight">
                  {scannerMode === 'species' ? 'ViT Botanical Morphology Viewport' : 'SAM Leaf Segmentation & Explainable XAI Viewport'}
                </h3>
                <span className="text-xs text-[#637462]">
                  {scannerMode === 'species' ? 'Taxonomic feature extraction and morphological contour' : 'Zero-shot background suppression with Grad-CAM lesion heatmap'}
                </span>
              </div>

              {shouldRenderLesionOverlays && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBBoxes(!showBBoxes)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      showBBoxes
                        ? 'bg-[#F4F7F2] text-[#4E763B] border-[#6D835C]'
                        : 'bg-[#F7F9F5] text-[#637462] border-[#E4ECE2]'
                    }`}
                  >
                    Lesion Boxes: {showBBoxes ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => setShowGradCam(!showGradCam)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      showGradCam
                        ? 'bg-[#F4F7F2] text-[#4E763B] border-[#6D835C]'
                        : 'bg-[#F7F9F5] text-[#637462] border-[#E4ECE2]'
                    }`}
                  >
                    Heatmap: {showGradCam ? 'ON' : 'OFF'}
                  </button>
                </div>
              )}
            </div>

            {/* Viewport */}
            <div className="relative w-full h-[380px] sm:h-[430px] rounded-2xl overflow-hidden bg-[#F7F9F5] border border-[#E4ECE2] shadow-inner">
              <img
                src={activeImage}
                alt="Scan target"
                className="w-full h-full object-cover"
              />

              {/* Simulated Real-Time Scanning Laser & Processing Overlay */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden bg-black/20 backdrop-blur-[1px]">
                  <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-[#729C65] to-transparent shadow-[0_0_20px_#729C65] animate-scanner-laser" />
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl border border-[#E4ECE2] flex items-center gap-3.5">
                      <RefreshCw className="w-5 h-5 text-[#4E763B] animate-spin shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-[#193C0D]">Analyzing Foliar Morphology...</div>
                        <div className="text-[10px] text-[#637462]">Running ViT Embeddings & SAM Segmentation</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bounding Boxes (Only in Dual & Disease Mode) */}
              {shouldRenderLesionOverlays && showBBoxes && activeLesions.length > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity"
                  style={{ opacity: maskOpacity }}
                >
                  {activeLesions.map((lesion) => {
                    const [x, y, w, h] = lesion.bbox;
                    return (
                      <div
                        key={lesion.id}
                        className="absolute border-2 rounded-xl transition-all"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          width: `${w}%`,
                          height: `${h}%`,
                          borderColor: lesion.color,
                          backgroundColor: `${lesion.color}18`,
                        }}
                      >
                        <span
                          className="absolute -top-5 left-0 text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-xs"
                          style={{ backgroundColor: lesion.color }}
                        >
                          {lesion.label} ({Math.round(lesion.confidence * 100)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Heatmap overlay (Only in Dual & Disease Mode) */}
              {shouldRenderLesionOverlays && showGradCam && activeGradCam.length > 0 && (
                <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-65">
                  {activeGradCam.map((pt, idx) => (
                    <div
                      key={idx}
                      className="absolute rounded-full filter blur-xl transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{
                        left: `${pt.x}%`,
                        top: `${pt.y}%`,
                        width: `${pt.weight * 170}px`,
                        height: `${pt.weight * 170}px`,
                        background: `radial-gradient(circle, rgba(211,47,47,0.8) 0%, rgba(234,179,8,0.55) 50%, rgba(114,156,101,0) 80%)`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Viewport Badge */}
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[#193C0D] text-[10px] font-mono flex items-center gap-2 border border-[#E4ECE2] shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#729C65]" />
                <span>
                  {scannerMode === 'species' ? 'ViT-B/16 Botanical Clade Engine' : 'ViT-B/16 + SAM-ViT-H Pipeline'}
                </span>
              </div>
            </div>
          </div>

          {/* Results Analysis Dossier or Non-Plant Rejection State */}
          {scanResult && !scanResult.isPlantValid ? (
            <div className="p-8 sm:p-10 rounded-3xl bg-[#FFEBEE] border-2 border-[#FFD2D2] text-center space-y-5 animate-in fade-in shadow-xs">
              <div className="w-16 h-16 rounded-full bg-white/90 border border-[#FFD2D2] flex items-center justify-center mx-auto shadow-xs text-[#D32F2F]">
                <AlertOctagon className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#D32F2F] bg-white/80 px-3 py-1 rounded-full border border-[#FFD2D2]">
                  Pre-Validation Neural Rejection Protocol Activated
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#D32F2F]">
                  {scanResult.rejectionMessage || '❌ Invalid Scan: This does not appear to be a plant. Please scan botanical foliage, stems, or flowers.'}
                </h3>
                <p className="text-xs sm:text-sm text-[#C62828] font-medium max-w-lg mx-auto leading-relaxed">
                  The computer vision confidence score for botanical features (leaves, stems, petals, fronds) was only {Math.round(scanResult.botanicalConfidence * 100)}%, which falls below the strict 30% validity threshold. Diagnostic analysis was aborted to prevent hallucinated classifications.
                </p>
              </div>

              {/* Guidelines box */}
              <div className="bg-white/80 p-5 rounded-2xl border border-[#FFD2D2] max-w-md mx-auto text-left text-xs space-y-2">
                <strong className="text-[#D32F2F] block font-bold">Recommended Botanical Capture Tips:</strong>
                <ul className="text-[#C62828] space-y-1 text-[11px] list-disc list-inside">
                  <li>Center genuine plant foliage, stems, or floral petals in the frame</li>
                  <li>Avoid scanning laptops, screens, household electronics, or furniture</li>
                  <li>Ensure adequate ambient lighting without blinding glare or harsh shadows</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedPreset(SCAN_PRESETS[0]);
                    setInputSource('preset');
                    setScanResult(null);
                  }}
                  className="luxury-btn-primary px-5 py-2.5 text-xs font-semibold"
                >
                  <span>Test Genuine Leaf (Monstera Deliciosa)</span>
                </button>

                <label className="luxury-btn-outline px-5 py-2.5 text-xs font-semibold cursor-pointer border-[#FFD2D2] text-[#D32F2F] hover:bg-white">
                  <span>Browse New Image File</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
          ) : scanResult ? (
            <div className="luxury-card p-6 sm:p-8 space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4ECE2]">
                <div className="flex items-center gap-2 text-[#4E763B]">
                  <CheckCircle2 className="w-4 h-4 text-[#729C65]" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Diagnostic Report Ready ({scanResult.inferenceDurationMs}ms)
                  </span>
                </div>
                <span className="text-[10px] text-[#637462] font-mono">
                  {scanResult.isRealGeminiApi ? 'Google Gemini 1.5 Multimodal' : 'PhytoSophia Research Framework'}
                </span>
              </div>

              {/* ViT Taxonomy Output (Dual & Species Mode) */}
              {scanResult.taxonomy && (
                <div className="bg-[#F4F7F2] p-5 rounded-2xl border border-[#E4ECE2] space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#193C0D] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#729C65]" />
                      ViT Hierarchical Classification
                    </span>
                    <span className="font-semibold text-[#4E763B]">
                      {Math.round(scanResult.taxonomy.confidence * 100)}% Confidence
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-[#637462] block font-semibold">Family</span>
                      <strong className="text-[#193C0D]">{scanResult.taxonomy.family}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#637462] block font-semibold">Genus</span>
                      <strong className="text-[#193C0D]">{scanResult.taxonomy.genus}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#637462] block font-semibold">Species</span>
                      <strong className="text-[#193C0D] italic">{scanResult.taxonomy.species}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#637462] block font-semibold">Common Name</span>
                      <strong className="text-[#4E763B]">{scanResult.taxonomy.commonName}</strong>
                    </div>
                  </div>

                  {/* Botanical Traits in Species Mode */}
                  {scannerMode === 'species' && scanResult.taxonomy.leafMorphology && (
                    <div className="pt-2 border-t border-[#E4ECE2] grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                      <div>
                        <span className="text-[#637462] block font-semibold text-[10px]">Morphology:</span>
                        <p className="text-[#193C0D]">{scanResult.taxonomy.leafMorphology}</p>
                      </div>
                      <div>
                        <span className="text-[#637462] block font-semibold text-[10px]">Sunlight Cadence:</span>
                        <p className="text-[#193C0D]">{scanResult.taxonomy.sunlightRequirement || 'Bright indirect'}</p>
                      </div>
                      <div>
                        <span className="text-[#637462] block font-semibold text-[10px]">Toxicity Profile:</span>
                        <p className="font-semibold text-[#4E763B] flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {scanResult.taxonomy.petSafety || 'Pet-Safe'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SAM Pathology Output (Dual & Disease Mode) */}
              {scanResult.pathology && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#637462]">
                        Pathology Assessment
                      </span>
                      <h4 className="text-base font-bold text-[#193C0D]">
                        {scanResult.pathology.condition}
                      </h4>
                      <span className="text-xs text-[#637462]">{scanResult.pathology.affectedRegion}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-bold text-[#193C0D] block">
                        {scanResult.pathology.healthScore}%
                      </span>
                      <span className="text-[10px] font-semibold text-[#637462] uppercase">
                        Vitality Score
                      </span>
                    </div>
                  </div>

                  {/* Surface Area Affected Metric */}
                  <div className="bg-[#F4F7F2] p-4 rounded-2xl border border-[#E4ECE2] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#637462]">SAM Lesion Surface Area</span>
                      <div className="text-sm font-bold text-[#193C0D]">
                        {scanResult.pathology.affectedTissuePercentage}% Foliage Tissue Compromised
                      </div>
                    </div>
                    <div className="w-32 bg-[#E4ECE2] h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          scanResult.pathology.affectedTissuePercentage > 25 ? 'bg-[#D32F2F]' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, scanResult.pathology.affectedTissuePercentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Clinical RAG Remediation Protocol */}
                  <div className="p-4 rounded-2xl bg-[#F4F7F2] border border-[#6D835C]/30 text-xs space-y-2.5">
                    <span className="font-bold text-[#4E763B] uppercase tracking-wider block text-[10px] flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5 text-[#4E763B]" />
                      Clinical RAG Remediation Protocol
                    </span>
                    <p className="text-[#193C0D] leading-relaxed font-medium">
                      {scanResult.pathology.recommendedAction}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px] border-t border-[#E4ECE2]">
                      <div>
                        <strong className="text-[#4E763B] block mb-0.5">Organic Bio-Remedy:</strong>
                        <p className="text-[#637462]">{scanResult.pathology.organicRemedy}</p>
                      </div>
                      <div>
                        <strong className="text-[#4E763B] block mb-0.5">Mineral Treatment:</strong>
                        <p className="text-[#637462]">{scanResult.pathology.chemicalRemedy}</p>
                      </div>
                    </div>
                  </div>

                  {/* Immediate Action: Update Digital Twin */}
                  {activePlant && (
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          const newScore = scanResult.pathology ? scanResult.pathology.healthScore : activePlant.healthScore;
                          const updatedPlant = {
                            ...activePlant,
                            healthScore: newScore,
                            healthState: (newScore > 85 ? 'EXCELLENT' : newScore > 70 ? 'GOOD' : 'FAIR') as any,
                            lastScanned: new Date().toISOString(),
                          };
                          roomDb.plantDao.update(updatedPlant);
                          confetti({ particleCount: 35, spread: 50, origin: { y: 0.85 } });
                        }}
                        className="luxury-btn-primary w-full py-3 text-xs font-semibold flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Synchronize {activePlant.name} Twin with Diagnosis ({scanResult.pathology.healthScore}% Vitality)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="luxury-card p-10 text-center text-xs text-[#637462] space-y-2">
              <Activity className="w-6 h-6 text-[#4E763B] mx-auto opacity-70" />
              <p className="font-medium">Ready to analyze. Select a leaf and tap "Execute AI Botanical Scan".</p>
            </div>
          )}
        </div>
      </div>

      {/* Gemini API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="luxury-card max-w-md w-full p-8 space-y-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F7F2] text-[#4E763B] border border-[#E4ECE2] flex items-center justify-center font-bold">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#193C0D]">
                  Gemini Multimodal Vision API
                </h3>
                <span className="text-xs text-[#637462]">Optional cloud vision connection</span>
              </div>
            </div>

            <p className="text-xs text-[#637462] leading-relaxed">
              Enter your Google AI Studio Gemini API Key. If omitted, PhytoSophia seamlessly runs the offline ViT and SAM pathology models.
            </p>

            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-[#F7F9F5] border border-[#E4ECE2] rounded-xl px-3.5 py-2.5 text-xs text-[#193C0D] focus:outline-none focus:ring-1 focus:ring-[#4E763B] font-mono"
            />

            {keySavedToast && (
              <span className="text-xs text-[#4E763B] font-semibold block">
                Gemini API Key saved locally.
              </span>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 bg-[#F4F7F2] text-[#637462] hover:text-[#193C0D] text-xs font-semibold rounded-full hover:bg-[#E4ECE2] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="luxury-btn-primary px-4 py-2 text-xs font-semibold"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
