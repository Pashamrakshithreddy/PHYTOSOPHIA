import type { Taxonomy, PathologyResult, SAMSegmentation, DigitalTwinPlant } from '../types';

export interface ScanAnalysisResponse {
  taxonomy: Taxonomy;
  segmentation: SAMSegmentation;
  pathology: PathologyResult;
  isDemoResult: boolean;
}

const BOTANICAL_DATABASE: Array<{
  matchKeywords: string[];
  taxonomy: Taxonomy;
  healthySegmentation: SAMSegmentation;
  issues: PathologyResult[];
}> = [
  {
    matchKeywords: ['mango', 'mangifera', 'fruit tree'],
    taxonomy: {
      family: 'Anacardiaceae',
      genus: 'Mangifera',
      species: 'Mangifera indica',
      commonName: 'Mango Tree',
      confidence: 0.96,
    },
    healthySegmentation: {
      bbox: [15, 12, 70, 75],
      affectedLeafRegions: [
        { id: 'leaf-1', label: 'Top Foliage Cluster', bbox: [25, 15, 40, 25], severity: 'low', color: '#10b981' },
      ],
    },
    issues: [
      {
        healthScore: 86,
        condition: 'Mild Leaf Tip Necrosis',
        severity: 'low',
        affectedRegion: 'Upper Foliage Tip (Leaf #2)',
        confidence: 0.92,
        recommendedAction: 'Inspect soil electrical conductivity (EC). Ensure deep watering cycles without waterlogging roots.',
        preventionTips: [
          'Use filtered or distilled water if tap water has high fluoride/chlorides.',
          'Maintain 6-8 hours of direct morning sunlight.',
          'Flush soil with clean water once monthly to purge salt buildup.',
        ],
        disclaimer: 'Visual symptoms consistent with mild tip necrosis. Consider verifying soil moisture and salt levels.',
      },
    ],
  },
  {
    matchKeywords: ['monstera', 'swiss cheese', 'deliciosa'],
    taxonomy: {
      family: 'Araceae',
      genus: 'Monstera',
      species: 'Monstera deliciosa',
      commonName: 'Monstera Deliciosa (Swiss Cheese Plant)',
      confidence: 0.98,
    },
    healthySegmentation: {
      bbox: [10, 10, 80, 80],
      affectedLeafRegions: [
        { id: 'leaf-main', label: 'Fenestrated Leaf #1', bbox: [20, 20, 45, 45], severity: 'medium', color: '#eab308' },
      ],
    },
    issues: [
      {
        healthScore: 78,
        condition: 'Mild Leaf Yellowing (Chlorosis)',
        severity: 'medium',
        affectedRegion: 'Lower Fenestrated Leaf',
        confidence: 0.94,
        recommendedAction: 'Check soil moisture 2 inches deep. Over-watering is the primary trigger for lower leaf chlorosis.',
        preventionTips: [
          'Allow top 2-3 inches of potting medium to dry between waterings.',
          'Ensure pot has adequate bottom drainage holes.',
          'Apply balanced liquid fertilizer (10-10-10) monthly during growth season.',
        ],
        disclaimer: 'Visual symptoms consistent with nutrient lock or mild overwatering. Check drainage before watering again.',
      },
    ],
  },
];

/**
 * Simulates ViT Taxonomy + SAM Segmentation + Pathology Neural Pipeline
 */
export async function analyzePlantImage(
  _imageFileOrUrl: File | string,
  userSelectedSpecies?: string
): Promise<ScanAnalysisResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  let matchedEntry = BOTANICAL_DATABASE[0];
  if (userSelectedSpecies) {
    const found = BOTANICAL_DATABASE.find((b) =>
      b.matchKeywords.some((k) => userSelectedSpecies.toLowerCase().includes(k))
    );
    if (found) matchedEntry = found;
  }

  const pathology = matchedEntry.issues[0];

  const segmentation: SAMSegmentation = {
    bbox: matchedEntry.healthySegmentation.bbox,
    affectedLeafRegions: [
      {
        id: `seg-${Date.now()}`,
        label: `${matchedEntry.taxonomy.commonName} Main Leaf Structure`,
        bbox: [22, 18, 56, 60],
        severity: pathology.severity === 'high' ? 'high' : pathology.severity === 'medium' ? 'medium' : 'low',
        color: pathology.severity === 'high' ? '#ef4444' : pathology.severity === 'medium' ? '#f59e0b' : '#10b981',
      },
    ],
  };

  return {
    taxonomy: matchedEntry.taxonomy,
    segmentation,
    pathology,
    isDemoResult: true,
  };
}

