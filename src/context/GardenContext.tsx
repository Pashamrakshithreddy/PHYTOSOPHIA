import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type {
  DigitalTwinPlant,
  UserAccount,
  Mission,
  LeaderboardUser,
  NotificationItem,
} from '../types';
import {
  getLevelDetails,
  processCareAction,
  getHealthState,
} from '../services/digitalTwin';
import { analyzePlantImage } from '../services/aiEngine';

// Initial Sample Plants with Persistent Digital Twins
const INITIAL_PLANTS: DigitalTwinPlant[] = [
  {
    id: 'plant-mango-1',
    name: 'Mango Companion',
    species: 'Mangifera indica',
    taxonomy: {
      family: 'Anacardiaceae',
      genus: 'Mangifera',
      species: 'Mangifera indica',
      commonName: 'Mango Tree',
      confidence: 0.96,
    },
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
    location: 'Outdoor',
    sunlight: 'Direct Sunlight',
    addedDate: '2026-09-01T10:00:00Z',
    healthScore: 92,
    growthScore: 76,
    growthStage: 'HEALTHY',
    healthState: 'EXCELLENT',
    careStreak: 12,
    lastWatered: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    lastFertilized: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    lastScanned: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    nextTask: { type: 'Watering', dueDate: 'Tomorrow at 09:00 AM' },
    xpEarned: 450,
    notes: 'Thriving in full morning sun on balcony.',
    diseaseHistory: [],
    scanHistory: [
      {
        id: 'scan-m1',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
        healthScore: 92,
        condition: 'Optimal Growth',
        taxonomy: {
          family: 'Anacardiaceae',
          genus: 'Mangifera',
          species: 'Mangifera indica',
          commonName: 'Mango Tree',
          confidence: 0.96,
        },
      },
    ],
    careHistory: [
      { id: 'c-1', type: 'water', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), xpEarned: 25 },
      { id: 'c-2', type: 'fertilize', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), xpEarned: 35 },
    ],
    growthTimeline: [
      { date: 'Sep 1, 2026', stage: 'SEED', growthScore: 10, event: 'Planted Mango Seed in pot' },
      { date: 'Sep 12, 2026', stage: 'SPROUT', growthScore: 35, event: 'First green shoot emerged' },
      { date: 'Sep 25, 2026', stage: 'YOUNG', growthScore: 55, event: 'Multiple branches formed' },
      { date: 'Oct 04, 2026', stage: 'HEALTHY', growthScore: 76, event: 'Reaching vigorous foliage growth' },
    ],
    leafNodes: [
      { id: 'l1', label: 'Apical Shoot Leaf', position: [0.5, 0.7, 0.2], health: 95, moisture: 90 },
      { id: 'l2', label: 'Mid-Canopy Leaf', position: [-0.6, 0.9, -0.2], health: 92, moisture: 85 },
      { id: 'l3', label: 'Lower Lateral Leaf', position: [0.4, 1.3, -0.3], health: 88, moisture: 80 },
      { id: 'l4', label: 'Basal Leaf Cluster', position: [-0.4, 1.5, 0.3], health: 90, moisture: 82 },
    ],
  },
  {
    id: 'plant-monstera-2',
    name: 'Swiss Monster',
    species: 'Monstera deliciosa',
    taxonomy: {
      family: 'Araceae',
      genus: 'Monstera',
      species: 'Monstera deliciosa',
      commonName: 'Monstera Deliciosa',
      confidence: 0.98,
    },
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
    location: 'Indoor',
    sunlight: 'Bright Indirect',
    addedDate: '2026-08-15T10:00:00Z',
    healthScore: 78,
    growthScore: 62,
    growthStage: 'YOUNG',
    healthState: 'NEEDS_ATTENTION',
    careStreak: 5,
    lastWatered: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    lastFertilized: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    lastScanned: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    nextTask: { type: 'Watering', dueDate: 'Today at 05:00 PM' },
    xpEarned: 320,
    notes: 'Slight yellowing on lower fenestrated leaf.',
    diseaseHistory: [
      {
        healthScore: 78,
        condition: 'Mild Leaf Chlorosis',
        severity: 'medium',
        affectedRegion: 'Lower Leaf #2',
        confidence: 0.94,
        recommendedAction: 'Allow soil to dry out before next watering.',
        preventionTips: ['Improve drainage', 'Avoid cold drafts'],
        disclaimer: 'Visual symptoms consistent with mild overwatering.',
      },
    ],
    scanHistory: [],
    careHistory: [
      { id: 'c-3', type: 'water', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), xpEarned: 25 },
    ],
    growthTimeline: [
      { date: 'Aug 15, 2026', stage: 'SPROUT', growthScore: 25, event: 'Acquired as small sprout' },
      { date: 'Sep 10, 2026', stage: 'YOUNG', growthScore: 62, event: 'First fenestrations appeared' },
    ],
    leafNodes: [
      { id: 'l1', label: 'Top Fenestrated Leaf', position: [0.4, 0.5, 0.1], health: 85, moisture: 70 },
      { id: 'l2', label: 'Lower Chlorotic Leaf', position: [-0.45, 0.7, -0.1], health: 65, moisture: 95, issue: 'Mild Chlorosis Yellowing' },
      { id: 'l3', label: 'Side Petiole Leaf', position: [0.2, 1.1, -0.2], health: 80, moisture: 72 },
    ],
  },
  {
    id: 'plant-rose-3',
    name: 'Ruby Rose',
    species: 'Rosa rubiginosa',
    taxonomy: {
      family: 'Rosaceae',
      genus: 'Rosa',
      species: 'Rosa rubiginosa',
      commonName: 'Hybrid Tea Rose',
      confidence: 0.95,
    },
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    location: 'Outdoor',
    sunlight: 'Direct Sunlight',
    addedDate: '2026-08-01T10:00:00Z',
    healthScore: 88,
    growthScore: 89,
    growthStage: 'MATURE',
    healthState: 'EXCELLENT',
    careStreak: 14,
    lastWatered: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    lastFertilized: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    lastScanned: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    nextTask: { type: 'Fertilization', dueDate: 'In 3 days' },
    xpEarned: 610,
    notes: 'Multiple pink blossoms blooming in full sunlight.',
    diseaseHistory: [],
    scanHistory: [],
    careHistory: [],
    growthTimeline: [
      { date: 'Aug 01, 2026', stage: 'YOUNG', growthScore: 45, event: 'Planted in garden bed' },
      { date: 'Aug 28, 2026', stage: 'HEALTHY', growthScore: 75, event: 'First flower bud formed' },
      { date: 'Sep 20, 2026', stage: 'MATURE', growthScore: 89, event: 'Full rose bloom unlocked!' },
    ],
    leafNodes: [
      { id: 'l1', label: 'Petal Cluster 1', position: [0, 2.3, 0], health: 95, moisture: 90 },
      { id: 'l2', label: 'Mid Leaf Stem', position: [0.55, 0.7, 0.2], health: 90, moisture: 85 },
    ],
  },
  {
    id: 'plant-aloe-4',
    name: 'Healing Aloe',
    species: 'Aloe vera',
    taxonomy: {
      family: 'Asphodelaceae',
      genus: 'Aloe',
      species: 'Aloe vera',
      commonName: 'Aloe Vera',
      confidence: 0.99,
    },
    imageUrl: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=800&q=80',
    location: 'Indoor',
    sunlight: 'Bright Indirect',
    addedDate: '2026-07-20T10:00:00Z',
    healthScore: 96,
    growthScore: 72,
    growthStage: 'HEALTHY',
    healthState: 'EXCELLENT',
    careStreak: 20,
    lastWatered: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    lastFertilized: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    lastScanned: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    nextTask: { type: 'Health Scan', dueDate: 'In 2 days' },
    xpEarned: 520,
    notes: 'Very low water requirements; fat, plump green leaves.',
    diseaseHistory: [],
    scanHistory: [],
    careHistory: [],
    growthTimeline: [
      { date: 'Jul 20, 2026', stage: 'SPROUT', growthScore: 30, event: 'Potted succulent pup' },
      { date: 'Sep 05, 2026', stage: 'HEALTHY', growthScore: 72, event: 'Thick succulent rosette established' },
    ],
    leafNodes: [
      { id: 'l1', label: 'Central Fleshy Leaf', position: [0, 0.5, 0], health: 98, moisture: 92 },
    ],
  },
];

