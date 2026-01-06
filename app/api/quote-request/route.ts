import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { sendQuoteNotificationEmail, sendQuoteConfirmationEmail, type QuoteRequestEmailData } from '@/lib/email/resend';

interface QuoteRequestBody {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  partId?: string;
  partName: string;
  oemReference?: string;
  quantity?: number;
  machineModel?: string;
  machineBrand?: string;
  machineSerial?: string;
  notes?: string;
  urgency?: 'standard' | 'urgent' | 'emergency';
  source?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: QuoteRequestBody = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.partName) {
      return NextResponse.json(
        { error: 'Name, email, and part name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Get client IP and user agent for tracking
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || null;
    const userAgent = request.headers.get('user-agent') || null;

    // Insert into Supabase
    const supabase = supabaseServer();
    
    const { data, error } = await supabase
      .from('quote_requests')
      .insert({
        name: body.name,
        email: body.email.toLowerCase().trim(),
        company: body.company || null,
        phone: body.phone || null,
        part_id: body.partId || null,
        part_name: body.partName,
        oem_reference: body.oemReference || null,
        quantity: body.quantity || 1,
        machine_model: body.machineModel || null,
        machine_brand: body.machineBrand || null,
        machine_serial: body.machineSerial || null,
        notes: body.notes || null,
        urgency: body.urgency || 'standard',
        source: body.source || 'website',
        ip_address: ip,
        user_agent: userAgent,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to submit quote request. Please try again.' },
        { status: 500 }
      );
    }

    // Prepare email data
    const emailData: QuoteRequestEmailData = {
      requestId: data.id,
      customerName: body.name,
      customerEmail: body.email.toLowerCase().trim(),
      customerPhone: body.phone,
      company: body.company,
      partName: body.partName,
      oemReference: body.oemReference,
      quantity: body.quantity || 1,
      machineBrand: body.machineBrand,
      machineModel: body.machineModel,
      machineSerial: body.machineSerial,
      urgency: body.urgency || 'standard',
      notes: body.notes,
    };

    // Send emails in parallel (non-blocking - failures logged but don't break request)
    await Promise.allSettled([
      // High-priority notification to sales team
      sendQuoteNotificationEmail(emailData),
      // Professional confirmation to customer
      sendQuoteConfirmationEmail(emailData),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Quote request submitted successfully',
      requestId: data.id,
    });
  } catch (error) {
    console.error('Quote request error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve quote requests (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();
    
    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('quote_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching quote requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch quote requests' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in GET quote requests:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

