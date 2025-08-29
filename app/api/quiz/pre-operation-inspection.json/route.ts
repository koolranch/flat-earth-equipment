import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(){
  const questions = [
    { 
      type:'mcq', 
      id:'m1q1', 
      prompt:'Before operating, what should the forks be?', 
      options:[
        { id:'a', label:'Raised and tilted forward' },
        { id:'b', label:'Lowered to the floor', correct:true },
        { id:'c', label:'Any position is fine' }
      ]
    },
    { 
      type:'mcq', 
      id:'m1q2', 
      prompt:'Seat belt policy?', 
      options:[
        { id:'a', label:'Optional at low speed' },
        { id:'b', label:'Required whenever operating', correct:true },
        { id:'c', label:'Only for outdoor driving' }
      ]
    },
    { 
      type:'mcq', 
      id:'m1q3', 
      prompt:'A small hydraulic leak is…', 
      options:[
        { id:'a', label:'Okay if topped off' },
        { id:'b', label:'Stop-work: tag out and report', correct:true },
        { id:'c', label:'Ignore until the next service' }
      ]
    },
    { 
      type:'mcq', 
      id:'m1q4', 
      prompt:'Data plate is missing/illegible. You should…', 
      options:[
        { id:'a', label:'Proceed with caution' },
        { id:'b', label:'Operate only without a load' },
        { id:'c', label:'Do not operate until fixed', correct:true }
      ]
    },
    { 
      type:'mcq', 
      id:'m1q5', 
      prompt:'Correct pre-op order includes…', 
      options:[
        { id:'a', label:'Key on → drive' },
        { id:'b', label:'PPE on → brake set → forks down', correct:true },
        { id:'c', label:'Tilt back → horn → lift' }
      ]
    }
  ];
  
  return NextResponse.json({ questions });
}
