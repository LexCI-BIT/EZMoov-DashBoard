import React, { useState } from 'react';
import { ArrowLeft, ImageOff } from 'lucide-react';

/** Shared building blocks for the customer and driver profile screens. */

export const profileCard =
  'rounded-2xl border border-line bg-ink-850 p-5 sm:p-7 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.2)]';

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
export const InfoRow: React.FC<{ label: string; children: React.ReactNode; muted?: boolean }> = ({
  label,
  children,
  muted,
}) => (
  <div className="flex items-start justify-between gap-6 border-b border-white/[0.06] py-4 last:border-0">
    <span className="shrink-0 text-[15px] text-slate-400">{label}</span>
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
  <div className="rounded-xl bg-ink-900 px-5 py-5">
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
            className="h-44 w-full rounded-lg border border-line object-cover transition hover:opacity-90"
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
