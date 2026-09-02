import { Formation } from "@/types";

const formations: Record<string, Formation> = {
  "4-3-3": {
    name: "4-3-3",
    slots: [
      // GK
      { role: "GK",  x: 50, y: 90 },
      // DEF
      { role: "LB",  x: 15, y: 72 },
      { role: "CB",  x: 37, y: 75 },
      { role: "CB",  x: 63, y: 75 },
      { role: "RB",  x: 85, y: 72 },
      // MID
      { role: "CM",  x: 30, y: 52 },
      { role: "CM",  x: 50, y: 48 },
      { role: "CM",  x: 70, y: 52 },
      // FWD
      { role: "LW",  x: 18, y: 25 },
      { role: "ST",  x: 50, y: 20 },
      { role: "RW",  x: 82, y: 25 },
    ],
  },

  "4-4-2": {
    name: "4-4-2",
    slots: [
      { role: "GK",  x: 50, y: 90 },
      { role: "LB",  x: 15, y: 72 },
      { role: "CB",  x: 37, y: 75 },
      { role: "CB",  x: 63, y: 75 },
      { role: "RB",  x: 85, y: 72 },
      { role: "LM",  x: 15, y: 50 },
      { role: "CM",  x: 37, y: 52 },
      { role: "CM",  x: 63, y: 52 },
      { role: "RM",  x: 85, y: 50 },
      { role: "ST",  x: 37, y: 22 },
      { role: "ST",  x: 63, y: 22 },
    ],
  },

  "3-5-2": {
    name: "3-5-2",
    slots: [
      { role: "GK",  x: 50, y: 90 },
      { role: "CB",  x: 25, y: 75 },
      { role: "CB",  x: 50, y: 78 },
      { role: "CB",  x: 75, y: 75 },
      { role: "LWB", x: 10, y: 52 },
      { role: "CM",  x: 32, y: 55 },
      { role: "CM",  x: 50, y: 48 },
      { role: "CM",  x: 68, y: 55 },
      { role: "RWB", x: 90, y: 52 },
      { role: "ST",  x: 37, y: 22 },
      { role: "ST",  x: 63, y: 22 },
    ],
  },

  "4-2-3-1": {
    name: "4-2-3-1",
    slots: [
      { role: "GK",  x: 50, y: 90 },
      { role: "LB",  x: 15, y: 72 },
      { role: "CB",  x: 37, y: 75 },
      { role: "CB",  x: 63, y: 75 },
      { role: "RB",  x: 85, y: 72 },
      { role: "CDM", x: 37, y: 58 },
      { role: "CDM", x: 63, y: 58 },
      { role: "LW",  x: 18, y: 38 },
      { role: "CAM", x: 50, y: 35 },
      { role: "RW",  x: 82, y: 38 },
      { role: "ST",  x: 50, y: 18 },
    ],
  },

  "3-4-3": {
    name: "3-4-3",
    slots: [
      { role: "GK",  x: 50, y: 90 },
      { role: "CB",  x: 25, y: 75 },
      { role: "CB",  x: 50, y: 78 },
      { role: "CB",  x: 75, y: 75 },
      { role: "LM",  x: 12, y: 52 },
      { role: "CM",  x: 38, y: 55 },
      { role: "CM",  x: 62, y: 55 },
      { role: "RM",  x: 88, y: 52 },
      { role: "LW",  x: 20, y: 25 },
      { role: "ST",  x: 50, y: 20 },
      { role: "RW",  x: 80, y: 25 },
    ],
  },

  "5-3-2": {
    name: "5-3-2",
    slots: [
      { role: "GK",  x: 50, y: 90 },
      { role: "LWB", x: 10, y: 65 },
      { role: "CB",  x: 28, y: 75 },
      { role: "CB",  x: 50, y: 78 },
      { role: "CB",  x: 72, y: 75 },
      { role: "RWB", x: 90, y: 65 },
      { role: "CM",  x: 32, y: 50 },
      { role: "CM",  x: 50, y: 45 },
      { role: "CM",  x: 68, y: 50 },
      { role: "ST",  x: 37, y: 22 },
      { role: "ST",  x: 63, y: 22 },
    ],
  },
};

/**
 * Available formation names for the selector.
 */
export const FORMATION_OPTIONS = Object.keys(formations);

/**
 * Get a formation by name. Falls back to 4-3-3 if not found.
 */
export function getFormation(name: string): Formation {
  return formations[name] || formations["4-3-3"];
}

/**
 * Get all formations.
 */
export function getAllFormations(): Formation[] {
  return Object.values(formations);
}

export default formations;
