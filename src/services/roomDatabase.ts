/**
 * PhytoSophia Room Database Persistence Layer
 * Implements Android Room Architecture pattern (Entities, DAOs, Database)
 * for local persistence of digital twin plants, care tasks, growth history,
 * fertilizer schedules, scan logs, and Dr. Flora doctor chat history.
 */

export interface PlantEntity {
  id: string;
  name: string;
  species: string;
  taxonomy: {
    kingdom: string;
    order: string;
    family: string;
    genus: string;
    species: string;
    commonName: string;
    confidence: number;
  };
  imageUrl: string;
  location: 'Indoor' | 'Outdoor';
  sunlight: 'Direct Sunlight' | 'Bright Indirect' | 'Partial Shade' | 'Low Light';
  category: 'indoor' | 'outdoor' | 'flowering' | 'succulent' | 'herbs';
  addedDate: string;
  healthScore: number; // 0 - 100
  growthScore: number; // 0 - 100
  growthStage: 'SEED' | 'SPROUT' | 'YOUNG' | 'HEALTHY' | 'MATURE';
  healthState: 'EXCELLENT' | 'NEEDS_ATTENTION' | 'UNHEALTHY' | 'CRITICAL';
  careStreak: number;
  lastWatered: string;
  lastFertilized: string;
  lastScanned: string;
  notes: string;
  petSafe: boolean;
  waterIntervalDays: number;
  fertilizerIntervalDays: number;
  idealTempRange: string;
  idealHumidityRange: string;
  soilEcTarget: string;
}

export interface CareTaskEntity {
  id: string;
  plantId: string;
  plantName: string;
  plantSpecies: string;
  taskType: 'Watering' | 'Fertilization' | 'Health Scan' | 'Pruning' | 'Sunlight Adjustment';
  dueDate: string; // ISO date string or YYYY-MM-DD
  isCompleted: boolean;
  completedAt?: string;
  frequencyDays: number;
  xpReward: number;
  priority: 'low' | 'medium' | 'high';
  weatherPostponed?: boolean;
  weatherPostponeReason?: string;
}

export interface GrowthHistoryEntity {
  id: string;
  plantId: string;
  date: string;
  stage: 'SEED' | 'SPROUT' | 'YOUNG' | 'HEALTHY' | 'MATURE';
  heightCm: number;
  leafCount: number;
  growthScore: number; // 0 - 100
  healthScore: number;
  event: string;
}

export interface FertilizerScheduleEntity {
  id: string;
  plantId: string;
  formula: string;
  npkRatio: string; // e.g. "10-10-10" or "3-1-2"
  dosageRecommendation: string;
  frequencyDays: number;
  lastApplied: string;
  nextDue: string;
  notes: string;
  organic: boolean;
}

export interface ScanLogEntity {
  id: string;
  plantId: string;
  plantName: string;
  timestamp: string;
  imageUrl: string;
  mode: 'dual' | 'species' | 'disease';
  taxonomy: {
    family: string;
    genus: string;
    species: string;
    commonName: string;
    confidence: number;
  };
  pathology?: {
    healthScore: number;
    condition: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    affectedRegion: string;
    confidence: number;
    recommendedAction: string;
    preventionTips: string[];
    disclaimer: string;
  };
  segmentation?: {
    bbox: [number, number, number, number];
    affectedLeafRegions: Array<{
      id: string;
      label: string;
      bbox: [number, number, number, number];
      severity: 'low' | 'medium' | 'high';
      color: string;
    }>;
  };
  notes?: string;
}

export interface DoctorChatEntity {
  id: string;
  timestamp: string;
  sender: 'user' | 'doctor';
  text: string;
  plantContextId?: string;
  plantContextName?: string;
  tags?: string[];
  treatmentRecommended?: string;
}

