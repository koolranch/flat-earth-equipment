import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export interface Brand {
  id: number;
  slug: string;
  name: string;
  logo_url?: string;
  description?: string;
  equipment_types?: string[];
  has_serial_lookup: boolean;
  has_fault_codes: boolean;
  website_url?: string;
}

export async function getBrand(slug: string): Promise<Brand | null> {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch brand:', error);
    return null;
  }
}

export async function getAllBrands(): Promise<Brand[]> {
  try {
    const { data: brands } = await supabase
      .from('brands')
      .select('*')
      .order('name');

    return brands || [];
  } catch (error) {
    console.error('Failed to fetch brands:', error);
    return [];
  }
}