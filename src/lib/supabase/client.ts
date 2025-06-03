import { createClient, type SupabaseClient } from '@supabase/supabase-js';
// import type { Database } from './database.types'; // Uncomment if you have generated types

function getEnv(key: string): string | undefined {
  // Vite/Browser
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[`VITE_${key}`];
  }
  // Node.js
  if (typeof process !== 'undefined' && process.env) {
    return process.env[`VITE_${key}`];
  }
  return undefined;
}

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

console.log('[Supabase] SUPABASE_URL:', supabaseUrl ? supabaseUrl.slice(0, 20) + '...' : 'NOT SET');
console.log('[Supabase] SUPABASE_ANON_KEY:', supabaseAnonKey ? supabaseAnonKey.slice(0, 8) + '...' : 'NOT SET');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing Supabase environment variables.\nSUPABASE_URL: ${supabaseUrl}\nSUPABASE_ANON_KEY: ${supabaseAnonKey ? 'SET' : 'NOT SET'}`
  );
}

// If you have generated types from Supabase, use: createClient<Database>(...)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper functions
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Subscribe to auth state changes
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  
  return () => {
    subscription.unsubscribe();
  };
};
