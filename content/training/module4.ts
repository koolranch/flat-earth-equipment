import type { Section } from '@/components/training/content/ModuleContent';
export const module4Sections: Section[] = [
  { kind:'objectives', items:['Spot hazards before they bite','Use horn/visibility; control speed']},
  { kind:'media', src:'training/b1-bay.svg', alt:'Bay scene – hazards'},
  { kind:'media', src:'training/b2-corner.svg', alt:'Blind corner scene – hazards'},
  { kind:'media', src:'training/b3-dock.svg', alt:'Ramp/dock scene – hazards'},
  { kind:'icons', icons:[
    {src:'training/c2-spill.svg', alt:'Spill', label:'Spill'},
    {src:'training/c2-pedestrian.svg', alt:'Pedestrian', label:'Pedestrian'},
    {src:'training/c2-overhead.svg', alt:'Overhead', label:'Overhead'},
    {src:'training/c2-unstable.svg', alt:'Unstable load', label:'Unstable load'},
    {src:'training/c2-corner.svg', alt:'Blind corner', label:'Blind corner'},
    {src:'training/c2-speed.svg', alt:'Speed', label:'Speed zone'},
    {src:'training/c2-ramp.svg', alt:'Ramp', label:'Ramp'},
    {src:'training/c2-dock.svg', alt:'Dock edge', label:'Dock edge'},
    {src:'training/c2-battery.svg', alt:'Battery', label:'Battery area'}
  ]}
];
