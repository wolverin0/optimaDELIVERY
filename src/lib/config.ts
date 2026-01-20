// Supabase URL from environment variables
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';

// Publishable anon key
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Default schema (public is standard and exposed by default)
export const SCHEMA = 'public';
