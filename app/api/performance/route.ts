/**
 * Performance Analytics API Route
 * Handles Core Web Vitals and performance data collection
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.name || typeof data.value !== 'number') {
      return NextResponse.json({ error: 'Invalid metric data' }, { status: 400 });
    }

    const supabase = supabaseServer();
    
    // Store performance data in Supabase
    const { error } = await supabase
      .from('performance_metrics')
      .insert({
        metric_name: data.name,
        value: data.value,
        rating: data.rating || 'unknown',
        url: data.url || '/',
        timestamp: new Date(data.timestamp || Date.now()).toISOString(),
        session_id: data.sessionId,
        user_agent: data.userAgent || request.headers.get('user-agent'),
        additional_data: {
          delta: data.delta,
          navigation_type: data.navigationType,
          connection_type: data.connectionType,
        }
      });

    if (error) {
      console.error('Performance metric storage error:', error);
      // Don't return error to client - fail silently for performance tracking
      return NextResponse.json({ status: 'received' }, { status: 200 });
    }

    // Optional: Send critical performance alerts
    if (shouldSendAlert(data)) {
      await sendPerformanceAlert(data);
    }

    return NextResponse.json({ status: 'recorded' }, { status: 200 });

  } catch (error) {
    console.error('Performance API error:', error);
    // Always return success for performance tracking to not impact user experience
    return NextResponse.json({ status: 'received' }, { status: 200 });
  }
}

/**
 * Determine if performance data warrants an alert
 */
function shouldSendAlert(data: any): boolean {
  // Send alerts for consistently poor metrics
  const alertThresholds = {
    LCP: 5000, // > 5 seconds
    FID: 500,  // > 500ms
    CLS: 0.5,  // > 0.5
    TTFB: 2000, // > 2 seconds
    PageLoad: 8000, // > 8 seconds
  };

  return data.value > alertThresholds[data.name as keyof typeof alertThresholds];
}

/**
 * Send performance alert (email, Slack, etc.)
 */
async function sendPerformanceAlert(data: any) {
  try {
    // For now, just log critical performance issues
    console.warn('PERFORMANCE ALERT:', {
      metric: data.name,
      value: data.value,
      url: data.url,
      rating: data.rating,
      timestamp: data.timestamp,
    });

    // TODO: Implement actual alerting (email, Slack webhook, etc.)
    // Example:
    // await sendSlackAlert(`🚨 Performance Alert: ${data.name} = ${data.value}ms on ${data.url}`);
    
  } catch (error) {
    console.error('Performance alert failed:', error);
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}