const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm-water',
    title: 'Hydration Routine',
    description: 'Water any plant in your garden to keep soil moisture optimal.',
    type: 'daily',
    xpReward: 25,
    progress: 0,
    maxProgress: 1,
    completed: false,
    category: 'water',
  },
  {
    id: 'm-scan',
    title: 'Pathology Inspection',
    description: 'Run an AI Plant Scan on a plant to verify leaf health.',
    type: 'daily',
    xpReward: 40,
    progress: 0,
    maxProgress: 1,
    completed: false,
    category: 'scan',
  },
  {
    id: 'm-tasks',
    title: 'Master Gardener',
    description: 'Complete 3 care tasks today across your garden.',
    type: 'daily',
    xpReward: 50,
    progress: 1,
    maxProgress: 3,
    completed: false,
    category: 'care',
  },
  {
    id: 'w-health',
    title: 'Garden Sanctuary',
    description: 'Maintain 3 or more plants at >85% health throughout the week.',
    type: 'weekly',
    xpReward: 500,
    badgeReward: 'Sanctuary Keeper',
    progress: 3,
    maxProgress: 3,
    completed: true,
    category: 'health',
  },
  {
    id: 'w-water7',
    title: 'Hydration Master',
    description: 'Perform 7 total watering care actions.',
    type: 'weekly',
    xpReward: 350,
    progress: 4,
    maxProgress: 7,
    completed: false,
    category: 'water',
  },
];

