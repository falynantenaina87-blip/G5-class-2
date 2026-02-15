import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Vite exposes env variables via import.meta.env
// They MUST be prefixed with VITE_ to be available in the browser.
// We cast import.meta to any to avoid TypeScript errors if types are missing.

// FALLBACK SAFEGUARDS:
// If variables are missing (first deploy), we provide a dummy string to prevent
// createClient from throwing a fatal error ("supabaseUrl is required") which causes the White Screen.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);