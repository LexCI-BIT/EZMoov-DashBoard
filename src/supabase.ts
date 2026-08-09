/**
 * Deprecated shim — kept only so older imports of `../supabase` keep working.
 *
 * This file used to call createClient() a second time with a different env var
 * name (VITE_SUPABASE_ANON_KEY, which is not defined in .env) and silently fell
 * back to a fake 'https://mock-supabase-url.co' URL. Two clients on the same
 * storage key also produce the "Multiple GoTrueClient instances detected"
 * warning and can race each other's session writes.
 *
 * There is now exactly one client. Import it from '@/lib/supabase' directly;
 * this re-export should be deleted once nothing references it.
 */
export { supabase } from './lib/supabase';
