export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';

function clean(s: string) { return (s || '').trim(); }

function fuzzyMatch(input: string, patterns: string[]): string[] {
  const inputUpper = input.toUpperCase();
  const matches: string[] = [];
  
  for (const pattern of patterns) {
    const patternUpper = pattern.toUpperCase();
    // Exact match
    if (patternUpper === inputUpper) {
      matches.unshift(pattern); // Add to front
      continue;
    }
    // Contains match
    if (patternUpper.includes(inputUpper) || inputUpper.includes(patternUpper)) {
      matches.push(pattern);
      continue;
    }
    // Model code parts match (e.g., "BD 50" matches "BD 50/50 C Bp Classic")
    const inputParts = inputUpper.split(/[\s\/\-]+/);
    const patternParts = patternUpper.split(/[\s\/\-]+/);
    if (inputParts.every(part => patternParts.some(pPart => pPart.includes(part)))) {
      matches.push(pattern);
    }
  }
  
  return [...new Set(matches)]; // Remove duplicates while preserving order
}

export async function POST(req: Request) {
  try {
    const { model } = await req.json();
    
    if (!model) {
      return NextResponse.json({ error: 'Model is required' }, { status: 400 });
    }

    const db = supabaseService();
    
    // Get all plate locations and patterns
    const [plateLocationsResult, serialPatternsResult] = await Promise.all([
      db.from('karcher_plate_locations').select('*'),
      db.from('karcher_serial_patterns').select('*')
    ]);

    if (plateLocationsResult.error) {
      console.error('Error fetching plate locations:', plateLocationsResult.error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (serialPatternsResult.error) {
      console.error('Error fetching serial patterns:', serialPatternsResult.error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const plateLocations = plateLocationsResult.data || [];
    const serialPatterns = serialPatternsResult.data || [];

    // Fuzzy match model to plate locations
    const modelPatterns = plateLocations.map(p => p.model_pattern);
    const matchedPatterns = fuzzyMatch(clean(model), modelPatterns);
    
    const matchedPlateLocations = plateLocations.filter(p => 
      matchedPatterns.includes(p.model_pattern)
    );

    // Sort by confidence (high > medium > verify)
    const confidenceOrder = { 'high': 3, 'medium': 2, 'verify': 1 };
    matchedPlateLocations.sort((a, b) => {
      const aConf = confidenceOrder[a.confidence as keyof typeof confidenceOrder] || 0;
      const bConf = confidenceOrder[b.confidence as keyof typeof confidenceOrder] || 0;
      return bConf - aConf;
    });

    const tips = matchedPlateLocations.length > 0 ? {
      plateLocation: matchedPlateLocations[0].location_text,
      confidence: matchedPlateLocations[0].confidence,
      sourceUrl: matchedPlateLocations[0].source_url,
      sourceQuote: matchedPlateLocations[0].source_quote,
      allMatches: matchedPlateLocations
    } : null;

    const disclaimer = "Kärcher positions the type plate on different areas depending on model and configuration. Where we cite a manual, the location is confirmed for that model. Otherwise, use the on-unit inspection steps and your Operator's Manual 'Machine Data' page to confirm.";

    return NextResponse.json({
      input: { model: clean(model) },
      tips,
      serialPatternHints: serialPatterns,
      disclaimer
    });

  } catch (e: any) {
    console.error('API error:', e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
