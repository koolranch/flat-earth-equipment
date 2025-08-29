import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(){
  const questions = [
    { 
      type:'mcq', 
      id:'m5q1', 
      prompt:'First step when parking the truck?', 
      options:[
        { id:'a', label:'Turn key off' },
        { id:'b', label:'Shift to neutral', correct:true },
        { id:'c', label:'Raise forks to keep them clean' }
      ]
    },
    { 
      type:'mcq', 
      id:'m5q2', 
      prompt:'Fork position when parked?', 
      options:[
        { id:'a', label:'Raised slightly' },
        { id:'b', label:'Fully lowered to the floor', correct:true },
        { id:'c', label:'Any height is acceptable' }
      ]
    },
    { 
      type:'mcq', 
      id:'m5q3', 
      prompt:'For LPG trucks during shutdown you must…', 
      options:[
        { id:'a', label:'Leave valve open for next shift' },
        { id:'b', label:'Close the LPG tank valve', correct:true },
        { id:'c', label:'Remove the tank' }
      ]
    },
    { 
      type:'mcq', 
      id:'m5q4', 
      prompt:'For electrics, after key off you should…', 
      options:[
        { id:'a', label:'Let battery drain to zero' },
        { id:'b', label:'Plug in the charger', correct:true },
        { id:'c', label:'Do nothing' }
      ]
    },
    { 
      type:'mcq', 
      id:'m5q5', 
      prompt:'Parking location should be…', 
      options:[
        { id:'a', label:'Anywhere with space' },
        { id:'b', label:'Out of traffic and doorways', correct:true },
        { id:'c', label:'Next to emergency exits' }
      ]
    },
    { 
      type:'mcq', 
      id:'m5q6', 
      prompt:'Wheel chocks are used…', 
      options:[
        { id:'a', label:'Only outdoors' },
        { id:'b', label:'When required by site/grade', correct:true },
        { id:'c', label:'Never on electrics' }
      ]
    }
  ];
  
  return NextResponse.json({ questions });
}
