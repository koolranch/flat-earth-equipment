import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(){
  // NOTE: hotspot-grid uses a simple 2x2 logical grid (A B / C D). Provide a short scene label.
  const items = [
    { 
      type:'mcq', 
      id:'fx1', 
      prompt:'At blind corners and doorways, your best action is…', 
      options:[
        { id:'a', label:'Rely on mirrors only' },
        { id:'b', label:'Sound the horn and slow/stop', correct:true },
        { id:'c', label:'Speed up to clear the area' }
      ]
    },
    { 
      type:'mcq', 
      id:'fx2', 
      prompt:'Seat belt policy while operating a forklift is…', 
      options:[
        { id:'a', label:'Optional at low speed' },
        { id:'b', label:'Required whenever operating', correct:true },
        { id:'c', label:'Only outdoors' }
      ]
    },
    { 
      type:'mcq', 
      id:'fx3', 
      prompt:'Traveling with a load, keep the load…', 
      options:[
        { id:'a', label:'High for visibility' },
        { id:'b', label:'Low with mast tilted back', correct:true },
        { id:'c', label:'Any height is fine' }
      ]
    },

    // Numeric capacity reasoning (rated 3000 @ 24")
    { 
      type:'numeric', 
      id:'fx4', 
      prompt:'Rated capacity is 3000 lb @ 24". Approx capacity at 30" load center?', 
      answer:2400, 
      tolerance:100, 
      unit:'lb' 
    },
    { 
      type:'numeric', 
      id:'fx5', 
      prompt:'Rated 3000 lb @ 24". Approx capacity at 36" load center?', 
      answer:2000, 
      tolerance:120, 
      unit:'lb' 
    },

    // Hotspot grid — choose the safe zone.
    { 
      type:'hotspot-grid', 
      id:'fx6', 
      prompt:'Intersection scene: choose the safest pedestrian waiting zone.', 
      scene:'Aisle intersection', 
      grid:{cells:['A','B','C','D'], correct:'B'} 
    },

    { 
      type:'mcq', 
      id:'fx7', 
      prompt:'You see a hydraulic leak. Best action?', 
      options:[
        { id:'a', label:'Keep working; report later' },
        { id:'b', label:'Stop-work, tag out, and contain/clean', correct:true },
        { id:'c', label:'Drive around the spot' }
      ]
    },
    { 
      type:'mcq', 
      id:'fx8', 
      prompt:'On ramps/grades with a load you should…', 
      options:[
        { id:'a', label:'Travel with load downgrade' },
        { id:'b', label:'Travel with load upgrade', correct:true },
        { id:'c', label:'Direction does not matter' }
      ]
    },

    { 
      type:'hotspot-grid', 
      id:'fx9', 
      prompt:'Doorway approach: stop at the safest staging area before entry.', 
      scene:'Door threshold', 
      grid:{cells:['A','B','C','D'], correct:'C'} 
    },

    { 
      type:'mcq', 
      id:'fx10', 
      prompt:'Data plate is missing/illegible. You should…', 
      options:[
        { id:'a', label:'Operate only without a load' },
        { id:'b', label:'Do not operate until fixed', correct:true },
        { id:'c', label:'Proceed with caution' }
      ]
    },
    { 
      type:'mcq', 
      id:'fx11', 
      prompt:'When parked, forks should be…', 
      options:[
        { id:'a', label:'Raised slightly' },
        { id:'b', label:'Fully lowered to the floor', correct:true },
        { id:'c', label:'Any position is fine' }
      ]
    },
    { 
      type:'mcq', 
      id:'fx12', 
      prompt:'For LPG trucks during shutdown you must…', 
      options:[
        { id:'a', label:'Leave valve open for next shift' },
        { id:'b', label:'Close the LPG tank valve', correct:true },
        { id:'c', label:'Remove the tank' }
      ]
    }
  ];
  
  return NextResponse.json({ passPct: 0.8, items });
}
