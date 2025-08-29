import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(){
  const questions = [
    { 
      type:'mcq', 
      id:'m3q1', 
      prompt:'As load center increases, rated capacity…', 
      options:[
        { id:'a', label:'Stays the same' },
        { id:'b', label:'Increases' },
        { id:'c', label:'Decreases', correct:true }
      ]
    },
    { 
      type:'mcq', 
      id:'m3q2', 
      prompt:'Traveling with a load, keep the load…', 
      options:[
        { id:'a', label:'High for visibility' },
        { id:'b', label:'Low with mast tilted back', correct:true },
        { id:'c', label:'Any height is fine' }
      ]
    },
    { 
      type:'mcq', 
      id:'m3q3', 
      prompt:'If view is blocked by the load…', 
      options:[
        { id:'a', label:'Drive forward anyway' },
        { id:'b', label:'Drive in reverse if safe or use a spotter', correct:true },
        { id:'c', label:'Honk and proceed' }
      ]
    },
    { 
      type:'mcq', 
      id:'m3q4', 
      prompt:'The stability triangle is about keeping the combined center of gravity…', 
      options:[
        { id:'a', label:'Outside the triangle' },
        { id:'b', label:'Inside the triangle', correct:true },
        { id:'c', label:'At the mast rollers' }
      ]
    },
    { 
      type:'mcq', 
      id:'m3q5', 
      prompt:'Rated capacity 3000 lb @ 24". At 30" you should expect capacity to…', 
      options:[
        { id:'a', label:'Drop below 3000 lb', correct:true },
        { id:'b', label:'Stay exactly 3000 lb' },
        { id:'c', label:'Increase' }
      ]
    },
    { 
      type:'mcq', 
      id:'m3q6', 
      prompt:'Before turning with a load…', 
      options:[
        { id:'a', label:'Raise load to clear all obstacles' },
        { id:'b', label:'Slow down, keep load low', correct:true },
        { id:'c', label:'Turn sharply to save time' }
      ]
    }
  ];
  
  return NextResponse.json({ questions });
}
