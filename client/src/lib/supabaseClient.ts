// src/lib/supabaseClient.ts

// Import the single, centrally initialized Supabase client instance
import { supabase as supabaseInstance } from './supabaseProvider';

// Re-export it. Any files importing 'supabase' from 'supabaseClient.ts' 
// will now receive the single instance from 'supabaseProvider.ts'.
export const supabase = supabaseInstance;

// Note: The original environment variable checks, client creation,
// auth options, and connection test have been removed from this file.
// All that logic is now centralized in 'supabaseProvider.ts'.
