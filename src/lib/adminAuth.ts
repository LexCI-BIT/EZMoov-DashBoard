import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';

/**
 * Admin authentication.
 *
 * Authorization is decided by the database, not the browser. `public.is_admin()`
 * is a SECURITY DEFINER function that checks `public.users.role = 'admin'` for
 * the caller's `auth.uid()`, and the same function backs the RLS policy that
 * lets admins read every row. So a tampered client can't grant itself anything:
 * flipping a flag in devtools gets you a dashboard shell with no data in it.
 */

export class NotAnAdminError extends Error {
  constructor() {
    super('This account is not an EZMoov administrator.');
    this.name = 'NotAnAdminError';
  }
}

/** Asks the database whether the current session belongs to an admin. */
export async function checkIsAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin');
  if (error) return false;
  return data === true;
}

/**
 * Signs in and verifies admin rights. Signs back out and throws if the
 * credentials are valid but the account isn't an admin — no half-open state.
 */
export async function signInAsAdmin(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) throw error;
  if (!data.session) throw new Error('Sign-in succeeded but no session was returned.');

  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    await supabase.auth.signOut();
    throw new NotAnAdminError();
  }

  return data.session;
}

export async function signOutAdmin(): Promise<void> {
  await supabase.auth.signOut();
}

/** Restores a persisted session on page load, if it still belongs to an admin. */
export async function restoreAdminSession(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return false;
  return checkIsAdmin();
}

/** Turns Supabase auth errors into something worth showing a person. */
export function describeAuthError(err: unknown): string {
  if (err instanceof NotAnAdminError) return err.message;

  const message = err instanceof Error ? err.message : String(err);

  if (/invalid login credentials/i.test(message)) {
    return 'Incorrect email or password.';
  }
  if (/email not confirmed/i.test(message)) {
    return 'This account’s email address has not been confirmed yet.';
  }
  if (/failed to fetch|network/i.test(message)) {
    return 'Could not reach Supabase. Check your connection and that VITE_SUPABASE_URL is correct.';
  }
  return message;
}
