import { createClient } from '@supabase/supabase-js';

/**
 * Generate the next sequential FEE-RC-XXX part number
 * @param prefix - Part number prefix (default: 'FEE-RC')
 * @param supabaseUrl - Supabase URL
 * @param supabaseKey - Supabase service role key
 * @returns Next sequential part number (e.g., 'FEE-RC-001')
 */
export async function generatePartNumber(
  prefix: string = 'FEE-RC',
  supabaseUrl?: string,
  supabaseKey?: string
): Promise<string> {
  // Use provided credentials or fall back to environment variables
  const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase credentials not found');
  }
  
  const supabase = createClient(url, key);
  
  // Query for the highest existing part number with this prefix
  const { data, error } = await supabase
    .from('parts')
    .select('sku')
    .like('sku', `${prefix}-%`)
    .order('sku', { ascending: false })
    .limit(1);
  
  if (error) {
    throw new Error(`Failed to query existing part numbers: ${error.message}`);
  }
  
  let nextNumber = 1;
  
  if (data && data.length > 0) {
    // Extract the numeric portion from the last part number
    const lastSku = data[0].sku;
    const match = lastSku.match(new RegExp(`${prefix}-(\\d+)$`));
    
    if (match && match[1]) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }
  
  // Format with zero-padding (3 digits)
  const formattedNumber = nextNumber.toString().padStart(3, '0');
  
  return `${prefix}-${formattedNumber}`;
}

/**
 * Generate multiple sequential part numbers
 * @param count - Number of part numbers to generate
 * @param prefix - Part number prefix (default: 'FEE-RC')
 * @param supabaseUrl - Supabase URL
 * @param supabaseKey - Supabase service role key
 * @returns Array of sequential part numbers
 */
export async function generatePartNumbers(
  count: number,
  prefix: string = 'FEE-RC',
  supabaseUrl?: string,
  supabaseKey?: string
): Promise<string[]> {
  const firstPartNumber = await generatePartNumber(prefix, supabaseUrl, supabaseKey);
  const startNumber = parseInt(firstPartNumber.split('-').pop() || '1', 10);
  
  const partNumbers: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const number = (startNumber + i).toString().padStart(3, '0');
    partNumbers.push(`${prefix}-${number}`);
  }
  
  return partNumbers;
}

