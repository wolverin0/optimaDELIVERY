/**
 * Shared Supabase fetch helper for raw REST API calls
 * Centralized to avoid duplication across contexts and components
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Raw fetch helper for Supabase REST API
 * @param path - The REST path (e.g., 'orders?tenant_id=eq.123')
 * @param token - Optional auth token for authenticated requests
 * @param options - Additional fetch options (method, body, headers)
 */
export async function supabaseFetch(
  path: string,
  token: string | null,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY as string,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set default Prefer header for POST requests if not specified
  if (options.method === 'POST' && !headers['Prefer']) {
    headers['Prefer'] = 'return=representation';
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers,
  });

  return res;
}

/**
 * Typed fetch helper that returns data directly
 * @param path - The REST path
 * @param token - Optional auth token
 * @returns Parsed JSON array or empty array on error
 */
export async function fetchFromSupabase<T>(
  path: string,
  token?: string
): Promise<T[]> {
  const headers: Record<string, string> = {
    'apikey': SUPABASE_ANON_KEY as string,
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers });

  if (!res.ok) return [];
  return res.json();
}
