import { createRoot } from "react-dom/client";
import { createContext } from 'react';
import App from "./App";
import "./index.css";

// Import the single, centrally initialized Supabase client instance
import { supabase } from '@/lib/supabaseProvider'; 
// We also need the type for the context
import type { SupabaseClient } from '@supabase/supabase-js';

// Create a properly typed Supabase context for use throughout the app
export const SupabaseContext = createContext<SupabaseClient | undefined>(undefined);

// The Supabase client is now initialized in supabaseProvider.ts.
// It includes environment variable checks, auth options, and a connection test log.

// We can log here to confirm main.tsx is using the imported client (optional)
if (supabase) {
  console.log('main.tsx is using the Supabase client from supabaseProvider.');
} else {
  console.error('main.tsx: Supabase client from supabaseProvider is undefined!');
}

// React Query client is imported from ./lib/queryClient (if used, ensure it also uses the single supabase instance)

// Render the app
createRoot(document.getElementById("root")!).render(
  <SupabaseContext.Provider value={supabase}>
    <App />
  </SupabaseContext.Provider>
);
