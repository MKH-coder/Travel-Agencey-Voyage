import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

let supabaseUrl = process.env.SUPABASE_URL || 'https://iunwfdzefyvwcvalhdzv.supabase.co';
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl}.supabase.co`;
}
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_eb6-PYu0SLS5QlB4cBFMXg_a3UrtWNG';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("URL:", supabaseUrl);
  console.log("KEY START:", supabaseKey.substring(0, 10));
  const { data, error } = await supabaseAdmin.from('feed_posts').select('*');
  console.log("DATA:", data);
  console.log("ERROR:", error);
}
test();
