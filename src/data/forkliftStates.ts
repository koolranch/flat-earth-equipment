import { getDefaultStateFines, type StateOshaFines } from '@/lib/safety/osha-penalties';

export interface ForkliftStateInfo {
  code: string;
  name: string;
  fines: StateOshaFines;
  hasStatePlan: boolean;
}

const FINES = getDefaultStateFines();

function state(code: string, name: string, hasStatePlan: boolean): ForkliftStateInfo {
  return { code, name, fines: FINES, hasStatePlan };
}

export const forkliftStates: ForkliftStateInfo[] = [
  state('al', 'Alabama', false),
  state('ak', 'Alaska', true),
  state('az', 'Arizona', true),
  state('ar', 'Arkansas', false),
  state('ca', 'California', true),
  state('co', 'Colorado', false),
  state('ct', 'Connecticut', false),
  state('de', 'Delaware', false),
  state('fl', 'Florida', false),
  state('ga', 'Georgia', false),
  state('hi', 'Hawaii', true),
  state('id', 'Idaho', false),
  state('il', 'Illinois', false),
  state('in', 'Indiana', false),
  state('ia', 'Iowa', false),
  state('ks', 'Kansas', false),
  state('ky', 'Kentucky', false),
  state('la', 'Louisiana', false),
  state('me', 'Maine', false),
  state('md', 'Maryland', false),
  state('ma', 'Massachusetts', false),
  state('mi', 'Michigan', false),
  state('mn', 'Minnesota', true),
  state('ms', 'Mississippi', false),
  state('mo', 'Missouri', false),
  state('mt', 'Montana', false),
  state('ne', 'Nebraska', false),
  state('nv', 'Nevada', true),
  state('nh', 'New Hampshire', false),
  state('nj', 'New Jersey', false),
  state('nm', 'New Mexico', false),
  state('ny', 'New York', false),
  state('nc', 'North Carolina', false),
  state('nd', 'North Dakota', false),
  state('oh', 'Ohio', false),
  state('ok', 'Oklahoma', false),
  state('or', 'Oregon', true),
  state('pa', 'Pennsylvania', false),
  state('ri', 'Rhode Island', false),
  state('sc', 'South Carolina', false),
  state('sd', 'South Dakota', false),
  state('tn', 'Tennessee', false),
  state('tx', 'Texas', false),
  state('ut', 'Utah', false),
  state('vt', 'Vermont', false),
  state('va', 'Virginia', false),
  state('wa', 'Washington', true),
  state('wv', 'West Virginia', false),
  state('wi', 'Wisconsin', false),
  state('wy', 'Wyoming', false),
];
