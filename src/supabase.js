import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://mbijjnezzerpuqmfbfkh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_qpidZfABPisrijbH9zd-uw_2LrMLqNt';
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);