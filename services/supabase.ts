import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Vite exposes env variables via import.meta.env
// They MUST be prefixed with VITE_ to be available in the browser.
// We cast import.meta to any to avoid TypeScript errors if types are missing.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);