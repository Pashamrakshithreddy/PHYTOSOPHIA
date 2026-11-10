export type GrowthStage = 'SEED' | 'SPROUT' | 'YOUNG' | 'HEALTHY' | 'MATURE';

export type HealthState = 'EXCELLENT' | 'NEEDS_ATTENTION' | 'UNHEALTHY' | 'CRITICAL';

export interface Taxonomy {
  family: string;
  genus: string;
  species: string;
  commonName: string;
  confidence: number;
}

export interface PathologyResult {
  healthScore: number;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedRegion: string;
  confidence: number;
  recommendedAction: string;
  preventionTips: string[];
  disclaimer: string;
}

export interface SAMSegmentation {
  bbox: [number, number, number, number]; // [x, y, width, height] percentage
  plantMaskUrl?: string;
  affectedLeafRegions: Array<{
    id: string;
    label: string;
    bbox: [number, number, number, number];
    severity: 'low' | 'medium' | 'high';
    color: string;
  }>;
}

export interface CareAction {
  id: string;
  type: 'water' | 'fertilize' | 'sunlight' | 'scan' | 'prune';
  timestamp: string;
  xpEarned: number;
  notes?: string;
}

export interface ScanHistoryItem {
  id: string;
  timestamp: string;
  imageUrl: string;
  healthScore: number;
  condition: string;
  taxonomy: Taxonomy;
  pathology?: PathologyResult;
  segmentation?: SAMSegmentation;
}

export interface LeafNode {
  id: string;
  label: string;
  position: [number, number, number];
  health: number; // 0-100
  moisture: number; // 0-100
  issue?: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface DigitalTwinPlant {
  id: string;
  name: string;
  species: string;
  taxonomy: Taxonomy;
  imageUrl: string;
  location: 'Indoor' | 'Outdoor';
  roomZone?: 'Living Room' | 'Balcony Terrace' | 'Kitchen Windowsill' | 'Bedroom' | 'Greenhouse' | string;
  sunlight: 'Direct Sunlight' | 'Bright Indirect' | 'Partial Shade' | 'Low Light';
  addedDate: string;
  healthScore: number; // 0-100
  growthScore: number; // 0-100
  growthStage: GrowthStage;
  healthState: HealthState;
  careStreak: number; // days
  lastWatered: string;
  lastFertilized: string;
  lastScanned: string;
  nextTask: {
    type: 'Watering' | 'Fertilization' | 'Health Scan' | 'Sunlight Adjustment';
    dueDate: string;
  };
  xpEarned: number;
  notes: string;
  diseaseHistory: PathologyResult[];
  scanHistory: ScanHistoryItem[];
  careHistory: CareAction[];
  growthTimeline: Array<{
    date: string;
    stage: GrowthStage;
    growthScore: number;
    event: string;
  }>;
  leafNodes: LeafNode[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlockedAt: string;
}

export interface UserAccount {
  id: string;
  username: string;
  avatar: string;
  level: number;
  title: string;
  xp: number;
  xpToNextLevel: number;
  careStreak: number;
  totalPlants: number;
  healthyPlants: number;
  achievements: Achievement[];
  badges: Badge[];
  stats: {
    totalWaterings: number;
    totalScans: number;
    diseaseRecoveries: number;
    careConsistencyScore: number;
  };
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  xpReward: number;
  badgeReward?: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  category: 'water' | 'scan' | 'care' | 'health' | 'learn';
}

export interface LeaderboardUser {
  rank: number;
  username: string;
  avatar: string;
  level: number;
  title: string;
  xp: number;
  gardenHealth: number;
  careStreak: number;
  healthyPlants: number;
  totalPlants: number;
  fairScore: number;
  badges: string[];
  topTips: string[];
  publicRoutines: string[];
}

export interface NotificationItem {
  id: string;
  type: 'water' | 'disease' | 'growth' | 'leaderboard' | 'streak' | 'achievement';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