// =======================================================================
// INITIAL SEED DATA ACCORDING TO PHYTOSOPHIA RESEARCH PAPER
// =======================================================================
const SEED_PLANTS: PlantEntity[] = [
  {
    id: 'plant-monstera-1',
    name: 'Swiss Monster',
    species: 'Monstera deliciosa',
    taxonomy: {
      kingdom: 'Plantae',
      order: 'Alismatales',
      family: 'Araceae',
      genus: 'Monstera',
      species: 'Monstera deliciosa',
      commonName: 'Swiss Cheese Plant',
      confidence: 0.98,
    },
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
    location: 'Indoor',
    sunlight: 'Bright Indirect',
    category: 'indoor',
    addedDate: '2026-08-15T09:00:00Z',
    healthScore: 78,
    growthScore: 68,
    growthStage: 'YOUNG',
    healthState: 'NEEDS_ATTENTION',
    careStreak: 6,
    lastWatered: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    lastFertilized: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    lastScanned: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    notes: 'Slight lower leaf chlorosis after seasonal humidity fluctuation.',
    petSafe: false,
    waterIntervalDays: 7,
    fertilizerIntervalDays: 14,
    idealTempRange: '18°C - 27°C',
    idealHumidityRange: '60% - 80%',
    soilEcTarget: '1.2 - 1.6 mS/cm',
  },
  {
    id: 'plant-mango-2',
    name: 'Mango Companion',
    species: 'Mangifera indica',
    taxonomy: {
      kingdom: 'Plantae',
      order: 'Sapindales',
      family: 'Anacardiaceae',
      genus: 'Mangifera',
      species: 'Mangifera indica',
      commonName: 'Indian Mango Tree',
      confidence: 0.96,
    },
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
    location: 'Outdoor',
    sunlight: 'Direct Sunlight',
    category: 'outdoor',
    addedDate: '2026-09-01T10:00:00Z',
    healthScore: 94,
    growthScore: 82,
    growthStage: 'HEALTHY',
    healthState: 'EXCELLENT',
    careStreak: 15,
    lastWatered: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    lastFertilized: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    lastScanned: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    notes: 'Vigorous vegetative flush in balcony direct morning sunlight.',
    petSafe: true,
    waterIntervalDays: 4,
    fertilizerIntervalDays: 21,
    idealTempRange: '22°C - 35°C',
    idealHumidityRange: '50% - 70%',
    soilEcTarget: '1.5 - 2.0 mS/cm',
  },
  {
    id: 'plant-rose-3',
    name: 'Ruby Rose',
    species: 'Rosa rubiginosa',
    taxonomy: {
      kingdom: 'Plantae',
      order: 'Rosales',
      family: 'Rosaceae',
      genus: 'Rosa',
      species: 'Rosa rubiginosa',
      commonName: 'Sweet Briar / Hybrid Tea Rose',
      confidence: 0.95,
    },
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    location: 'Outdoor',
    sunlight: 'Direct Sunlight',
    category: 'flowering',
    addedDate: '2026-08-01T10:00:00Z',
    healthScore: 88,
    growthScore: 89,
    growthStage: 'MATURE',
    healthState: 'EXCELLENT',
    careStreak: 14,
    lastWatered: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    lastFertilized: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    lastScanned: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    notes: 'Prolific blooming cycle. Sprayed organic neem oil preventative.',
    petSafe: true,
    waterIntervalDays: 3,
    fertilizerIntervalDays: 14,
    idealTempRange: '15°C - 28°C',
    idealHumidityRange: '45% - 65%',
    soilEcTarget: '1.4 - 1.8 mS/cm',
  },
  {
    id: 'plant-aloe-4',
    name: 'Healing Aloe',
    species: 'Aloe vera',
    taxonomy: {
      kingdom: 'Plantae',
      order: 'Asparagales',
      family: 'Asphodelaceae',
      genus: 'Aloe',
      species: 'Aloe vera',
      commonName: 'True Aloe',
      confidence: 0.99,
    },
    imageUrl: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=800&q=80',
    location: 'Indoor',
    sunlight: 'Bright Indirect',
    category: 'succulent',
    addedDate: '2026-07-20T10:00:00Z',
    healthScore: 97,
    growthScore: 74,
    growthStage: 'HEALTHY',
    healthState: 'EXCELLENT',
    careStreak: 22,
    lastWatered: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    lastFertilized: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
    lastScanned: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    notes: 'Extremely drought tolerant. Plump succulent leaves with high gel density.',
    petSafe: false,
    waterIntervalDays: 14,
    fertilizerIntervalDays: 30,
    idealTempRange: '16°C - 32°C',
    idealHumidityRange: '30% - 50%',
    soilEcTarget: '0.8 - 1.2 mS/cm',
  },
  {
    id: 'plant-pothos-5',
    name: 'Golden Cascades',
    species: 'Epipremnum aureum',
    taxonomy: {
      kingdom: 'Plantae',
      order: 'Alismatales',
      family: 'Araceae',
      genus: 'Epipremnum',
      species: 'Epipremnum aureum',
      commonName: 'Golden Pothos / Devils Ivy',
      confidence: 0.97,
    },
    imageUrl: 'https://images.unsplash.com/photo-1597055181374-4b5b7b6c59b6?auto=format&fit=crop&w=800&q=80',
    location: 'Indoor',
    sunlight: 'Partial Shade',
    category: 'indoor',
    addedDate: '2026-09-10T12:00:00Z',
    healthScore: 92,
    growthScore: 64,
    growthStage: 'YOUNG',
    healthState: 'EXCELLENT',
    careStreak: 11,
    lastWatered: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    lastFertilized: new Date(Date.now() - 1000 * 60 * 60 * 24 * 16).toISOString(),
    lastScanned: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    notes: 'Trailing gracefully across shelf. Variegated yellow and emerald heart-shaped leaves.',
    petSafe: false,
    waterIntervalDays: 6,
    fertilizerIntervalDays: 20,
    idealTempRange: '17°C - 30°C',
    idealHumidityRange: '50% - 75%',
    soilEcTarget: '1.0 - 1.4 mS/cm',
  },
];

