import { createClient } from '@supabase/supabase-js';

let supabaseUrl = process.env.SUPABASE_URL || 'https://iunwfdzefyvwcvalhdzv.supabase.co';
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl}.supabase.co`;
}

// Fallback to the publishable key if the env var is mistakenly set to the project ID or missing
let supabaseKey = process.env.SUPABASE_SECRET_KEY;
if (!supabaseKey || supabaseKey.length < 25) {
  supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
}
if (!supabaseKey || supabaseKey.length < 25) {
  supabaseKey = 'sb_publishable_eb6-PYu0SLS5QlB4cBFMXg_a3UrtWNG';
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
