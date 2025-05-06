import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function detectTables() {
  try {
    // Common table names that might exist
    const tables = [
      'part', 'parts', 
      'product', 'products',
      'equipment', 'equipment_parts',
      'equipment_part', 'inventory',
      'cart_parts', 'cart_part',
      'golf_cart_part', 'golf_cart_parts'
    ];
    
    console.log('Checking for common table names...');
    
    for (const table of tables) {
      console.log(`\nTrying table: ${table}`);
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          if (error.code === '42P01') {
            console.log(`Table '${table}' does not exist.`);
          } else {
            console.log(`Error with table '${table}':`, error.message);
          }
        } else {
          console.log(`✅ Found table '${table}' with ${count} rows!`);
          
          // If we found a table, try to get schema info
          const { data, error: schemaError } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          if (!schemaError && data && data.length > 0) {
            console.log(`Table '${table}' columns:`, Object.keys(data[0]));
            
            // Fetch sample rows if we have data
            const { data: sampleData, error: sampleError } = await supabase
              .from(table)
              .select('*')
              .limit(3);
            
            if (!sampleError && sampleData && sampleData.length > 0) {
              console.log(`\nSample data from '${table}' (${sampleData.length} rows):`);
              sampleData.forEach((row, i) => {
                console.log(`Row ${i+1}:`, JSON.stringify(row, null, 2));
              });
            }
          }
        }
      } catch (e) {
        console.log(`Error checking table '${table}':`, e.message);
      }
    }
  } catch (e) {
    console.error('Unexpected error:', e.message);
  }
}

detectTables(); 