const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  {
    rank: 1,
    username: 'FloraWizard_Elena',
    avatar: '👩‍🌾',
    level: 7,
    title: 'Botanical Master',
    xp: 8420,
    gardenHealth: 96,
    careStreak: 34,
    healthyPlants: 5,
    totalPlants: 5,
    fairScore: 940,
    badges: ['🥇 Weekly Champ', '💧 Water Master', '🌿 Green Thumb'],
    topTips: [
      'Water thoroughly until runoff occurs, then let top 2 inches dry.',
      'Group plants with similar humidity needs together for microclimate benefits.',
    ],
    publicRoutines: [
      'Morning foliage check at 7:30 AM',
      'Bi-weekly organic kelp liquid fertilization',
    ],
  },
  {
    rank: 2,
    username: 'GreenThumb_Alex',
    avatar: '👨‍🌾',
    level: 6,
    title: 'Plant Expert',
    xp: 5120,
    gardenHealth: 92,
    careStreak: 21,
    healthyPlants: 4,
    totalPlants: 4,
    fairScore: 820,
    badges: ['🥈 Top 3', '🩺 Plant Doctor'],
    topTips: ['Always use sterile shears when pruning yellowing foliage.'],
    publicRoutines: ['Weekly SAM Pathology Health Scan every Sunday'],
  },
  {
    rank: 3,
    username: 'You (PhytoKeeper)',
    avatar: '🌱',
    level: 3,
    title: 'Gardener',
    xp: 1450,
    gardenHealth: 88,
    careStreak: 12,
    healthyPlants: 3,
    totalPlants: 4,
    fairScore: 680,
    badges: ['🌱 First Plant', '🔥 7-Day Care Streak'],
    topTips: ['Keep digital twin care logs updated after every watering.'],
    publicRoutines: ['Daily morning hydration check'],
  },
  {
    rank: 4,
    username: 'Botanical_Leo',
    avatar: '🪴',
    level: 3,
    title: 'Gardener',
    xp: 1200,
    gardenHealth: 84,
    careStreak: 9,
    healthyPlants: 2,
    totalPlants: 3,
    fairScore: 590,
    badges: ['🌱 First Plant'],
    topTips: ['Avoid positioning succulents directly next to air conditioning vents.'],
    publicRoutines: ['Water every 5 days'],
  },
];

interface GardenContextType {
  plants: DigitalTwinPlant[];
  activePlantId: string | null;
  activePlant: DigitalTwinPlant | undefined;
  user: UserAccount;
  missions: Mission[];
  leaderboard: LeaderboardUser[];
  notifications: NotificationItem[];
  setActivePlantId: (id: string | null) => void;
  addPlant: (newPlant: Omit<DigitalTwinPlant, 'id' | 'addedDate' | 'healthScore' | 'growthScore' | 'growthStage' | 'healthState' | 'careStreak' | 'lastWatered' | 'lastFertilized' | 'lastScanned' | 'xpEarned' | 'diseaseHistory' | 'scanHistory' | 'careHistory' | 'growthTimeline' | 'leafNodes'>) => DigitalTwinPlant;
  handleCareAction: (plantId: string, actionType: 'water' | 'fertilize' | 'sunlight' | 'prune' | 'scan') => Promise<void>;
  handleScanUpload: (plantId: string, file: File | string) => Promise<DigitalTwinPlant>;
  claimMissionReward: (missionId: string) => void;
  dismissNotification: (id: string) => void;
  updateUserBio: (username: string, avatar: string) => void;
}

const GardenContext = createContext<GardenContextType | undefined>(undefined);

