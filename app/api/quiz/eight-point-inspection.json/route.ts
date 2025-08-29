import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(){
  const questions = [
    { 
      type:'mcq', 
      id:'m2q1', 
      prompt:'If you find a fluid leak during inspection…', 
      options:[
        { id:'a', label:'Wipe it and continue' },
        { id:'b', label:'Log it and operate later' },
        { id:'c', label:'Stop and tag the truck', correct:true }
      ]
    },
    { 
      type:'mcq', 
      id:'m2q2', 
      prompt:'Securement check includes…', 
      options:[
        { id:'a', label:'Loose LP tank is acceptable' },
        { id:'b', label:'Battery/LP fastened and connections tight', correct:true },
        { id:'c', label:'Only check at the end of the shift' }
      ]
    },
    { 
      type:'mcq', 
      id:'m2q3', 
      prompt:'Controls and horn should be checked…', 
      options:[
        { id:'a', label:'Only if there was a recent issue' },
        { id:'b', label:'Every shift, during inspection', correct:true },
        { id:'c', label:'Only outdoors' }
      ]
    },
    { 
      type:'mcq', 
      id:'m2q4', 
      prompt:'Forks are cracked/worn. You…', 
      options:[
        { id:'a', label:'Use them gently' },
        { id:'b', label:'Report and remove from service', correct:true },
        { id:'c', label:'Flip them upside down' }
      ]
    },
    { 
      type:'mcq', 
      id:'m2q5', 
      prompt:'Tires show major damage. Best action?', 
      options:[
        { id:'a', label:'Reduce speed and continue' },
        { id:'b', label:'Replace or service before use', correct:true },
        { id:'c', label:'Only drive in straight lines' }
      ]
    }
  ];
  
  return NextResponse.json({ questions });
}
