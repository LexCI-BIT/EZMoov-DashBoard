import React, { useState } from 'react';
import { ArrowLeft, ImageOff } from 'lucide-react';

/** Shared building blocks for the customer and driver profile screens. */

export const profileCard =
  'relative rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.05] via-transparent to-transparent bg-ink-900/70 p-5 sm:p-7 backdrop-blur-2xl shadow-[0_15px_35px_-5px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] ring-1 ring-white/[0.02] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(16,185,129,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] hover:border-brand-500/40 hover:bg-ink-900/90';

export const sectionLabel =
  'mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500';

export const BackLink: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="mb-5 flex w-fit items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
  >
    <ArrowLeft className="size-4" />
    {label}
  </button>
);

export const Badge: React.FC<{ tone: 'green' | 'amber'; children: React.ReactNode }> = ({
  tone,
  children,
}) => (
  <span
    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide ${
      tone === 'green' ? 'bg-brand-500/15 text-brand-400' : 'bg-amber-500/15 text-amber-400'
    }`}
  >
    {children}
  </span>
);

/** Label/value row with a hairline underneath, matching the design. */
export const InfoRow: React.FC<{ label: string; children: React.ReactNode; muted?: boolean; icon?: React.ReactNode }> = ({
  label,
  children,
  muted,
  icon,
}) => (
  <div className="group flex items-start justify-between gap-6 border-b border-white/[0.06] py-4 px-3 -mx-3 rounded-xl last:border-0 transition-all duration-300 hover:bg-brand-500/10 hover:border-brand-500/30">
    <div className="flex items-center gap-2.5 shrink-0 text-[15px] text-slate-400">
      {icon && <span className="text-slate-500">{icon}</span>}
      <span>{label}</span>
    </div>
    <span
      className={`min-w-0 break-words text-right text-[15px] font-semibold ${
        muted ? 'italic text-slate-500' : 'text-slate-100'
      }`}
    >
      {children}
    </span>
  </div>
);

/** One of the big numbers in Activity Summary. */
export const StatTile: React.FC<{ value: React.ReactNode; label: string }> = ({ value, label }) => (
  <div className="rounded-xl bg-ink-900 px-5 py-5 ring-1 ring-transparent transition-all duration-300 hover:bg-ink-800 hover:-translate-y-2 hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.2)] hover:ring-brand-500/40">
    <div className="text-3xl font-bold leading-none text-brand-400">{value}</div>
    <div className="mt-2 text-[13px] text-slate-400">{label}</div>
  </div>
);

export const Avatar: React.FC<{ name: string; size?: 'md' | 'lg' }> = ({ name, size = 'lg' }) => (
  <div
    className={`flex shrink-0 items-center justify-center rounded-full bg-brand-500/15 ${
      size === 'lg' ? 'size-16' : 'size-12'
    }`}
  >
    <span className={`font-bold text-brand-400 ${size === 'lg' ? 'text-2xl' : 'text-lg'}`}>
      {(name || '?').charAt(0).toUpperCase()}
    </span>
  </div>
);

/** Document/photo tile that degrades when the URL is missing or fails to load. */
export const ImageTile: React.FC<{ label: string; url: string | null | undefined }> = ({
  label,
  url,
}) => {
  const [failed, setFailed] = useState(false);

  return (
    <div className="min-w-0">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      {url && !failed ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={url}
            alt={label}
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-44 w-full rounded-lg border border-line object-cover transition-all duration-300 hover:scale-[1.05] hover:opacity-100 hover:shadow-[0_12px_40px_-10px_rgba(16,185,129,0.4)] hover:border-brand-500"
          />
        </a>
      ) : (
        <div className="flex h-44 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-ink-900 text-slate-600">
          <ImageOff className="size-5" />
          <span className="text-xs">{url ? 'Failed to load' : 'Not uploaded'}</span>
        </div>
      )}
    </div>
  );
};

/**
 * saved_addresses is protected by an `auth.uid() = user_id` RLS policy, so an
 * admin genuinely cannot read anyone else's address. Say so rather than
 * rendering an empty field that looks like missing data.
 */
export const ADDRESS_UNAVAILABLE = 'Not visible to admins';
