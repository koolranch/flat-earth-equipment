import { NextResponse } from 'next/server';
export async function POST(req: Request){
  try{ const body = await req.json(); /* TODO: hook to real DB if desired */ return NextResponse.json({ok:true, saved: body}); }
  catch(e){ return NextResponse.json({ok:false}, {status:500}); }
}
