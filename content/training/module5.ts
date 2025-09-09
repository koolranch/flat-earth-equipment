import type { Section } from '@/components/training/content/ModuleContent';
export const module5Sections: Section[] = [
  { kind:'objectives', items:['Leave truck safe','Charge / secure before walking away']},
  { kind:'icons', icons:[
    {src:'training/c4-step1-neutral.svg', alt:'Neutral', label:'Neutral'},
    {src:'training/c4-step2-steer.svg', alt:'Steer straight', label:'Steer straight'},
    {src:'training/c4-step3-brake.svg', alt:'Brake set', label:'Brake set'},
    {src:'training/c4-step4-forks.svg', alt:'Forks down', label:'Forks down'},
    {src:'training/c4-step5-key.svg', alt:'Key off', label:'Key off'},
    {src:'training/c4-step6-charge.svg', alt:'Connect charger', label:'Charger'},
    {src:'training/c4-step7-chock.svg', alt:'Wheel chock', label:'Chock'}
  ]},
  { kind:'media', src:'training/d3-forks.svg', alt:'Forks lower animation'},
  { kind:'media', src:'training/d4-charge.svg', alt:'Connect charger animation'},
  { kind:'media', src:'training/a3-charging.svg', alt:'Charging schematic'}
];
