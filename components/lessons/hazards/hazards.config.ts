export type HazardType = "spill" | "pedestrian" | "overhead" | "unstable_load" | "speed_zone" | "blind_corner" | "ramp_slope" | "dock_edge";

export interface Hotspot {
  id: string;
  label: string;
  type: HazardType;
  // hotspot rectangle as percentages of the scene (0-100)
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
}

export interface Scene {
  id: string;
  title: string;
  image: string; // public path to SVG scene (1200x800)
  hotspots: Hotspot[];
}

export const scenes: Scene[] = [
  {
    id: "warehouse-bay",
    title: "Warehouse Bay",
    image: "/training/scenes/warehouse-bay-1.svg",
    hotspots: [
      { id: "spill", label: "Floor spill", type: "spill", xPct: 63, yPct: 78, wPct: 14, hPct: 8 },
      { id: "pedestrian", label: "Pedestrian conflict", type: "pedestrian", xPct: 38, yPct: 70, wPct: 26, hPct: 14 },
      { id: "overhead", label: "Overhead obstruction", type: "overhead", xPct: 77, yPct: 22, wPct: 18, hPct: 10 },
      { id: "unstable_load", label: "Unstable load on rack", type: "unstable_load", xPct: 78, yPct: 54, wPct: 18, hPct: 12 },
      { id: "speed_zone", label: "Speed zone risk", type: "speed_zone", xPct: 56, yPct: 80, wPct: 28, hPct: 10 }
    ]
  },
  {
    id: "blind-corner",
    title: "Blind Corner",
    image: "/training/scenes/aisle-blind-corner.svg",
    hotspots: [
      { id: "blind_corner", label: "Blind corner", type: "blind_corner", xPct: 80, yPct: 38, wPct: 16, hPct: 12 },
      { id: "pedestrian", label: "Pedestrian crossing", type: "pedestrian", xPct: 52, yPct: 44, wPct: 16, hPct: 10 },
      { id: "spill", label: "Floor spill", type: "spill", xPct: 23, yPct: 84, wPct: 12, hPct: 8 },
      { id: "speed_zone", label: "Speed zone", type: "speed_zone", xPct: 36, yPct: 82, wPct: 40, hPct: 12 }
    ]
  },
  {
    id: "ramp-dock",
    title: "Ramp / Dock",
    image: "/training/scenes/loading-ramp.svg",
    hotspots: [
      { id: "ramp_slope", label: "Ramp slope", type: "ramp_slope", xPct: 34, yPct: 72, wPct: 44, hPct: 12 },
      { id: "dock_edge", label: "Dock edge drop", type: "dock_edge", xPct: 74, yPct: 64, wPct: 4, hPct: 20 },
      { id: "unstable_load", label: "Unstable load on platform", type: "unstable_load", xPct: 82, yPct: 56, wPct: 16, hPct: 12 },
      { id: "pedestrian", label: "Pedestrian zone", type: "pedestrian", xPct: 48, yPct: 88, wPct: 28, hPct: 10 }
    ]
  }
];
