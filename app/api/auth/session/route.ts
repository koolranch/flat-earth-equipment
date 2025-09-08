import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { access_token, refresh_token } = await request.json();
    
    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: 'Missing tokens' }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });
    
    // Set the auth cookies that server APIs expect
    response.cookies.set('sb-access-token', access_token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    response.cookies.set('sb-refresh-token', refresh_token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set session' }, { status: 500 });
  }
}
