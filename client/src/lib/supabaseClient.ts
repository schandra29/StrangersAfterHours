// Bridge to the main supabase client
import { supabase } from '../../../src/lib/supabaseClient';

// Re-export for use in the client components
export { supabase };

// Test connection on import
supabase.from('prompts').select('count').then(({ data, error }) => {
  if (error) {
    console.error('Bridge client connection error:', error);
  } else {
    console.log('✅ Bridge client connected successfully!', data);
  }
});
