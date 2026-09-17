import { supabaseAdmin } from './server/supabase.ts';
async function test() {
  const { data, error } = await supabaseAdmin.from('listings').select('*').limit(1);
  console.log("DATA:", data);
  console.log("ERROR:", error);
}
test();
