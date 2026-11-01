import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

const validSupabaseUrl = (() => {
  if (!supabaseUrl) return false;
  try {
    const parsedUrl = new URL(supabaseUrl);
    return Boolean(parsedUrl.hostname) && ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
})();

export const supabaseConfigurationError =
  supabaseUrl && supabaseKey && !validSupabaseUrl ? 'invalid-url' : null;
export const supabaseConfigured = Boolean(supabaseUrl && supabaseKey && validSupabaseUrl);

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.',
    );
  }
  return supabase;
}
