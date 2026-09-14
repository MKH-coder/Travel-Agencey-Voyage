import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase Project URL and Public API Key
const SUPABASE_URL = 'https://iunwfdzefyvwcvalhdzv.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'sb_publishable_eb6-PYu0SLS5QlB4cBFMXg_a3UrtWNG';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
