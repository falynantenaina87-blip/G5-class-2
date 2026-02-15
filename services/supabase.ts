import { createClient } from '@supabase/supabase-js';

// IMPORTANT: In a real environment, use import.meta.env.VITE_SUPABASE_URL
// For this output, we assume process.env or direct replacement.
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