/**
 * RAG Botanical Assistant Chat Service with Digital Twin Context Integration
 */
export async function queryPhytoAI(
  userQuestion: string,
  selectedPlant?: DigitalTwinPlant,
  _allPlants?: DigitalTwinPlant[]
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const q = userQuestion.toLowerCase();

  if (selectedPlant) {
    const daysSinceWatered = selectedPlant.lastWatered
      ? Math.floor((Date.now() - new Date(selectedPlant.lastWatered).getTime()) / (1000 * 60 * 60 * 24))
      : 3;

    if (q.includes('yellow') || q.includes('color') || q.includes('leaves')) {
      return `🌿 **PhytoAI Analysis for ${selectedPlant.name} (${selectedPlant.species})**:\n\n` +
        `Your ${selectedPlant.name} has a current Health Score of **${selectedPlant.healthScore}%** (${selectedPlant.healthState}). ` +
        `Telemetry shows it was last watered **${daysSinceWatered} day(s) ago** in an **${selectedPlant.location}** setting with **${selectedPlant.sunlight}**.\n\n` +
        `🔍 **RAG Knowledge Base Context**:\n` +
        `Leaf yellowing in *${selectedPlant.taxonomy.genus}* species often stems from either moisture stagnation in roots or light mismatch.\n\n` +
        `💡 **Recommended Actions**:\n` +
        `1. Feel the top 2 inches of soil. If moist, hold off on watering for 2-3 days.\n` +
        `2. Ensure root drainage holes are unobstructed.\n` +
        `3. Keep away from cold air drafts or harsh direct noon sun rays.\n\n` +
        `*XP Bonus*: Perform a Health Scan in the Scanner tab after checking soil to record progress!`;
    }

    if (q.includes('water') || q.includes('how often') || q.includes('moisture')) {
      return `💧 **Watering Guide for ${selectedPlant.name}**:\n\n` +
        `For **${selectedPlant.species}** in **${selectedPlant.location}** conditions (${selectedPlant.sunlight}):\n` +
        `- **Current Status**: Last watered ${daysSinceWatered} day(s) ago.\n` +
        `- **Recommended Frequency**: Every 4-7 days depending on temperature.\n` +
        `- **Rule of Thumb**: Water thoroughly until excess drains out the bottom, then wait until the top 2 inches dry out.\n\n` +
        `Tap **💧 Water Plant** in your garden view once you complete watering to sync its 3D digital twin growth state!`;
    }

    if (q.includes('fertiliz') || q.includes('feed') || q.includes('nutrient')) {
      return `🌱 **Nutrient & Fertilization Strategy**:\n\n` +
        `${selectedPlant.name} is currently in the **${selectedPlant.growthStage}** stage with a growth score of **${selectedPlant.growthScore}/100**.\n\n` +
        `• **Recommended NPK**: Balanced organic 10-10-10 or seaweed extract.\n` +
        `• **Frequency**: Once every 2-3 weeks during active growth.\n` +
        `• **Safety Note**: Never fertilize completely dry soil—water slightly first to prevent root burn.`;
    }
  }

  if (q.includes('streak') || q.includes('level') || q.includes('xp') || q.includes('leaderboard')) {
    return `🏆 **PhytoSophia Gamification System Guide**:\n\n` +
      `Your Leaderboard rank is calculated using our **Fair Gardening Score Formula**:\n` +
      `\`Score = (Average Health × 4) + (Growth × 2.5) + (Streak Bonus) + (Disease Recoveries × 50)\`\n\n` +
      `This means maintaining 3 extremely healthy plants with consistent daily care outranks having 50 neglected plants! Keep up your streak to level up fast.`;
  }

  return `🌿 **PhytoAI Botanical Assistant**:\n\n` +
    `Based on botanical literature for your digital garden context:\n\n` +
    `• **Lighting**: Ensure your indoor plants receive bright, indirect sunlight to power photosynthesis without scorching foliage.\n` +
    `• **Air Circulation**: Good airflow drastically reduces fungal spore germination such as powdery mildew.\n` +
    `• **Digital Twin Sync**: Every care action you log directly powers your plant's 3D growth model, unlocks missions, and earns XP!`;
}
