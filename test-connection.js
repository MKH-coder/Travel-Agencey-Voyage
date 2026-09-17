import { supabaseAdmin } from './server/supabase.ts';

async function check() {
  console.log('Testing connection to Supabase...');
  try {
    const res = await supabaseAdmin.from('feed_posts').select('*').limit(1);
    console.log('feed_posts query result:', res);
  } catch (err) {
    console.error('feed_posts query error:', err);
  }

  try {
    const res2 = await supabaseAdmin.from('listings').select('*').limit(1);
    console.log('listings query result:', res2);
  } catch (err) {
    console.error('listings query error:', err);
  }
}

check();
