import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient"; // Import the shared client
import { createClient } from '@supabase/supabase-js';
import { SupabaseProvider } from '@supabase/auth-helpers-react';
import App from "./App";
import "./index.css";

// Initialize Supabase client
// Try both Vite-style and Node-style environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://vrgvoyjvpdqqtednoqru.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyZ3ZveWp2cGRxcXRlZG5vcXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NzgyNDQsImV4cCI6MjA2NDM1NDI0NH0.-YbnEYmVKdlQVA2alcXuUxtW4sx__7GiKXfVWhfP8UE";

// Always log what we're using (for debugging)
console.log('Using Supabase URL:', supabaseUrl);
console.log('Using Supabase Anon Key:', supabaseAnonKey ? 'Key is set (hidden for security)' : 'MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key. Check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Test connection on load
supabase.from('prompts').select('count').then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error);
  } else {
    console.log('✅ Supabase connected successfully!', data);
  }
});

// React Query client is imported from ./lib/queryClient

// Render the app
createRoot(document.getElementById("root")!).render(
  <SupabaseProvider supabaseClient={supabase}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </SupabaseProvider>
);