const SEED_CARE_TASKS: CareTaskEntity[] = [
  {
    id: 'task-1',
    plantId: 'plant-monstera-1',
    plantName: 'Swiss Monster',
    plantSpecies: 'Monstera deliciosa',
    taskType: 'Watering',
    dueDate: new Date().toISOString().split('T')[0],
    isCompleted: false,
    frequencyDays: 7,
    xpReward: 30,
    priority: 'high',
  },
  {
    id: 'task-2',
    plantId: 'plant-mango-2',
    plantName: 'Mango Companion',
    plantSpecies: 'Mangifera indica',
    taskType: 'Fertilization',
    dueDate: new Date().toISOString().split('T')[0],
    isCompleted: false,
    frequencyDays: 21,
    xpReward: 45,
    priority: 'medium',
  },
  {
    id: 'task-3',
    plantId: 'plant-rose-3',
    plantName: 'Ruby Rose',
    plantSpecies: 'Rosa rubiginosa',
    taskType: 'Health Scan',
    dueDate: new Date().toISOString().split('T')[0],
    isCompleted: false,
    frequencyDays: 7,
    xpReward: 40,
    priority: 'medium',
  },
  {
    id: 'task-4',
    plantId: 'plant-pothos-5',
    plantName: 'Golden Cascades',
    plantSpecies: 'Epipremnum aureum',
    taskType: 'Pruning',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split('T')[0],
    isCompleted: false,
    frequencyDays: 14,
    xpReward: 25,
    priority: 'low',
  },
  {
    id: 'task-5',
    plantId: 'plant-aloe-4',
    plantName: 'Healing Aloe',
    plantSpecies: 'Aloe vera',
    taskType: 'Watering',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0],
    isCompleted: false,
    frequencyDays: 14,
    xpReward: 30,
    priority: 'low',
  },
];

const SEED_GROWTH_HISTORY: GrowthHistoryEntity[] = [
  {
    id: 'gh-m1',
    plantId: 'plant-monstera-1',
    date: '2026-08-15',
    stage: 'SEED',
    heightCm: 8,
    leafCount: 2,
    growthScore: 20,
    healthScore: 90,
    event: 'Acquired cutting with intact aerial root',
  },
  {
    id: 'gh-m2',
    plantId: 'plant-monstera-1',
    date: '2026-09-02',
    stage: 'SPROUT',
    heightCm: 16,
    leafCount: 3,
    growthScore: 42,
    healthScore: 88,
    event: 'First new unfurled leaf with initial fenestration',
  },
  {
    id: 'gh-m3',
    plantId: 'plant-monstera-1',
    date: '2026-09-24',
    stage: 'YOUNG',
    heightCm: 28,
    leafCount: 5,
    growthScore: 68,
    healthScore: 78,
    event: 'Moderate vegetative growth; chlorosis flagged on lower petiole',
  },
  {
    id: 'gh-mango1',
    plantId: 'plant-mango-2',
    date: '2026-09-01',
    stage: 'SPROUT',
    heightCm: 22,
    leafCount: 6,
    growthScore: 35,
    healthScore: 92,
    event: 'Potted in terrace container with rich organic loam',
  },
  {
    id: 'gh-mango2',
    plantId: 'plant-mango-2',
    date: '2026-09-20',
    stage: 'YOUNG',
    heightCm: 38,
    leafCount: 12,
    growthScore: 60,
    healthScore: 93,
    event: 'Lateral branch emergence under full sun',
  },
  {
    id: 'gh-mango3',
    plantId: 'plant-mango-2',
    date: '2026-10-15',
    stage: 'HEALTHY',
    heightCm: 52,
    leafCount: 18,
    growthScore: 82,
    healthScore: 94,
    event: 'Robust canopy foliage expansion; top apical shoot primed',
  },
];

