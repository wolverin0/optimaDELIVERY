import { z } from 'zod';

/**
 * Environment variable validation
 * Validates required env vars at startup to fail fast
 */

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL must be a valid URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'VITE_SUPABASE_ANON_KEY is required'),
  VITE_MP_CLIENT_ID: z.string().optional(),
});

type EnvConfig = z.infer<typeof envSchema>;

let validatedEnv: EnvConfig | null = null;

export function validateEnv(): void {
  const env = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_MP_CLIENT_ID: import.meta.env.VITE_MP_CLIENT_ID,
  };

  const result = envSchema.safeParse(env);

  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }

  validatedEnv = result.data;
}

// Supabase URL from environment variables
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';

// Publishable anon key
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// MercadoPago Client ID (optional)
export const MP_CLIENT_ID = import.meta.env.VITE_MP_CLIENT_ID as string | undefined;

// Default schema (public is standard and exposed by default)
export const SCHEMA = 'public';

/**
 * Extract project reference from Supabase URL
 * Used for dynamic storage key generation
 */
export function getSupabaseProjectRef(): string {
  const url = SUPABASE_URL;
  const match = url?.match(/https:\/\/([^.]+)/);
  return match?.[1] || 'app';
}
