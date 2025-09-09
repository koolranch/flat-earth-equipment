import type { Section } from '@/components/training/content/ModuleContent';

export const module1Sections: Section[] = [
  { kind:'objectives', items:[
    'Wear required PPE; belt on before moving',
    'Set parking brake during pre-start/setup',
    'Know basic controls: horn, lights, ignition'
  ]},
  { kind:'icons', icons:[
    {src:'training/c1-ppe-vest.svg', alt:'Hi-vis vest', label:'Vest'},
    {src:'training/c1-ppe-hardhat.svg', alt:'Hard hat', label:'Hard hat'},
    {src:'training/c1-ppe-goggles.svg', alt:'Eye protection', label:'Eye protection'}
  ]},
  { kind:'media', src:'training/d1-seatbelt.svg', alt:'Seatbelt latch micro animation', caption:'Always belt in before moving'},
  { kind:'media', src:'training/d2-brake.svg', alt:'Parking brake set animation', caption:'Brake set during pre-start'},
  { kind:'media', src:'training/a1-controls.svg', alt:'Forklift controls diagram', caption:'Learn your horn/lights/ignition locations'},
  { kind:'osha', title:'OSHA 1910.178 — General Requirements', body:'Operate only if trained/authorized. Inspect and set up safely before travel; use seat belts where provided.'},
  { kind:'tips', items:[
    {label:'Horn check', body:'Tap horn before first move; confirm it sounds.'},
    {label:'Lights', body:'Flip lights on in low visibility.'}
  ]}
];