const SEED_FERTILIZER_SCHEDULES: FertilizerScheduleEntity[] = [
  {
    id: 'fert-1',
    plantId: 'plant-monstera-1',
    formula: 'Balanced Tropical Liquid NPK (3-1-2)',
    npkRatio: '3-1-2',
    dosageRecommendation: '5ml diluted in 2L water every 14 days',
    frequencyDays: 14,
    lastApplied: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    nextDue: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    notes: 'Hold back nitrogen during cold winter dormancy.',
    organic: true,
  },
  {
    id: 'fert-2',
    plantId: 'plant-mango-2',
    formula: 'Fruit Tree High Potassium & Micronutrient Mix (10-10-20)',
    npkRatio: '10-10-20',
    dosageRecommendation: '15g slow-release granular around drip line',
    frequencyDays: 21,
    lastApplied: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    nextDue: new Date(Date.now() + 1000 * 60 * 60 * 24 * 16).toISOString(),
    notes: 'Include chelated zinc and iron for deep green foliage.',
    organic: false,
  },
  {
    id: 'fert-3',
    plantId: 'plant-rose-3',
    formula: 'Rose Blossom Bio-Kelp Bloom Booster (4-8-7)',
    npkRatio: '4-8-7',
    dosageRecommendation: '10ml liquid foliar spray once every 2 weeks',
    frequencyDays: 14,
    lastApplied: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    nextDue: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString(),
    notes: 'Promotes vibrant bud count and floral pigmentation.',
    organic: true,
  },
];

const SEED_SCAN_LOGS: ScanLogEntity[] = [
  {
    id: 'scan-before-monstera',
    plantId: 'plant-monstera-1',
    plantName: 'Swiss Monster',
    timestamp: '2026-10-04T11:20:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
    mode: 'dual',
    taxonomy: {
      family: 'Araceae',
      genus: 'Monstera',
      species: 'Monstera deliciosa',
      commonName: 'Swiss Cheese Plant',
      confidence: 0.98,
    },
    pathology: {
      healthScore: 68,
      condition: 'Active Chlorosis & Mild Leaf Stagnation',
      severity: 'medium',
      affectedRegion: 'Lower basal leaf cluster #2',
      confidence: 0.94,
      recommendedAction: 'Reduce watering frequency. Test potting mix drainage and apply chelated iron.',
      preventionTips: [
        'Allow top 2-3 inches of potting medium to dry between waterings.',
        'Ensure pot drainage holes are clear of root plugs.',
      ],
      disclaimer: 'SAM segmentation identified localized chlorotic tissue (32% of lower foliage).',
    },
    segmentation: {
      bbox: [15, 18, 68, 62],
      affectedLeafRegions: [
        { id: 'r1', label: 'Chlorotic Zone A', bbox: [22, 26, 38, 30], severity: 'medium', color: '#eab308' },
        { id: 'r2', label: 'Stagnation Margin', bbox: [45, 34, 25, 20], severity: 'low', color: '#f59e0b' },
      ],
    },
    notes: 'Baseline scan showing chlorotic discoloration before remediation.',
  },
  {
    id: 'scan-after-monstera',
    plantId: 'plant-monstera-1',
    plantName: 'Swiss Monster',
    timestamp: '2026-10-20T14:45:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
    mode: 'dual',
    taxonomy: {
      family: 'Araceae',
      genus: 'Monstera',
      species: 'Monstera deliciosa',
      commonName: 'Swiss Cheese Plant',
      confidence: 0.99,
    },
    pathology: {
      healthScore: 92,
      condition: 'Remediated — Healthy Tissue Recovery',
      severity: 'low',
      affectedRegion: 'Residual margin fade only',
      confidence: 0.96,
      recommendedAction: 'Continue current 7-day watering cycle and maintain bright indirect exposure.',
      preventionTips: ['Maintain weekly leaf dusting with soft damp microfiber cloth.'],
      disclaimer: 'Pathology analysis confirms significant chlorophyll repigmentation (+24% health delta).',
    },
    segmentation: {
      bbox: [12, 14, 72, 70],
      affectedLeafRegions: [
        { id: 'r1-recovered', label: 'Healed Margin', bbox: [25, 28, 20, 15], severity: 'low', color: '#10b981' },
      ],
    },
    notes: 'Follow-up scan showing successful recovery after RAG-driven remediation protocol.',
  },
];

