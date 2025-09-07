export default {
  title: 'Hazard Hunt',
  scenes: {
    bay: 'Warehouse Bay',
    corner: 'Blind Corner',
    ramp: 'Dock & Ramp'
  },
  hazards: {
    spill: 'Spill / Leak',
    pedestrian: 'Pedestrian Zone',
    overhead: 'Overhead Obstruction',
    unstable: 'Unstable Load',
    speed: 'Speed Zone',
    blindCorner: 'Blind Corner',
    rampSlope: 'Ramp / Slope',
    dockEdge: 'Dock Edge'
  }
} as const;
