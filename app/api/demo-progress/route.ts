import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { kind, slug, demoId, status } = await req.json();
    
    // For now, this is just a lightweight endpoint that acknowledges demo completion
    // In the future, this could be extended to track demo-level progress
    console.log('Demo progress logged:', { kind, slug, demoId, status, timestamp: new Date().toISOString() });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Demo progress logged',
      data: { kind, slug, demoId, status }
    });
  } catch (error) {
    console.error('Demo progress error:', error);
    return NextResponse.json({ error: 'Failed to log demo progress' }, { status: 500 });
  }
}