const SEED_DOCTOR_CHATS: DoctorChatEntity[] = [
  {
    id: 'chat-1',
    timestamp: '2026-10-20T10:15:00Z',
    sender: 'doctor',
    text: `Greetings! I am **Dr. Flora**, Ph.D. in Botanical Pathology and your PhytoSophia Digital Twin Physician.\n\nI have complete access to your Room Database telemetry, including your 5 registered plants, current microclimate sensors, and recent SAM pathology scans. How may I assist your botanical sanctuary today?`,
    tags: ['welcome', 'telemetry-synced'],
  },
  {
    id: 'chat-2',
    timestamp: '2026-10-20T10:17:30Z',
    sender: 'user',
    text: 'Why are the lower leaves of my Swiss Monster turning yellow around the edges?',
    plantContextId: 'plant-monstera-1',
    plantContextName: 'Swiss Monster',
  },
  {
    id: 'chat-3',
    timestamp: '2026-10-20T10:18:05Z',
    sender: 'doctor',
    text: `🌿 **Dr. Flora Diagnosis for Swiss Monster (Monstera deliciosa)**:\n\nLooking at your latest telemetry and SAM-based pathology analysis (Scan #scan-before-monstera):\n\n1. **Root Cause**: Over-saturation of lower root zone. Your digital twin shows watering was performed while ambient humidity was 74%.\n2. **Pathology Assessment**: Interveinal chlorosis localized to older leaves while young apical growth remains green indicates immobile mineral deficiency caused by waterlogged rhizosphere.\n\n💡 **Prescription & Action Plan**:\n• **Aeration**: Gently poke 4-5 ventilation holes in the topsoil with a sterile wooden chopstick.\n• **Watering Pause**: Postpone next irrigation until soil moisture probe reads <25%.\n• **Remediation Dose**: Apply chelated iron (Fe-EDDHA) at 1g/L next watering cycle.`,
    plantContextId: 'plant-monstera-1',
    plantContextName: 'Swiss Monster',
    tags: ['chlorosis', 'moisture-stagnation', 'iron-deficiency'],
    treatmentRecommended: 'Apply Fe-EDDHA chelated iron and pause irrigation for 4 days.',
  },
];

// =======================================================================
// ROOM DATABASE DAOs & PERSISTENCE ENGINE
// =======================================================================
const STORAGE_KEYS = {
  PLANTS: 'phytosophia_room_plants',
  CARE_TASKS: 'phytosophia_room_care_tasks',
  GROWTH_HISTORY: 'phytosophia_room_growth_history',
  FERTILIZER_SCHEDULES: 'phytosophia_room_fertilizer_schedules',
  SCAN_LOGS: 'phytosophia_room_scan_logs',
  DOCTOR_CHATS: 'phytosophia_room_doctor_chats',
  DB_VERSION: 'phytosophia_room_db_version',
};

const CURRENT_DB_VERSION = '2.1';

export class RoomDatabase {
  private static instance: RoomDatabase;

  private constructor() {
    this.ensureInitialized();
  }

  public static getInstance(): RoomDatabase {
    if (!RoomDatabase.instance) {
      RoomDatabase.instance = new RoomDatabase();
    }
    return RoomDatabase.instance;
  }

