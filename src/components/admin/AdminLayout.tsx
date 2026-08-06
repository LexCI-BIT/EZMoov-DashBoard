import React, { useState, useEffect } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { restoreAdminSession, signOutAdmin } from '../../lib/adminAuth';

interface AdminLayoutProps {
  onNavigateHome?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onNavigateHome }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  // Restore a persisted Supabase session on load, but only honour it if the
  // account is still an admin — a revoked role should log you straight out.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const ok = await restoreAdminSession();
      if (!cancelled) {
        setIsLoggedIn(ok);
        setChecking(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setIsLoggedIn(false);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleLoginSuccess = () => setIsLoggedIn(true);

  const handleLogout = async () => {
    await signOutAdmin();
    setIsLoggedIn(false);
  };

  return (
    <div className="relative min-h-dvh w-full bg-ink-950">
      {/*
        Exit button sits bottom-left on phones so it can't collide with the
        dashboard's bottom-right controls or a browser's floating UI.
      */}
      {onNavigateHome && (
        <button
          onClick={onNavigateHome}
          title="Return to EZMoov Main Site"
          className="fixed bottom-4 left-4 z-[60] flex items-center rounded-full border border-line bg-slate-900/85 px-4 py-2 text-xs font-semibold text-slate-400 shadow-[0_10px_25px_rgba(0,0,0,0.5)] backdrop-blur-md transition hover:text-slate-200 sm:bottom-5 sm:left-auto sm:right-5"
        >
          <ArrowLeft className="mr-1.5 size-3.5" />
          <span>Exit Admin</span>
        </button>
      )}

      {checking ? (
        <div className="flex min-h-dvh items-center justify-center gap-3 px-4 text-sm text-slate-400">
          <Loader2 className="size-5 animate-spin text-brand-500" />
          <span>Checking session…</span>
        </div>
      ) : isLoggedIn ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
};
