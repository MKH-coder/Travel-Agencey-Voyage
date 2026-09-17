import { createClient } from '@supabase/supabase-js';

const url = 'https://iunwfdzefyvwcvalhdzv.supabase.co';
const key = 'sb_publishable_eb6-PYu0SLS5QlB4cBFMXg_a3UrtWNG';
const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from('feed_posts').select('*');
  console.log("DATA:", data);
  console.log("ERROR:", error);
}
run();
