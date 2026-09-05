import { Formation } from "@/types";

/* ── 11v11 Formations (full pitch) ── */
const formations11: Record<string, Formation> = {
  "4-3-3": {
    name: "4-3-3",
    playerCount: 11,
    slots: [
      { role: "GK", x: 50, y: 90 },
      { role: "LB", x: 15, y: 72 },
      { role: "CB", x: 37, y: 75 },
      { role: "CB", x: 63, y: 75 },
      { role: "RB", x: 85, y: 72 },
      { role: "CM", x: 30, y: 52 },
      { role: "CM", x: 50, y: 48 },
      { role: "CM", x: 70, y: 52 },
      { role: "LW", x: 18, y: 25 },
      { role: "ST", x: 50, y: 20 },
      { role: "RW", x: 82, y: 25 },
    ],
  },

  "4-4-2": {
    name: "4-4-2",
    playerCount: 11,
    slots: [
      { role: "GK", x: 50, y: 90 },
      { role: "LB", x: 15, y: 72 },
      { role: "CB", x: 37, y: 75 },
      { role: "CB", x: 63, y: 75 },
      { role: "RB", x: 85, y: 72 },
      { role: "LM", x: 15, y: 50 },
      { role: "CM", x: 37, y: 52 },
      { role: "CM", x: 63, y: 52 },
      { role: "RM", x: 85, y: 50 },
      { role: "ST", x: 37, y: 22 },
      { role: "ST", x: 63, y: 22 },
    ],
  },

  "3-5-2": {
    name: "3-5-2",
    playerCount: 11,
    slots: [
      { role: "GK", x: 50, y: 90 },
      { role: "CB", x: 25, y: 75 },
      { role: "CB", x: 50, y: 78 },
      { role: "CB", x: 75, y: 75 },
      { role: "LWB", x: 10, y: 52 },
      { role: "CM", x: 32, y: 55 },
      { role: "CM", x: 50, y: 48 },
      { role: "CM", x: 68, y: 55 },
      { role: "RWB", x: 90, y: 52 },
      { role: "ST", x: 37, y: 22 },
      { role: "ST", x: 63, y: 22 },
    ],
  },

  "4-2-3-1": {
    name: "4-2-3-1",
    playerCount: 11,
    slots: [
      { role: "GK", x: 50, y: 90 },
      { role: "LB", x: 15, y: 72 },
      { role: "CB", x: 37, y: 75 },
      { role: "CB", x: 63, y: 75 },
      { role: "RB", x: 85, y: 72 },
      { role: "CDM", x: 37, y: 58 },
      { role: "CDM", x: 63, y: 58 },
      { role: "LW", x: 18, y: 38 },
      { role: "CAM", x: 50, y: 35 },
      { role: "RW", x: 82, y: 38 },
      { role: "ST", x: 50, y: 18 },
    ],
  },

  "3-4-3": {
    name: "3-4-3",
    playerCount: 11,
    slots: [
      { role: "GK", x: 50, y: 90 },
      { role: "CB", x: 25, y: 75 },
      { role: "CB", x: 50, y: 78 },
      { role: "CB", x: 75, y: 75 },
      { role: "LM", x: 12, y: 52 },
      { role: "CM", x: 38, y: 55 },
      { role: "CM", x: 62, y: 55 },
      { role: "RM", x: 88, y: 52 },
      { role: "LW", x: 20, y: 25 },
      { role: "ST", x: 50, y: 20 },
      { role: "RW", x: 80, y: 25 },
    ],
  },

  "5-3-2": {
    name: "5-3-2",
    playerCount: 11,
    slots: [
      { role: "GK", x: 50, y: 90 },
      { role: "LWB", x: 10, y: 65 },
      { role: "CB", x: 28, y: 75 },
      { role: "CB", x: 50, y: 78 },
      { role: "CB", x: 72, y: 75 },
      { role: "RWB", x: 90, y: 65 },
      { role: "CM", x: 32, y: 50 },
      { role: "CM", x: 50, y: 45 },
      { role: "CM", x: 68, y: 50 },
      { role: "ST", x: 37, y: 22 },
      { role: "ST", x: 63, y: 22 },
    ],
  },
};

