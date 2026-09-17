import { supabaseAdmin } from './server/supabase.ts';
async function test() {
  const { data, error } = await supabaseAdmin.from('custom_posts').select('*');
  console.log("DATA:", data);
  console.log("ERROR:", error);
}
test();
