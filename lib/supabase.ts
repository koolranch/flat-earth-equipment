import { createClient } from '@supabase/supabase-js';

// On the server we need the service role key for queries during prerender
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = (typeof window === "undefined")
  ? process.env.SERVICE_ROLE_KEY!          // server: use service role
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // client: still anon

// Create a single supabase client for interacting with your database
const supabase = createClient(url, key);

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
  const { data, error } = await supabase
    .from('parts')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching parts:', error);
    return [];
  }
  
  return data || [];
}

export async function getPartsByCategory(category: string): Promise<Part[]> {
  const { data, error } = await supabase
    .from('parts')
    .select('*')
    .eq('category', category)
    .order('name');
  
  if (error) {
    console.error(`Error fetching parts in category ${category}:`, error);
    return [];
  }
  
  return data || [];
}

export async function getPartBySlug(slug: string): Promise<Part | null> {
  const { data, error } = await supabase
    .from('parts')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error(`Error fetching part with slug ${slug}:`, error);
    return null;
  }
  
  return data;
}

export default supabase; 