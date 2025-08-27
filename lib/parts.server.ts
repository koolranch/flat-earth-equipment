// lib/parts.server.ts
import 'server-only';
import { supabaseServer } from '@/lib/supabase/server';

export interface Part {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  brand: string | null;
  created_at: string;
}

export async function getAllParts(): Promise<Part[]> {
  const supabase = supabaseServer();
  const { data, error } = await supabase.from('parts').select('*').order('name');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPartsByCategory(category: string): Promise<Part[]> {
  const supabase = supabaseServer();
  const { data, error } = await supabase.from('parts').select('*').eq('category', category).order('name');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPartBySlug(slug: string): Promise<Part | null> {
  const supabase = supabaseServer();
  const { data, error } = await supabase.from('parts').select('*').eq('slug', slug).maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? null;
}