/* ── 9v9 Formations ── */
const formations9: Record<string, Formation> = {
  "3-3-2": {
    name: "3-3-2",
    playerCount: 9,
    slots: [
      { role: "GK", x: 50, y: 90 },
      { role: "CB", x: 25, y: 72 },
      { role: "CB", x: 50, y: 75 },
      { role: "CB", x: 75, y: 72 },
      { role: "CM", x: 28, y: 50 },
      { role: "CM", x: 50, y: 47 },
      { role: "CM", x: 72, y: 50 },
      { role: "ST", x: 37, y: 22 },
      { role: "ST", x: 63, y: 22 },
    ],
  },
  "2-4-2": {
    name: "2-4-2",
    playerCount: 9,
    slots: [
      { role: "GK", x: 50, y: 90 },
      { role: "CB", x: 37, y: 75 },
      { role: "CB", x: 63, y: 75 },
      { role: "LM", x: 15, y: 50 },
      { role: "CM", x: 37, y: 52 },
      { role: "CM", x: 63, y: 52 },
      { role: "RM", x: 85, y: 50 },
      { role: "ST", x: 37, y: 22 },
      { role: "ST", x: 63, y: 22 },
    ],
  },
  "3-2-3": {
    name: "3-2-3",
    playerCount: 9,
    slots: [
      { role: "GK", x: 50, y: 90 },
      { role: "CB", x: 25, y: 72 },
      { role: "CB", x: 50, y: 75 },
      { role: "CB", x: 75, y: 72 },
      { role: "CM", x: 37, y: 52 },
      { role: "CM", x: 63, y: 52 },
      { role: "LW", x: 20, y: 25 },
      { role: "ST", x: 50, y: 20 },
      { role: "RW", x: 80, y: 25 },
    ],
  },
  "4-3-1": {
    name: "4-3-1",
    playerCount: 9,
    slots: [
      { role: "GK", x: 50, y: 90 },
      { role: "LB", x: 18, y: 72 },
      { role: "CB", x: 40, y: 75 },
      { role: "CB", x: 60, y: 75 },
      { role: "RB", x: 82, y: 72 },
      { role: "CM", x: 28, y: 50 },
      { role: "CM", x: 50, y: 47 },
      { role: "CM", x: 72, y: 50 },
      { role: "ST", x: 50, y: 22 },
    ],
  },
};

/* ── 7v7 Formations ── */
const formations7: Record<string, Formation> = {
  "2-3-1": {
    name: "2-3-1",
    playerCount: 7,
    slots: [
      { role: "GK", x: 50, y: 90 },
      { role: "CB", x: 35, y: 72 },
      { role: "CB", x: 65, y: 72 },
      { role: "LM", x: 20, y: 50 },
      { role: "CM", x: 50, y: 47 },
      { role: "RM", x: 80, y: 50 },
      { role: "ST", x: 50, y: 22 },
    ],
  },
  "3-2-1": {
    name: "3-2-1",
    playerCount: 7,
    slots: [
      { role: "GK", x: 50, y: 90 },
      { role: "CB", x: 25, y: 72 },
      { role: "CB", x: 50, y: 75 },
      { role: "CB", x: 75, y: 72 },
      { role: "CM", x: 35, y: 50 },
      { role: "CM", x: 65, y: 50 },
      { role: "ST", x: 50, y: 22 },
    ],
  },
  "1-3-2": {
    name: "1-3-2",
    playerCount: 7,
    slots: [
      { role: "GK", x: 50, y: 90 },
      { role: "CB", x: 50, y: 72 },
      { role: "LM", x: 20, y: 50 },
      { role: "CM", x: 50, y: 47 },
      { role: "RM", x: 80, y: 50 },
      { role: "ST", x: 35, y: 22 },
      { role: "ST", x: 65, y: 22 },
    ],
  },
  "2-1-2-1": {
    name: "2-1-2-1",
    playerCount: 7,
    slots: [
      { role: "GK", x: 50, y: 90 },
      { role: "CB", x: 35, y: 72 },
      { role: "CB", x: 65, y: 72 },
      { role: "CDM", x: 50, y: 58 },
      { role: "LM", x: 28, y: 45 },
      { role: "RM", x: 72, y: 45 },
      { role: "ST", x: 50, y: 22 },
    ],
  },
};

