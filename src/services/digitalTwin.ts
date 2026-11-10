import type { DigitalTwinPlant, GrowthStage, HealthState, CareAction } from '../types';

/**
 * Derives HealthState enum from health score
 */
export function getHealthState(score: number): HealthState {
  if (score >= 90) return 'EXCELLENT';
  if (score >= 75) return 'NEEDS_ATTENTION';
  if (score >= 50) return 'UNHEALTHY';
  return 'CRITICAL';
}

/**
 * Derives GrowthStage from growth score (0-100)
 */
export function getGrowthStage(score: number): GrowthStage {
  if (score < 20) return 'SEED';
  if (score < 40) return 'SPROUT';
  if (score < 65) return 'YOUNG';
  if (score < 85) return 'HEALTHY';
  return 'MATURE';
}

/**
 * Calculates updated plant growth score based on digital twin telemetry
 */
export function calculateGrowthScore(
  currentGrowth: number,
  healthScore: number,
  lastWateredDaysAgo: number,
  lastFertilizedDaysAgo: number,
  hasActiveDisease: boolean,
  careStreak: number
): number {
  let delta = 0;

  if (healthScore >= 90) delta += 2.5;
  else if (healthScore >= 75) delta += 1.0;
  else if (healthScore >= 50) delta -= 1.5;
  else delta -= 3.0;

  if (lastWateredDaysAgo <= 2) delta += 1.5;
  else if (lastWateredDaysAgo > 5) delta -= 2.0;

  if (lastFertilizedDaysAgo <= 14) delta += 1.0;

  if (hasActiveDisease) delta -= 2.5;

  if (careStreak >= 7) delta += 0.5;

  const newScore = Math.min(100, Math.max(0, currentGrowth + delta));
  return Math.round(newScore * 10) / 10;
}

/**
 * Calculates fair leaderboard ranking score
 */
export function calculateFairLeaderboardScore(
  avgHealth: number,
  avgGrowth: number,
  careStreak: number,
  diseaseRecoveries: number,
  completedMissionsCount: number
): number {
  const healthWeight = avgHealth * 4.0;
  const growthWeight = avgGrowth * 2.5;
  const streakBonus = Math.min(careStreak * 15, 300);
  const recoveryBonus = diseaseRecoveries * 50;
  const taskBonus = completedMissionsCount * 10;

  return Math.round(healthWeight + growthWeight + streakBonus + recoveryBonus + taskBonus);
}

/**
 * Calculates Level and Title based on total XP
 */
export function getLevelDetails(xp: number): { level: number; title: string; xpForCurrentLevel: number; xpForNextLevel: number; progress: number } {
  const levels = [
    { level: 1, title: 'Seedling', minXp: 0, maxXp: 300 },
    { level: 2, title: 'Sprout', minXp: 300, maxXp: 800 },
    { level: 3, title: 'Gardener', minXp: 800, maxXp: 1600 },
    { level: 4, title: 'Plant Keeper', minXp: 1600, maxXp: 2800 },
    { level: 5, title: 'Green Thumb', minXp: 2800, maxXp: 4500 },
    { level: 6, title: 'Plant Expert', minXp: 4500, maxXp: 7000 },
    { level: 7, title: 'Botanical Master', minXp: 7000, maxXp: 12000 },
  ];

  const currentLevelObj = levels.find((l) => xp >= l.minXp && xp < l.maxXp) || levels[levels.length - 1];

  const xpInLevel = xp - currentLevelObj.minXp;
  const xpNeeded = currentLevelObj.maxXp - currentLevelObj.minXp;
  const progress = Math.min(100, Math.max(0, (xpInLevel / xpNeeded) * 100));

  return {
    level: currentLevelObj.level,
    title: currentLevelObj.title,
    xpForCurrentLevel: currentLevelObj.minXp,
    xpForNextLevel: currentLevelObj.maxXp,
    progress: Math.round(progress),
  };
}

/**
 * Simulates real-time care action execution on a digital twin plant
 */
export function processCareAction(
  plant: DigitalTwinPlant,
  actionType: 'water' | 'fertilize' | 'sunlight' | 'prune' | 'scan'
): { updatedPlant: DigitalTwinPlant; xpEarned: number; newStageUnlocked: boolean; stageName?: GrowthStage } {
  const now = new Date().toISOString();
  let healthBoost = 0;
  let growthBoost = 0;
  let xpEarned = 0;

  if (actionType === 'water') {
    healthBoost = Math.min(100, plant.healthScore + 8) - plant.healthScore;
    growthBoost = 3;
    xpEarned = 25;
  } else if (actionType === 'fertilize') {
    healthBoost = Math.min(100, plant.healthScore + 12) - plant.healthScore;
    growthBoost = 5;
    xpEarned = 35;
  } else if (actionType === 'sunlight') {
    healthBoost = Math.min(100, plant.healthScore + 5) - plant.healthScore;
    growthBoost = 2;
    xpEarned = 15;
  } else if (actionType === 'prune') {
    healthBoost = Math.min(100, plant.healthScore + 10) - plant.healthScore;
    growthBoost = 4;
    xpEarned = 30;
  } else if (actionType === 'scan') {
    xpEarned = 40;
  }

  const newHealthScore = Math.min(100, plant.healthScore + healthBoost);
  const newGrowthScore = Math.min(100, Math.max(0, plant.growthScore + growthBoost));
  const newStage = getGrowthStage(newGrowthScore);
  const newHealthState = getHealthState(newHealthScore);

  const stageUnlocked = newStage !== plant.growthStage;

  const newCareAction: CareAction = {
    id: `care-${Date.now()}`,
    type: actionType,
    timestamp: now,
    xpEarned,
    notes: `${actionType.toUpperCase()} action recorded. Health +${healthBoost}%, Growth +${growthBoost}%`,
  };

  const updatedTimeline = [...plant.growthTimeline];
  if (stageUnlocked) {
    updatedTimeline.push({
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      stage: newStage,
      growthScore: newGrowthScore,
      event: `Reached ${newStage} growth stage!`,
    });
  }

  const updatedLeafNodes = plant.leafNodes.map((leaf) => {
    return {
      ...leaf,
      health: Math.min(100, leaf.health + healthBoost),
      moisture: actionType === 'water' ? 95 : leaf.moisture,
      issue: newHealthScore > 85 ? undefined : leaf.issue,
    };
  });

  const updatedPlant: DigitalTwinPlant = {
    ...plant,
    healthScore: newHealthScore,
    growthScore: newGrowthScore,
    growthStage: newStage,
    healthState: newHealthState,
    lastWatered: actionType === 'water' ? now : plant.lastWatered,
    lastFertilized: actionType === 'fertilize' ? now : plant.lastFertilized,
    lastScanned: actionType === 'scan' ? now : plant.lastScanned,
    xpEarned: plant.xpEarned + xpEarned,
    careHistory: [newCareAction, ...plant.careHistory],
    growthTimeline: updatedTimeline,
    leafNodes: updatedLeafNodes,
  };

  return {
    updatedPlant,
    xpEarned,
    newStageUnlocked: stageUnlocked,
    stageName: newStage,
  };
}
