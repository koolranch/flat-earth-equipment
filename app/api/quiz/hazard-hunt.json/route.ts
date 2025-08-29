import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(){
  const questions = [
    { 
      type:'mcq', 
      id:'m4q1', 
      prompt:'At blind corners and doorways…', 
      options:[
        { id:'a', label:'Rely on mirrors only' },
        { id:'b', label:'Sound the horn and slow/stop', correct:true },
        { id:'c', label:'Speed up to get through faster' }
      ]
    },
    { 
      type:'mcq', 
      id:'m4q2', 
      prompt:'Pedestrians have right-of-way. Your action is…', 
      options:[
        { id:'a', label:'Proceed; forklifts own the aisle' },
        { id:'b', label:'Yield and maintain safe distance', correct:true },
        { id:'c', label:'Honk and continue at same speed' }
      ]
    },
    { 
      type:'mcq', 
      id:'m4q3', 
      prompt:'You spot a hydraulic leak on the floor. Best action?', 
      options:[
        { id:'a', label:'Keep working; report later' },
        { id:'b', label:'Stop-work, tag out, contain/clean', correct:true },
        { id:'c', label:'Drive around the spot' }
      ]
    },
    { 
      type:'mcq', 
      id:'m4q4', 
      prompt:'On ramps/grades with a load…', 
      options:[
        { id:'a', label:'Travel with load upgrade', correct:true },
        { id:'b', label:'Always downgrade' },
        { id:'c', label:'Direction does not matter' }
      ]
    },
    { 
      type:'mcq', 
      id:'m4q5', 
      prompt:'In a charging/battery area you should…', 
      options:[
        { id:'a', label:'Ignore PPE; it is quick' },
        { id:'b', label:'Use required PPE and ventilate', correct:true },
        { id:'c', label:'Smoke if away from the charger' }
      ]
    },
    { 
      type:'mcq', 
      id:'m4q6', 
      prompt:'Aisle is blocked by stacked pallets. You…', 
      options:[
        { id:'a', label:'Push through carefully' },
        { id:'b', label:'Stop and clear/route around safely', correct:true },
        { id:'c', label:'Use the horn and proceed' }
      ]
    }
  ];
  
  return NextResponse.json({ questions });
}
