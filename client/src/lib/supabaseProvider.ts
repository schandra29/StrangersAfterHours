import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL: Missing Supabase URL or Anon Key in supabaseProvider.ts. Check your .env file.');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Key is set (hidden for security)' : 'Missing');
  // In a real app, you might throw an error here or have a fallback UI
}

// Initialize Supabase client with auth options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Test connection on import (optional, but good for immediate feedback)
if (supabaseUrl && supabaseAnonKey) { // Only test if creds were found
  supabase.from('prompts').select('count', { count: 'exact', head: true })
    .then(({ error, count }) => {
      if (error) {
        console.error('Supabase provider connection error:', error);
      } else {
        console.log('✅ Supabase provider connected successfully! Prompt count:', count);
      }
    });
}

export default supabase; // Keep default export for compatibility if anything uses it
