import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!url || !key) {
  throw new Error(
    'Missing Supabase config. Copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then restart the dev server.'
  );
}

/** Key written by the old fake login. Dead weight now — clear it on startup. */
const LEGACY_AUTH_KEY = 'ezmoov_admin_auth';

/**
 * A storage adapter that degrades instead of throwing.
 *
 * supabase-js writes the session to localStorage on every sign-in and token
 * refresh. If the origin's quota is full, a bare localStorage adapter throws
 * QuotaExceededError and the whole sign-in fails — even though authentication
 * itself succeeded. Losing session persistence is an acceptable degradation;
 * being unable to log in at all is not.
 *
 * Order of preference: localStorage -> sessionStorage -> in-memory.
 */
function createResilientStorage() {
  const memory = new Map<string, string>();

  const available = (store: Storage | undefined): store is Storage => {
    if (!store) return false;
    try {
      const probe = '__ez_probe__';
      store.setItem(probe, '1');
      store.removeItem(probe);
      return true;
    } catch {
      return false;
    }
  };

  const local = typeof window !== 'undefined' && available(window.localStorage) ? window.localStorage : null;
  const session = typeof window !== 'undefined' && available(window.sessionStorage) ? window.sessionStorage : null;

  if (local) {
    try {
      local.removeItem(LEGACY_AUTH_KEY);
    } catch {
      /* nothing to clean up */
    }
  }

  return {
    getItem(key: string): string | null {
      try {
        const fromLocal = local?.getItem(key);
        if (fromLocal != null) return fromLocal;
      } catch {
        /* fall through */
      }
      try {
        const fromSession = session?.getItem(key);
        if (fromSession != null) return fromSession;
      } catch {
        /* fall through */
      }
      return memory.get(key) ?? null;
    },

    setItem(key: string, value: string): void {
      if (local) {
        try {
          local.setItem(key, value);
          return;
        } catch {
          // Quota exceeded. Drop our own stale entry and retry once — a
          // previous oversized token is the most likely culprit.
          try {
            local.removeItem(key);
            local.setItem(key, value);
            return;
          } catch {
            console.warn(
              '[supabase] localStorage is full; falling back to sessionStorage. ' +
                'Your admin session will not survive closing the tab. ' +
                'Clear this site’s storage in DevTools → Application → Local Storage to restore it.'
            );
          }
        }
      }

      if (session) {
        try {
          session.setItem(key, value);
          return;
        } catch {
          /* fall through to memory */
        }
      }

      memory.set(key, value);
    },

    removeItem(key: string): void {
      try {
        local?.removeItem(key);
      } catch {
        /* ignore */
      }
      try {
        session?.removeItem(key);
      } catch {
        /* ignore */
      }
      memory.delete(key);
    },
  };
}

export const supabase = createClient(url, key, {
  auth: {
    // The admin panel signs in with a real Supabase session, so let
    // supabase-js own it: persist across reloads and refresh before expiry.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: createResilientStorage(),
  },
});
