import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type Query = {
  brand: string;
  code?: string; // exact or partial
  q?: string;    // text search in title/meaning
  model?: string; // used to prefer retrieval steps
  severity?: 'info'|'warn'|'fault'|'stop';
  limit?: number;
  offset?: number;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getClient(){ return createClient(url, key); }

function parseParams(req: Request): Query {
  // Support both GET query params and POST JSON body
  const { method } = req;
  if (method === 'GET') {
    const u = new URL(req.url);
    const brand = u.searchParams.get('brand') || '';
    const code = u.searchParams.get('code') || undefined;
    const q = u.searchParams.get('q') || undefined;
    const model = u.searchParams.get('model') || undefined;
    const severity = (u.searchParams.get('severity') as any) || undefined;
    const limit = u.searchParams.get('limit') ? Number(u.searchParams.get('limit')) : 20;
    const offset = u.searchParams.get('offset') ? Number(u.searchParams.get('offset')) : 0;
    return { brand, code, q, model, severity, limit, offset };
  }
  // POST - will be merged with JSON body later
  return {} as any;
}

async function parseBody(req: Request, base: Query): Promise<Query> {
  if (req.method !== 'POST') return base;
  try {
    const body = await req.json();
    return { ...base, ...body };
  } catch { return base; }
}

async function fetchRetrievalMap(brand: string, model?: string) {
  const supabase = getClient();
  
  // Check if the table exists first
  const { data, error } = await supabase
    .from('fault_codes')  // Using existing table structure
    .select('*')
    .eq('brand_slug', brand)
    .limit(1);
    
  if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
    // Table doesn't exist yet
    return { generic: 'Check machine display for fault codes. Consult operator manual for retrieval steps.', specific: {} };
  }
  
  // For now, return generic guidance since svc tables aren't implemented yet
  let generic = 'Access fault codes through machine display. Check operator manual for specific retrieval procedures.';
  const specific: Record<string, string> = {};
  
  // If we had a model and specific patterns, we'd match here
  // For now, just return the generic guidance
  return { generic, specific };
}

async function searchFaultCodes(params: Query) {
  const { brand, code, q, model, severity, limit = 20, offset = 0 } = params;
  
  if (!brand) {
    throw new Error('Brand parameter is required');
  }
  
  const supabase = getClient();
  
  // Build the query
  let query = supabase
    .from('fault_codes')
    .select('*')
    .eq('brand_slug', brand);
  
  // Add filters
  if (code) {
    query = query.ilike('code', `%${code}%`);
  }
  
  if (q) {
    query = query.or(`description.ilike.%${q}%,solution.ilike.%${q}%`);
  }
  
  if (severity) {
    query = query.eq('severity', severity);
  }
  
  // Apply pagination
  query = query.range(offset, offset + limit - 1);
  
  // Order by code
  query = query.order('code');
  
  const { data, error } = await query;
  
  if (error) {
    // If table doesn't exist, return empty results
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      return [];
    }
    throw error;
  }
  
  return data || [];
}

export async function GET(req: Request) {
  try {
    const baseParams = parseParams(req);
    const params = await parseBody(req, baseParams);
    
    if (!params.brand) {
      return NextResponse.json({ 
        error: 'Brand parameter is required' 
      }, { status: 400 });
    }
    
    const [results, retrievalInfo] = await Promise.all([
      searchFaultCodes(params),
      fetchRetrievalMap(params.brand, params.model)
    ]);
    
    // Determine best retrieval steps
    let retrievalSteps = retrievalInfo.generic;
    if (params.model && retrievalInfo.specific[params.model]) {
      retrievalSteps = retrievalInfo.specific[params.model];
    }
    
    return NextResponse.json({
      results,
      total: results.length,
      brand: params.brand,
      model: params.model || null,
      retrievalSteps,
      pagination: {
        limit: params.limit || 20,
        offset: params.offset || 0
      }
    });
  } catch (error: any) {
    console.error('Fault code search error:', error);
    return NextResponse.json({ 
      error: error.message || 'Search failed' 
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const baseParams = parseParams(req);
    const params = await parseBody(req, baseParams);
    
    if (!params.brand) {
      return NextResponse.json({ 
        error: 'Brand parameter is required' 
      }, { status: 400 });
    }
    
    const [results, retrievalInfo] = await Promise.all([
      searchFaultCodes(params),
      fetchRetrievalMap(params.brand, params.model)
    ]);
    
    // Determine best retrieval steps
    let retrievalSteps = retrievalInfo.generic;
    if (params.model && retrievalInfo.specific[params.model]) {
      retrievalSteps = retrievalInfo.specific[params.model];
    }
    
    return NextResponse.json({
      results,
      total: results.length,
      brand: params.brand,
      model: params.model || null,
      retrievalSteps,
      pagination: {
        limit: params.limit || 20,
        offset: params.offset || 0
      }
    });
  } catch (error: any) {
    console.error('Fault code search error:', error);
    return NextResponse.json({ 
      error: error.message || 'Search failed' 
    }, { status: 500 });
  }
}