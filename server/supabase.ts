import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || 'https://local.example.supabase.co';
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'local-dev-key';

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

const client = createClient(url, key);
(client as any).from = () => buildNoopQuery();

export const supabaseAdmin = client;
