/** Shared progression rules. The server must be authoritative once persistence is connected. */
export const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1_000, 1_400, 1_900, 2_500, 3_200] as const;
export type PlayerProgress = { totalXp: number; level: number; currentLevelXp: number; nextLevelXp: number; progressPercent: number };

export function getLevelForXp(totalXp: number): number {
  const xp = Math.max(0, Math.floor(totalXp));
  for (let index = 1; index < LEVEL_THRESHOLDS.length; index += 1) {
    if (xp < LEVEL_THRESHOLDS[index]) return index;
  }
  return LEVEL_THRESHOLDS.length + Math.floor((xp - LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]) / 900);
}

export function getPlayerProgress(totalXp: number): PlayerProgress {
  const xp = Math.max(0, Math.floor(totalXp));
  const level = getLevelForXp(xp);
  const currentThreshold = level < LEVEL_THRESHOLDS.length
    ? LEVEL_THRESHOLDS[level - 1]
    : LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (level - LEVEL_THRESHOLDS.length) * 900;
  const nextThreshold = level < LEVEL_THRESHOLDS.length
    ? LEVEL_THRESHOLDS[level]
    : currentThreshold + 900;
  const span = nextThreshold - currentThreshold;
  const earned = xp - currentThreshold;
  return {
    totalXp: xp,
    level,
    currentLevelXp: earned,
    nextLevelXp: nextThreshold,
    progressPercent: Math.min(100, Math.floor((earned / span) * 100)),
  };
}

/** Basic guard; the server must additionally validate the event and idempotency key. */
export function canAwardXp(amount: number): boolean {
  return Number.isInteger(amount) && amount > 0 && amount <= 500;
}
