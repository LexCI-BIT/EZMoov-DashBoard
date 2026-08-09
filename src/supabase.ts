import { createClient } from '@supabase/supabase-js';

// Environment variables (Mocked for now, but ready for real connection)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-supabase-url.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);