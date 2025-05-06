import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

// Log environment variables for debugging
console.log('Environment variables:');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set (hidden)' : 'Not set');
console.log('ANON KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Not set');

// Connect to Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Simple connection test
async function testConnection() {
  try {
    console.log('Testing connection...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Connection error:', error.message);
    } else {
      console.log('Connection successful!');
      console.log('Session data:', data);
    }
  } catch (e) {
    console.error('Unexpected error:', e.message);
  }
}

testConnection(); 