export const GardenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plants, setPlants] = useState<DigitalTwinPlant[]>(() => {
    const saved = localStorage.getItem('phytosophia_plants');
    return saved ? JSON.parse(saved) : INITIAL_PLANTS;
  });

  const [activePlantId, setActivePlantId] = useState<string | null>('plant-mango-1');

  const [user, setUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem('phytosophia_user');
    if (saved) return JSON.parse(saved);
    const levelInfo = getLevelDetails(1450);
    return {
      id: 'usr-1',
      username: 'PhytoKeeper',
      avatar: '🌱',
      level: levelInfo.level,
      title: levelInfo.title,
      xp: 1450,
      xpToNextLevel: levelInfo.xpForNextLevel,
      careStreak: 12,
      totalPlants: 4,
      healthyPlants: 3,
      stats: {
        totalWaterings: 18,
        totalScans: 8,
        diseaseRecoveries: 2,
        careConsistencyScore: 94,
      },
      achievements: [
        { id: 'ach-1', title: 'First Plant', description: 'Add your first plant to PhytoSophia.', icon: '🌱', unlocked: true, unlockedAt: 'Sep 1, 2026', progress: 1, maxProgress: 1 },
        { id: 'ach-2', title: 'Water Master', description: 'Perform 15 watering care actions.', icon: '💧', unlocked: true, unlockedAt: 'Oct 2, 2026', progress: 18, maxProgress: 15 },
        { id: 'ach-3', title: '7-Day Care Streak', description: 'Maintain care actions for 7 consecutive days.', icon: '🔥', unlocked: true, unlockedAt: 'Sep 25, 2026', progress: 7, maxProgress: 7 },
        { id: 'ach-4', title: 'Plant Doctor', description: 'Diagnose and recover an unhealthy plant.', icon: '🩺', unlocked: true, unlockedAt: 'Oct 04, 2026', progress: 1, maxProgress: 1 },
        { id: 'ach-5', title: 'Botanical Master', description: 'Reach level 7 and grow a mature 3D plant.', icon: '🌳', unlocked: false, progress: 3, maxProgress: 7 },
      ],
      badges: [
        { id: 'b-1', name: 'Sanctuary Keeper', icon: '🛡️', description: 'Kept 3+ plants >85% health for a week', tier: 'gold', unlockedAt: 'Oct 05, 2026' },
        { id: 'b-2', name: '7-Day Streak', icon: '🔥', description: 'Maintained 7-day care streak', tier: 'silver', unlockedAt: 'Sep 25, 2026' },
      ],
    };
  });

  const [missions, setMissions] = useState<Mission[]>(() => {
    const saved = localStorage.getItem('phytosophia_missions');
    return saved ? JSON.parse(saved) : INITIAL_MISSIONS;
  });

  const [leaderboard] = useState<LeaderboardUser[]>(INITIAL_LEADERBOARD);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 'n1', type: 'growth', title: 'Growth Milestone!', message: 'Mango Companion reached the HEALTHY stage!', timestamp: '1 hour ago', read: false },
    { id: 'n2', type: 'water', title: 'Watering Reminder', message: 'Swiss Monster needs hydration today.', timestamp: '3 hours ago', read: false },
  ]);

  useEffect(() => {
    localStorage.setItem('phytosophia_plants', JSON.stringify(plants));
  }, [plants]);

  useEffect(() => {
    localStorage.setItem('phytosophia_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('phytosophia_missions', JSON.stringify(missions));
  }, [missions]);

  const activePlant = plants.find((p) => p.id === activePlantId);

  const addPlant: GardenContextType['addPlant'] = (newPlantData) => {
    const newId = `plant-${Date.now()}`;
    const now = new Date().toISOString();

    const digitalTwin: DigitalTwinPlant = {
      ...newPlantData,
      id: newId,
      addedDate: now,
      healthScore: 90,
      growthScore: 20,
      growthStage: 'SPROUT',
      healthState: 'EXCELLENT',
      careStreak: 1,
      lastWatered: now,
      lastFertilized: now,
      lastScanned: now,
      xpEarned: 50,
      diseaseHistory: [],
      scanHistory: [],
      careHistory: [{ id: `c-init`, type: 'water', timestamp: now, xpEarned: 50, notes: 'Digital Twin Created' }],
      growthTimeline: [
        {
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          stage: 'SPROUT',
          growthScore: 20,
          event: 'Created Digital Twin & Potted Plant',
        },
      ],
      leafNodes: [
        { id: 'l1', label: 'Primary Leaf', position: [0.15, 0.15, 0], health: 90, moisture: 85 },
        { id: 'l2', label: 'Secondary Leaf', position: [-0.15, 0.2, 0], health: 90, moisture: 85 },
      ],
    };

    setPlants((prev) => [digitalTwin, ...prev]);
    setActivePlantId(newId);

    addXP(100);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    return digitalTwin;
  };

  const addXP = (amount: number) => {
    setUser((prevUser) => {
      const newXp = prevUser.xp + amount;
      const levelDetails = getLevelDetails(newXp);

      const leveledUp = levelDetails.level > prevUser.level;
      if (leveledUp) {
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}`,
            type: 'achievement',
            title: 'Level Up!',
            message: `Congratulations! You reached Level ${levelDetails.level}: ${levelDetails.title}!`,
            timestamp: 'Just now',
            read: false,
          },
          ...prev,
        ]);
      }

      return {
        ...prevUser,
        xp: newXp,
        level: levelDetails.level,
        title: levelDetails.title,
        xpToNextLevel: levelDetails.xpForNextLevel,
      };
    });
  };

  const handleCareAction = async (
    plantId: string,
    actionType: 'water' | 'fertilize' | 'sunlight' | 'prune' | 'scan'
  ) => {
    const targetPlant = plants.find((p) => p.id === plantId);
    if (!targetPlant) return;

    const { updatedPlant, xpEarned, newStageUnlocked, stageName } = processCareAction(targetPlant, actionType);

    setPlants((prev) => prev.map((p) => (p.id === plantId ? updatedPlant : p)));

    addXP(xpEarned);

    setMissions((prevMissions) =>
      prevMissions.map((m) => {
        if (actionType === 'water' && m.category === 'water' && !m.completed) {
          const newProg = m.progress + 1;
          return { ...m, progress: newProg, completed: newProg >= m.maxProgress };
        }
        if (m.category === 'care' && !m.completed) {
          const newProg = m.progress + 1;
          return { ...m, progress: newProg, completed: newProg >= m.maxProgress };
        }
        return m;
      })
    );

    if (newStageUnlocked) {
      setNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          type: 'growth',
          title: '3D Growth Stage Unlocked!',
          message: `${targetPlant.name} has evolved into a ${stageName} plant!`,
          timestamp: 'Just now',
          read: false,
        },
        ...prev,
      ]);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }
  };

  const handleScanUpload = async (plantId: string, file: File | string): Promise<DigitalTwinPlant> => {
    const targetPlant = plants.find((p) => p.id === plantId);
    const result = await analyzePlantImage(file, targetPlant?.species);

    const now = new Date().toISOString();
    const updatedHealth = result.pathology.healthScore;
    const updatedState = getHealthState(updatedHealth);

    const scanItem = {
      id: `scan-${Date.now()}`,
      timestamp: now,
      imageUrl: typeof file === 'string' ? file : URL.createObjectURL(file),
      healthScore: updatedHealth,
      condition: result.pathology.condition,
      taxonomy: result.taxonomy,
      pathology: result.pathology,
      segmentation: result.segmentation,
    };

    const updatedPlant: DigitalTwinPlant = {
      ...(targetPlant || ({} as DigitalTwinPlant)),
      healthScore: updatedHealth,
      healthState: updatedState,
      lastScanned: now,
      diseaseHistory: result.pathology.severity !== 'low' ? [result.pathology, ...(targetPlant?.diseaseHistory || [])] : targetPlant?.diseaseHistory || [],
      scanHistory: [scanItem, ...(targetPlant?.scanHistory || [])],
    };

    setPlants((prev) => prev.map((p) => (p.id === plantId ? updatedPlant : p)));

    setMissions((prev) =>
      prev.map((m) => (m.category === 'scan' ? { ...m, progress: 1, completed: true } : m))
    );

    addXP(40);

    return updatedPlant;
  };

  const claimMissionReward = (missionId: string) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || !mission.completed) return;

    addXP(mission.xpReward);

    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, progress: m.maxProgress, completed: true } : m))
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const updateUserBio = (username: string, avatar: string) => {
    setUser((prev) => ({ ...prev, username, avatar }));
  };

  return (
    <GardenContext.Provider
      value={{
        plants,
        activePlantId,
        activePlant,
        user,
        missions,
        leaderboard,
        notifications,
        setActivePlantId,
        addPlant,
        handleCareAction,
        handleScanUpload,
        claimMissionReward,
        dismissNotification,
        updateUserBio,
      }}
    >
      {children}
    </GardenContext.Provider>
  );
};

export const useGarden = () => {
  const context = useContext(GardenContext);
  if (!context) throw new Error('useGarden must be used within GardenProvider');
  return context;
};