/* ── 5v5 Formations ── */
const formations5: Record<string, Formation> = {
  "1-2-1": {
    name: "1-2-1",
    playerCount: 5,
    slots: [
      { role: "GK", x: 50, y: 90 },
      { role: "CB", x: 30, y: 65 },
      { role: "CB", x: 70, y: 65 },
      { role: "CM", x: 50, y: 48 },
      { role: "ST", x: 50, y: 25 },
    ],
  },
  "1-1-2": {
    name: "1-1-2",
    playerCount: 5,
    slots: [
      { role: "GK", x: 50, y: 90 },
      { role: "CB", x: 50, y: 65 },
      { role: "CM", x: 50, y: 48 },
      { role: "LW", x: 30, y: 30 },
      { role: "RW", x: 70, y: 30 },
    ],
  },
  "2-1-1": {
    name: "2-1-1",
    playerCount: 5,
    slots: [
      { role: "GK", x: 50, y: 90 },
      { role: "CB", x: 30, y: 65 },
      { role: "CB", x: 70, y: 65 },
      { role: "CM", x: 50, y: 45 },
      { role: "ST", x: 50, y: 22 },
    ],
  },
  "1-3": {
    name: "1-3",
    playerCount: 5,
    slots: [
      { role: "GK", x: 50, y: 90 },
      { role: "CB", x: 50, y: 60 },
      { role: "LW", x: 25, y: 35 },
      { role: "ST", x: 50, y: 25 },
      { role: "RW", x: 75, y: 35 },
    ],
  },
};

/* ── All formations ── */
const allFormations: Record<string, Formation> = {
  ...formations11,
  ...formations9,
  ...formations7,
  ...formations5,
};

/**
 * Field size definitions.
 */
export const FIELD_SIZES = [
  { label: "5v5 (Futsal)", value: 5, description: "Small-sided / futsal" },
  { label: "7v7 (Small Pitch)", value: 7, description: "Youth / small-sided" },
  { label: "9v9 (Medium Pitch)", value: 9, description: "Junior / intermediate" },
  { label: "11v11 (Full Pitch)", value: 11, description: "Standard full match" },
] as const;

export type FieldSize = 5 | 7 | 9 | 11;

/**
 * Get formation names available for a specific field size.
 */
export function getFormationOptions(playerCount: FieldSize): string[] {
  const formMap: Record<number, Record<string, Formation>> = {
    5: formations5,
    7: formations7,
    9: formations9,
    11: formations11,
  };
  return Object.keys(formMap[playerCount] || formations11);
}

/**
 * Available formation names for backward compat.
 */
export const FORMATION_OPTIONS = Object.keys(allFormations);

/**
 * Get a formation by name. Falls back to first formation for the given size.
 */
export function getFormation(name: string, playerCount?: FieldSize): Formation {
  if (allFormations[name]) return allFormations[name];
  const fallback = Object.values(playerCount === 5 ? formations5 : playerCount === 7 ? formations7 : playerCount === 9 ? formations9 : formations11);
  return fallback[0] || formations11["4-3-3"];
}

/**
 * Get the player count for a formation name.
 */
export function getFormationPlayerCount(name: string): FieldSize {
  return (allFormations[name]?.playerCount || 11) as FieldSize;
}

/**
 * Get all formations for a specific field size.
 */
export function getFormationsForFieldSize(playerCount: FieldSize): Formation[] {
  const formMap: Record<number, Record<string, Formation>> = {
    5: formations5,
    7: formations7,
    9: formations9,
    11: formations11,
  };
  return Object.values(formMap[playerCount] || formations11);
}

export function getAllFormations(): Formation[] {
  return Object.values(allFormations);
}

export default allFormations;