  private ensureInitialized(): void {
    const existingVersion = localStorage.getItem(STORAGE_KEYS.DB_VERSION);
    if (existingVersion !== CURRENT_DB_VERSION) {
      // Initialize or seed fresh schema
      if (!localStorage.getItem(STORAGE_KEYS.PLANTS)) {
        localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(SEED_PLANTS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.CARE_TASKS)) {
        localStorage.setItem(STORAGE_KEYS.CARE_TASKS, JSON.stringify(SEED_CARE_TASKS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.GROWTH_HISTORY)) {
        localStorage.setItem(STORAGE_KEYS.GROWTH_HISTORY, JSON.stringify(SEED_GROWTH_HISTORY));
      }
      if (!localStorage.getItem(STORAGE_KEYS.FERTILIZER_SCHEDULES)) {
        localStorage.setItem(STORAGE_KEYS.FERTILIZER_SCHEDULES, JSON.stringify(SEED_FERTILIZER_SCHEDULES));
      }
      if (!localStorage.getItem(STORAGE_KEYS.SCAN_LOGS)) {
        localStorage.setItem(STORAGE_KEYS.SCAN_LOGS, JSON.stringify(SEED_SCAN_LOGS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.DOCTOR_CHATS)) {
        localStorage.setItem(STORAGE_KEYS.DOCTOR_CHATS, JSON.stringify(SEED_DOCTOR_CHATS));
      }
      localStorage.setItem(STORAGE_KEYS.DB_VERSION, CURRENT_DB_VERSION);
    }
  }

  // ---------------------------------------------------------------------
  // 1. PLANT DAO
  // ---------------------------------------------------------------------
  public plantDao = {
    getAll: (): PlantEntity[] => {
      const data = localStorage.getItem(STORAGE_KEYS.PLANTS);
      return data ? JSON.parse(data) : SEED_PLANTS;
    },

    getById: (id: string): PlantEntity | undefined => {
      const list = this.plantDao.getAll();
      return list.find((p) => p.id === id);
    },

    insert: (plant: PlantEntity): void => {
      const list = this.plantDao.getAll();
      const updated = [plant, ...list];
      localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(updated));
    },

    update: (plant: PlantEntity): void => {
      const list = this.plantDao.getAll();
      const idx = list.findIndex((p) => p.id === plant.id);
      if (idx !== -1) {
        list[idx] = plant;
        localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(list));
      }
    },

    delete: (id: string): void => {
      const list = this.plantDao.getAll();
      const filtered = list.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(filtered));
    },

