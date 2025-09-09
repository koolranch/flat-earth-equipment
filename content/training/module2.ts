import type { Section } from '@/components/training/content/ModuleContent';
export const module2Sections: Section[] = [
  { kind:'objectives', items:[
    'Complete the 8-point inspection', 'Report defects before operating'
  ]},
  { kind:'icons', icons:[
    {src:'training/c5-tires.svg', alt:'Tires', label:'Tires'},
    {src:'training/c5-forks.svg', alt:'Forks', label:'Forks'},
    {src:'training/c5-chains.svg', alt:'Chains', label:'Chains'},
    {src:'training/c5-horn.svg', alt:'Horn', label:'Horn'},
    {src:'training/c5-lights.svg', alt:'Lights', label:'Lights'},
    {src:'training/c5-hydraulics.svg', alt:'Hydraulics', label:'Hydraulics'},
    {src:'training/c5-leaks.svg', alt:'Leaks', label:'Leaks'},
    {src:'training/c5-plate.svg', alt:'Data plate', label:'Data plate'}
  ]},
  { kind:'osha', title:'OSHA 1910.178(q)(7)', body:'Industrial trucks must be examined before being placed in service; unsafe units shall be removed from service.'}
];
