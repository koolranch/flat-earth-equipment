import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { sendMail } from '@/lib/email/mailer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const sb = supabaseServer();
    const { data: { user } } = await sb.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { enrollment_id, trainee_user_id, supervisor_email, supervisor_name, company } = body;

    if (!enrollment_id || !supervisor_email || !supervisor_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const svc = supabaseService();

    // Get trainee info
    const { data: profile } = await svc
      .from('profiles')
      .select('full_name, email')
      .eq('id', trainee_user_id)
      .maybeSingle();

    const traineeName = profile?.full_name || profile?.email || 'the trainee';

    // Store supervisor lead in database for marketing
    try {
      await svc
        .from('supervisor_leads')
        .insert({
          supervisor_email,
          supervisor_name,
          company,
          trainee_user_id,
          enrollment_id,
          source: 'practical_invite',
          invited_at: new Date().toISOString()
        });
    } catch (leadError) {
      // Non-blocking - continue even if lead storage fails
      console.warn('[practical/invite] Failed to store supervisor lead:', leadError);
    }

    // Generate evaluation link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://flatearthequipment.com';
    const evalLink = `${baseUrl}/practical/${enrollment_id}/start`;

    // Send email to supervisor
    const emailSubject = `Practical Evaluation Request from ${traineeName}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #F76511; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Flat Earth Safety Training</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #0F172A; margin-bottom: 16px;">Forklift Operator Practical Evaluation</h2>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Hello${supervisor_name ? ' ' + supervisor_name : ''},
          </p>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            <strong>${traineeName}</strong> has completed their forklift operator written training${company ? ' at ' + company : ''} and needs you to complete their hands-on practical evaluation.
          </p>
          
          <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 16px; margin: 24px 0;">
            <p style="color: #1E40AF; font-weight: 600; margin: 0 0 8px 0;">OSHA Requirement (29 CFR 1910.178)</p>
            <p style="color: #1E3A8A; margin: 0; font-size: 14px;">
              As a qualified person, you must evaluate the operator's ability to safely operate a forklift in your workplace before they can work independently.
            </p>
          </div>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 24px;">
            The evaluation takes approximately 15-20 minutes and includes:
          </p>
          
          <ul style="color: #475569; line-height: 1.8; margin-bottom: 24px;">
            <li>Pre-operation inspection (visual check)</li>
            <li>Safe startup and shutdown procedures</li>
            <li>Load handling and maneuvering</li>
            <li>Awareness of site-specific hazards</li>
          </ul>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${evalLink}" 
               style="display: inline-block; background: #F76511; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Complete Evaluation →
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 13px; margin-top: 24px;">
            This link is unique to this evaluation. If you have questions, contact us at support@flatearthequipment.com
          </p>
        </div>
        
        <div style="background: #0F172A; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            © 2025 Flat Earth Equipment | flatearthequipment.com
          </p>
        </div>
      </div>
    `;

    await sendMail({
      to: supervisor_email,
      subject: emailSubject,
      html: emailHtml
    });

    console.log('[practical/invite] Sent evaluation invite to:', supervisor_email);

    return NextResponse.json({ 
      ok: true, 
      message: 'Invite sent successfully',
      supervisor_email 
    });

  } catch (error: any) {
    console.error('[practical/invite] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to send invite', 
      details: error.message 
    }, { status: 500 });
  }
}

