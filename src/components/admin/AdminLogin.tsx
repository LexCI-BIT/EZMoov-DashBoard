import React, { useState } from 'react';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { signInAsAdmin, describeAuthError } from '../../lib/adminAuth';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      // Verifies the password against Supabase Auth AND that the account holds
      // the admin role in the database. Either one failing blocks entry.
      await signInAsAdmin(email, password);
      onLoginSuccess();
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_20%,#0F1923_0%,#0B0F17_100%)] px-4 py-8 sm:px-6">
      {/* Ambient glow — hidden on small screens where it just costs paint time */}
      <div className="pointer-events-none absolute -left-24 -top-24 hidden size-[400px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.15)_0%,rgba(0,0,0,0)_70%)] sm:block" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 hidden size-[450px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.12)_0%,rgba(0,0,0,0)_70%)] sm:block" />

      <div className="relative z-10 w-full max-w-[440px] rounded-2xl border border-line bg-[#121824] p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6),0_0_30px_rgba(16,185,129,0.05)] sm:p-8">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-brand-500/30 bg-brand-950 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Shield className="size-7 text-brand-500" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-50 sm:text-2xl">
            Super Admin Login
          </h1>
          <p className="mt-1.5 text-xs text-slate-400 sm:text-[13px]">
            EZMoov Control Panel &amp; Dashboard Access
          </p>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-[13px] leading-relaxed text-red-300"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-email" className="text-[13px] font-medium text-slate-300">
              Admin Email
            </label>
            <div className="relative flex items-center">
              <Mail className="pointer-events-none absolute left-3 size-[18px] text-slate-500" />
              <input
                id="admin-email"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ezmoov.com"
                /* text-base (16px) stops iOS Safari zooming in on focus */
                className="w-full rounded-[10px] border border-line bg-[#0B0F17] py-3 pl-10 pr-3.5 text-base text-slate-50 outline-none transition-colors placeholder:text-slate-600 focus:border-brand-500 sm:text-sm"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-password" className="text-[13px] font-medium text-slate-300">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="pointer-events-none absolute left-3 size-[18px] text-slate-500" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-[10px] border border-line bg-[#0B0F17] py-3 pl-10 pr-12 text-base text-slate-50 outline-none transition-colors placeholder:text-slate-600 focus:border-brand-500 sm:text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-1 flex size-10 items-center justify-center rounded-lg text-slate-400 transition hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[13px]">
            <label className="flex cursor-pointer items-center gap-2 text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 cursor-pointer accent-brand-500"
              />
              <span>Remember session</span>
            </label>
            <span className="text-xs font-medium text-slate-500">Administrator accounts only</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex min-h-[48px] w-full items-center justify-center rounded-[10px] bg-brand-500 px-4 text-sm font-bold text-[#091E16] shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition hover:bg-brand-400 active:scale-[0.99] disabled:cursor-default disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-[18px] animate-spin" />
                <span>Authenticating…</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="ml-2 size-[18px]" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-500 sm:text-xs">
          <CheckCircle className="size-3.5 shrink-0 text-brand-500" />
          <span>Secured 256-bit Encrypted Admin Connection</span>
        </div>
      </div>
    </div>
  );
};
