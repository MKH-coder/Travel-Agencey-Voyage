import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const SUPABASE_URL = rawUrl && rawUrl.trim() ? rawUrl.trim() : 'https://local.example.supabase.co';
const SUPABASE_ANON_KEY = rawKey && rawKey.trim() ? rawKey.trim() : 'local-dev-key';

const noopResult = Promise.resolve({ data: [], error: null });

const buildNoopQuery = () => {
  const chain = {
    select: () => chain,
    order: () => noopResult,
    limit: () => noopResult,
    eq: () => chain,
    insert: () => noopResult,
    update: () => noopResult,
    upsert: () => noopResult,
    delete: () => ({
      eq: () => noopResult,
    }),
    then: noopResult.then.bind(noopResult),
    catch: noopResult.catch.bind(noopResult),
    finally: noopResult.finally.bind(noopResult),
  };
  return chain;
};

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

client.from = () => buildNoopQuery();

export const supabase = client;
