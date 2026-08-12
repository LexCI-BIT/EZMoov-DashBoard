import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { toE164 } from '../lib/phone';
import type { AuthContextType, AuthResponse, SignUpDetails, User } from '../features/auth/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

/** Map a Supabase user onto the shape the app already expects. */
function mapUser(u: SupabaseUser | null | undefined): User | null {
  if (!u) return null;
  const meta = (u.user_metadata ?? {}) as { full_name?: string; email?: string };
  return {
    id: u.id,
    phone: u.phone ?? '',
    fullName: meta.full_name?.trim() || 'Customer',
    // Phone signups leave auth.users.email null, so fall back to metadata.
    email: u.email ?? meta.email ?? null,
  };
}

/** Turn Supabase/GoTrue errors into something worth showing a person. */
function describe(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err ?? 'Something went wrong.');

  if (/signups not allowed|Signups not allowed for otp/i.test(message)) {
    return 'No account found for this number. Please sign up first.';
  }
  if (/user already registered|already been registered/i.test(message)) {
    return 'This number is already registered. Please log in instead.';
  }
  if (/token has expired|expired/i.test(message)) {
    return 'That code has expired. Request a new one.';
  }
  if (/invalid.*(otp|token|code)/i.test(message)) {
    return 'Incorrect code. Please check and try again.';
  }
  if (/rate limit|too many/i.test(message)) {
    return 'Too many attempts. Please wait a minute and try again.';
  }
  if (/invalid phone|phone.*invalid/i.test(message)) {
    return 'That phone number doesn’t look right.';
  }
  if (/failed to fetch|network/i.test(message)) {
    return 'Could not reach the server. Check your connection.';
  }
  return message;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * The signup trigger writes public.users from auth.users, where a phone
   * signup has no email — it only exists in user_metadata. Copy it across
   * once we have a session, so the admin dashboard sees a real email.
   * Allowed by the "users can update their own profile" RLS policy.
   */
  const syncProfile = useCallback(async (session: Session | null) => {
    if (!session?.user) return;
    const meta = (session.user.user_metadata ?? {}) as { full_name?: string; email?: string };
    const patch: Record<string, string> = {};
    if (meta.email) patch.email = meta.email;
    if (meta.full_name) patch.full_name = meta.full_name;
    if (Object.keys(patch).length === 0) return;

    const { error } = await supabase.from('users').update(patch).eq('id', session.user.id);
    if (error) console.warn('[auth] could not sync profile:', error.message);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setUser(mapUser(data.session?.user));
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user));
      setLoading(false);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  /** New account: create the user and text the first code. */
  const sendSignUpOtp = async (phone: string, details: SignUpDetails): Promise<AuthResponse> => {
    const e164 = toE164(phone);
    if (!e164) return { data: null, error: { message: 'Enter a valid mobile number.' } };

    const { error } = await supabase.auth.signInWithOtp({
      phone: e164,
      options: {
        shouldCreateUser: true,
        data: {
          full_name: details.fullName.trim(),
          email: details.email.trim().toLowerCase(),
        },
      },
    });

    if (error) return { data: null, error: { message: describe(error) } };
    return { data: { user: null }, error: null };
  };

  /** Existing account only — shouldCreateUser:false rejects unknown numbers. */
  const sendLoginOtp = async (phone: string): Promise<AuthResponse> => {
    const e164 = toE164(phone);
    if (!e164) return { data: null, error: { message: 'Enter a valid mobile number.' } };

    const { error } = await supabase.auth.signInWithOtp({
      phone: e164,
      options: { shouldCreateUser: false },
    });

    if (error) return { data: null, error: { message: describe(error) } };
    return { data: { user: null }, error: null };
  };

  const verifyOtp = async (phone: string, token: string): Promise<AuthResponse> => {
    const e164 = toE164(phone);
    if (!e164) return { data: null, error: { message: 'Enter a valid mobile number.' } };

    const { data, error } = await supabase.auth.verifyOtp({
      phone: e164,
      token: token.trim(),
      type: 'sms',
    });

    if (error) return { data: null, error: { message: describe(error) } };

    const mapped = mapUser(data.user);
    setUser(mapped);
    await syncProfile(data.session);

    return { data: { user: mapped }, error: null };
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    sendSignUpOtp,
    sendLoginOtp,
    verifyOtp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