    getGardenStats: () => {
      const plants = this.plantDao.getAll();
      const total = plants.length;
      const avgHealth = total > 0 ? Math.round(plants.reduce((acc, p) => acc + p.healthScore, 0) / total) : 0;
      const healthyCount = plants.filter((p) => p.healthScore >= 80).length;
      const longestStreak = plants.reduce((max, p) => Math.max(max, p.careStreak || 0), 0);
      return { total, avgHealth, healthyCount, longestStreak };
    },
  };

  // ---------------------------------------------------------------------
  // 2. CARE TASK DAO
  // ---------------------------------------------------------------------
  public careTaskDao = {
    getAll: (): CareTaskEntity[] => {
      const data = localStorage.getItem(STORAGE_KEYS.CARE_TASKS);
      return data ? JSON.parse(data) : SEED_CARE_TASKS;
    },

    getByPlantId: (plantId: string): CareTaskEntity[] => {
      return this.careTaskDao.getAll().filter((t) => t.plantId === plantId);
    },

    getTodayTasks: (): CareTaskEntity[] => {
      const today = new Date().toISOString().split('T')[0];
      return this.careTaskDao.getAll().filter((t) => t.dueDate <= today && !t.isCompleted);
    },

    completeTask: (taskId: string): CareTaskEntity | null => {
      const list = this.careTaskDao.getAll();
      const task = list.find((t) => t.id === taskId);
      if (task) {
        task.isCompleted = true;
        task.completedAt = new Date().toISOString();

        // Also update the plant entity
        const plant = this.plantDao.getById(task.plantId);
        if (plant) {
          if (task.taskType === 'Watering') plant.lastWatered = new Date().toISOString();
          if (task.taskType === 'Fertilization') plant.lastFertilized = new Date().toISOString();
          if (task.taskType === 'Health Scan') plant.lastScanned = new Date().toISOString();
          plant.careStreak = (plant.careStreak || 0) + 1;
          plant.healthScore = Math.min(100, plant.healthScore + 2);
          this.plantDao.update(plant);
        }

        // Generate next recurring task
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + (task.frequencyDays || 7));
        const recurringTask: CareTaskEntity = {
          id: `task-${Date.now()}`,
          plantId: task.plantId,
          plantName: task.plantName,
          plantSpecies: task.plantSpecies,
          taskType: task.taskType,
          dueDate: nextDate.toISOString().split('T')[0],
          isCompleted: false,
          frequencyDays: task.frequencyDays,
          xpReward: task.xpReward,
          priority: task.priority,
        };

        const updated = [...list, recurringTask];
        localStorage.setItem(STORAGE_KEYS.CARE_TASKS, JSON.stringify(updated));
        return task;
      }
      return null;
    },

    insert: (task: CareTaskEntity): void => {
      const list = this.careTaskDao.getAll();
      localStorage.setItem(STORAGE_KEYS.CARE_TASKS, JSON.stringify([task, ...list]));
    },

    postponeForWeather: (plantId: string, daysToPostpone = 1, reason = 'Rain forecasted') => {
      const list = this.careTaskDao.getAll();
      let modified = 0;
      const updated = list.map((task) => {
        if (task.plantId === plantId && task.taskType === 'Watering' && !task.isCompleted) {
          const currentDue = new Date(task.dueDate);
          currentDue.setDate(currentDue.getDate() + daysToPostpone);
          modified++;
          return {
            ...task,
            dueDate: currentDue.toISOString().split('T')[0],
            weatherPostponed: true,
            weatherPostponeReason: reason,
          };
        }
        return task;
      });
      localStorage.setItem(STORAGE_KEYS.CARE_TASKS, JSON.stringify(updated));
      return modified;
    },
  };

  // ---------------------------------------------------------------------
  // 3. GROWTH HISTORY DAO
  // ---------------------------------------------------------------------
  public growthHistoryDao = {
    getAll: (): GrowthHistoryEntity[] => {
      const data = localStorage.getItem(STORAGE_KEYS.GROWTH_HISTORY);
      return data ? JSON.parse(data) : SEED_GROWTH_HISTORY;
    },

    getByPlantId: (plantId: string): GrowthHistoryEntity[] => {
      return this.growthHistoryDao
        .getAll()
        .filter((g) => g.plantId === plantId)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },

    insert: (record: GrowthHistoryEntity): void => {
      const list = this.growthHistoryDao.getAll();
      localStorage.setItem(STORAGE_KEYS.GROWTH_HISTORY, JSON.stringify([...list, record]));
    },
  };

  // ---------------------------------------------------------------------
  // 4. FERTILIZER SCHEDULE DAO
  // ---------------------------------------------------------------------
  public fertilizerScheduleDao = {
    getAll: (): FertilizerScheduleEntity[] => {
      const data = localStorage.getItem(STORAGE_KEYS.FERTILIZER_SCHEDULES);
      return data ? JSON.parse(data) : SEED_FERTILIZER_SCHEDULES;
    },

    getByPlantId: (plantId: string): FertilizerScheduleEntity | undefined => {
      return this.fertilizerScheduleDao.getAll().find((f) => f.plantId === plantId);
    },

    logApplication: (plantId: string, customNotes?: string): FertilizerScheduleEntity | null => {
      const list = this.fertilizerScheduleDao.getAll();
      const sched = list.find((s) => s.plantId === plantId);
      if (sched) {
        sched.lastApplied = new Date().toISOString();
        const next = new Date();
        next.setDate(next.getDate() + sched.frequencyDays);
        sched.nextDue = next.toISOString();
        if (customNotes) sched.notes = customNotes;

        // update plant record
        const plant = this.plantDao.getById(plantId);
        if (plant) {
          plant.lastFertilized = sched.lastApplied;
          plant.growthScore = Math.min(100, plant.growthScore + 3);
          this.plantDao.update(plant);
        }

        localStorage.setItem(STORAGE_KEYS.FERTILIZER_SCHEDULES, JSON.stringify(list));
        return sched;
      }
      return null;
    },

    saveOrUpdate: (entry: FertilizerScheduleEntity): void => {
      const list = this.fertilizerScheduleDao.getAll();
      const idx = list.findIndex((s) => s.plantId === entry.plantId);
      if (idx !== -1) {
        list[idx] = entry;
      } else {
        list.push(entry);
      }
      localStorage.setItem(STORAGE_KEYS.FERTILIZER_SCHEDULES, JSON.stringify(list));
    },
  };

  // ---------------------------------------------------------------------
  // 5. SCAN LOG DAO
  // ---------------------------------------------------------------------
  public scanLogDao = {
    getAll: (): ScanLogEntity[] => {
      const data = localStorage.getItem(STORAGE_KEYS.SCAN_LOGS);
      return data ? JSON.parse(data) : SEED_SCAN_LOGS;
    },

    getByPlantId: (plantId: string): ScanLogEntity[] => {
      return this.scanLogDao
        .getAll()
        .filter((s) => s.plantId === plantId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },

    getRecoveryPair: (plantId: string): { before?: ScanLogEntity; after?: ScanLogEntity } => {
      const logs = this.scanLogDao.getByPlantId(plantId);
      if (logs.length >= 2) {
        return {
          before: logs[logs.length - 1], // earliest scan
          after: logs[0], // latest scan
        };
      } else if (logs.length === 1) {
        return { after: logs[0] };
      }
      return {};
    },

    insert: (log: ScanLogEntity): void => {
      const list = this.scanLogDao.getAll();
      localStorage.setItem(STORAGE_KEYS.SCAN_LOGS, JSON.stringify([log, ...list]));

      // update plant digital twin
      const plant = this.plantDao.getById(log.plantId);
      if (plant && log.pathology) {
        plant.healthScore = log.pathology.healthScore;
        plant.lastScanned = log.timestamp;
        plant.healthState =
          log.pathology.healthScore >= 85
            ? 'EXCELLENT'
            : log.pathology.healthScore >= 70
            ? 'NEEDS_ATTENTION'
            : log.pathology.healthScore >= 50
            ? 'UNHEALTHY'
            : 'CRITICAL';
        this.plantDao.update(plant);
      }
    },
  };

  // ---------------------------------------------------------------------
  // 6. DOCTOR CHAT DAO
  // ---------------------------------------------------------------------
  public doctorChatDao = {
    getAll: (): DoctorChatEntity[] => {
      const data = localStorage.getItem(STORAGE_KEYS.DOCTOR_CHATS);
      return data ? JSON.parse(data) : SEED_DOCTOR_CHATS;
    },

    insert: (msg: DoctorChatEntity): void => {
      const list = this.doctorChatDao.getAll();
      localStorage.setItem(STORAGE_KEYS.DOCTOR_CHATS, JSON.stringify([...list, msg]));
    },

    clear: (): void => {
      localStorage.setItem(STORAGE_KEYS.DOCTOR_CHATS, JSON.stringify([SEED_DOCTOR_CHATS[0]]));
    },
  };

  // ---------------------------------------------------------------------
  // ROOM DATABASE MANAGEMENT & BACKUP UTILITIES
  // ---------------------------------------------------------------------
  public exportDatabaseDump(): string {
    const dump = {
      version: CURRENT_DB_VERSION,
      timestamp: new Date().toISOString(),
      plants: this.plantDao.getAll(),
      careTasks: this.careTaskDao.getAll(),
      growthHistory: this.growthHistoryDao.getAll(),
      fertilizerSchedules: this.fertilizerScheduleDao.getAll(),
      scanLogs: this.scanLogDao.getAll(),
      doctorChats: this.doctorChatDao.getAll(),
    };
    return JSON.stringify(dump, null, 2);
  }

  public restoreFromDump(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.plants) localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(parsed.plants));
      if (parsed.careTasks) localStorage.setItem(STORAGE_KEYS.CARE_TASKS, JSON.stringify(parsed.careTasks));
      if (parsed.growthHistory) localStorage.setItem(STORAGE_KEYS.GROWTH_HISTORY, JSON.stringify(parsed.growthHistory));
      if (parsed.fertilizerSchedules) localStorage.setItem(STORAGE_KEYS.FERTILIZER_SCHEDULES, JSON.stringify(parsed.fertilizerSchedules));
      if (parsed.scanLogs) localStorage.setItem(STORAGE_KEYS.SCAN_LOGS, JSON.stringify(parsed.scanLogs));
      if (parsed.doctorChats) localStorage.setItem(STORAGE_KEYS.DOCTOR_CHATS, JSON.stringify(parsed.doctorChats));
      return true;
    } catch (e) {
      console.error('Failed to restore Room Database dump:', e);
      return false;
    }
  }

  public resetToFactorySeeds(): void {
    localStorage.removeItem(STORAGE_KEYS.PLANTS);
    localStorage.removeItem(STORAGE_KEYS.CARE_TASKS);
    localStorage.removeItem(STORAGE_KEYS.GROWTH_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.FERTILIZER_SCHEDULES);
    localStorage.removeItem(STORAGE_KEYS.SCAN_LOGS);
    localStorage.removeItem(STORAGE_KEYS.DOCTOR_CHATS);
    localStorage.removeItem(STORAGE_KEYS.DB_VERSION);
    this.ensureInitialized();
  }
}

export const roomDb = RoomDatabase.getInstance();
