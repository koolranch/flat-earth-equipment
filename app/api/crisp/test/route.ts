import { NextRequest, NextResponse } from 'next/server';
import { crisp } from '@/lib/crisp/client';

export async function GET(req: NextRequest) {
  try {
    const websiteID = process.env.CRISP_WEBSITE_ID!;
    const conversations = await crisp.website.listConversations(websiteID, 1);
    return NextResponse.json({ success: true, conversations });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
} 