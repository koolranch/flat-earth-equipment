import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName } = await req.json();
    
    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        { ok: false, error: 'First and last name are required' },
        { status: 400 }
      );
    }

    const sb = supabaseServer();
    
    // Get current user
    const { data: { user }, error: userError } = await sb.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    // Update profile
    const { error: profileError } = await sb
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: fullName,
        email: user.email
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return NextResponse.json(
        { ok: false, error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Update auth user metadata
    const { error: metadataError } = await sb.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          full_name: fullName
        }
      }
    );

    if (metadataError) {
      console.warn('Could not update user metadata:', metadataError);
      // Don't fail the request - profile update is sufficient
    }

    console.log(`✅ Updated name for ${user.email}: ${fullName}`);

    return NextResponse.json({ 
      ok: true,
      full_name: fullName
    });

  } catch (error) {
    console.error('Error in update-name API:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

