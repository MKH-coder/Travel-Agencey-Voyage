import { createClient } from '@supabase/supabase-js';

// Use VITE_ prefix for client-side environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://iunwfdzefyvwcvalhdzv.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_eb6-PYu0SLS5QlB4cBFMXg_a3UrtWNG';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
