import type { Section } from '@/components/training/content/ModuleContent';
export const module3Sections: Section[] = [
  { kind:'objectives', items:['Keep COG inside triangle','Respect load center and mast tilt']},
  { kind:'media', src:'training/a2-triangle.svg', alt:'Stability triangle diagram', caption:'Two front tire contact points + rear axle pivot'},
  { kind:'media', src:'training/d5-cog.svg', alt:'COG shift animation', caption:'How combined center shifts with load/tilt'},
  { kind:'tips', items:[{label:'Load center', body:'24 in / 600 mm unless rated otherwise'},{label:'Tilt back', body:'Travel with mast slightly back and forks low'}]}
];
