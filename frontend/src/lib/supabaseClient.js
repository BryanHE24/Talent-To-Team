import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '[HireFlow] Missing Supabase env vars.\n' +
    'Create frontend/.env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

// Auth-only client (data fetching goes through the FastAPI backend)
export const supabase = createClient(
  supabaseUrl  ?? 'https://invalid.supabase.co',
  supabaseKey  ?? 'invalid',
);
