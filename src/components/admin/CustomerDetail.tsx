import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Car,
  Route,
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  Navigation,
  MapPinned,
} from 'lucide-react';
import {
  fetchCustomerDetail,
  formatMemberSince,
  formatRupees,
  bookingTotal,
} from '../../lib/adminQueries';
import type { CustomerDetailData, BookingRow } from '../../lib/types';
import {
  ADDRESS_UNAVAILABLE,
  Avatar,
  BackLink,
  Badge,
  InfoRow,
  StatTile,
  profileCard,
  sectionLabel,
} from './ProfileParts';

interface CustomerDetailProps {
  userId: string;
  onBack: () => void;
  /** Same driverMap used on Verified Drivers page — maps driver DB id → EZMD#### */
  driverMap?: Map<string, string>;
}

/* ─── Ride status pill ─────────────────────────────────────────────────────── */
const RideStatusPill: React.FC<{ status: string }> = ({ status }) => {
  const s = status.toLowerCase();
  const cfg =
    s === 'completed'
      ? { cls: 'border-brand-500/20 bg-brand-500/10 text-brand-400', icon: <CheckCircle2 className="size-3" /> }
      : s === 'cancelled' || s === 'canceled'
      ? { cls: 'border-red-500/20 bg-red-500/10 text-red-400', icon: <XCircle className="size-3" /> }
      : { cls: 'border-amber-500/20 bg-amber-500/10 text-amber-400', icon: <Clock className="size-3" /> };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide capitalize ${cfg.cls}`}
    >
      {cfg.icon}
      {status}
    </span>
  );
};

/* ─── Friendly service label ───────────────────────────────────────────────── */
function serviceLabel(raw: string | null): string {
  if (!raw) return '—';
  return raw
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ─── Single ride card ─────────────────────────────────────────────────────── */
const RideCard: React.FC<{ ride: BookingRow; index: number; driverMap?: Map<string, string> }> = ({ ride, index, driverMap }) => {
  const total = bookingTotal(ride);
  const date = ride.created_at
    ? new Date(ride.created_at).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <div className="rounded-xl border border-white/[0.06] bg-ink-800/60 p-4 transition hover:border-brand-500/30 hover:bg-ink-800/80">
      {/* Top row: index, service, status, amount */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-brand-500/15 text-[11px] font-bold text-brand-400">
            {index}
          </span>
          <div className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-ink-700 px-2.5 py-0.5">
            <Car className="size-3 text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-300">{serviceLabel(ride.service)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RideStatusPill status={ride.status} />
          {total > 0 && (
            <span className="flex items-center gap-0.5 rounded-full border border-brand-500/20 bg-brand-500/10 px-2.5 py-0.5 text-[12px] font-bold text-brand-400">
              <IndianRupee className="size-3" />
              {Math.round(total).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>

      {/* Route */}
      <div className="mb-3 space-y-1.5 rounded-lg border border-white/[0.04] bg-ink-900/40 p-3">
        <div className="flex items-start gap-2">
          <Navigation className="mt-0.5 size-3.5 shrink-0 text-brand-400" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Pickup</p>
            <p className="truncate text-[13px] text-slate-200">{ride.pickup_address || '—'}</p>
          </div>
        </div>
        <div className="ml-3.5 h-4 w-px border-l border-dashed border-slate-600" />
        <div className="flex items-start gap-2">
          <MapPinned className="mt-0.5 size-3.5 shrink-0 text-red-400" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Drop</p>
            <p className="truncate text-[13px] text-slate-200">{ride.drop_address || '—'}</p>
          </div>
        </div>
      </div>

      {/* Footer: driver + date */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[11px] text-slate-500">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1">
            <User className="size-3" />
            {ride.driver_name ? (
              <span className="font-medium text-slate-300">{ride.driver_name}</span>
            ) : (
              <span className="italic">No driver assigned</span>
            )}
          </span>
          {ride.driver_id ? (
            <span className="flex items-center gap-1 ml-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Driver ID:</span>
              <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-brand-400 border border-brand-500/20 select-all">
                {driverMap?.get(ride.driver_id) ?? ride.driver_id}
              </code>
            </span>
          ) : null}
        </div>
        <span className="flex items-center gap-1">
          <Calendar className="size-3" />
          {date}
        </span>
      </div>
    </div>
  );
};

/* ─── Main component ───────────────────────────────────────────────────────── */
export const CustomerDetail: React.FC<CustomerDetailProps> = ({ userId, onBack, driverMap }) => {
  const [data, setData] = useState<CustomerDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void fetchCustomerDetail(userId)
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load customer.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-slate-400">
        <Loader2 className="size-5 animate-spin text-brand-500" />
        <span>Loading customer…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <AlertCircle className="mx-auto mb-3 size-8 text-red-400" />
        <p className="mb-4 text-sm text-red-300">{error ?? 'Customer not found.'}</p>
        <BackLink label="Back to Customers" onClick={onBack} />
      </div>
    );
  }

  const { user, address, stats, rides } = data;
  const name = user.full_name?.trim() || 'Unnamed Customer';


  const completedRides = rides.filter((r) => r.status === 'completed');
  const cancelledRides = rides.filter(
    (r) => r.status === 'cancelled' || r.status === 'canceled'
  );

  return (
    <div>
      <BackLink label="Back to Customers" onClick={onBack} />

      <div className="flex flex-col gap-6">
        {/* IDENTITY */}
        <div className={`${profileCard} mb-2`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar name={name} />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-2xl font-bold text-white">{name}</h2>
              <p className="mt-1 truncate text-[15px] text-slate-400">
                {user.email || '—'} · {user.phone_number || '—'}
              </p>
            </div>
            <Badge tone="green">ACTIVE</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* PERSONAL INFORMATION */}
          <div className={profileCard}>
            <div className={sectionLabel}>Personal Information</div>
            <InfoRow label="Full Name" icon={<User className="size-4" />}>{name}</InfoRow>
            <InfoRow label="Email" icon={<Mail className="size-4" />}>{user.email || '—'}</InfoRow>
            <InfoRow label="Phone" icon={<Phone className="size-4" />}>{user.phone_number || '—'}</InfoRow>
            <InfoRow label="Address" muted={!address} icon={<MapPin className="size-4" />}>
              {address ?? ADDRESS_UNAVAILABLE}
            </InfoRow>
            <InfoRow label="Member Since" icon={<Calendar className="size-4" />}>{formatMemberSince(user.created_at)}</InfoRow>
          </div>

          {/* ACTIVITY SUMMARY */}
          <div className={profileCard}>
            <div className={sectionLabel}>Activity Summary</div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
              <StatTile value={stats.totalRides} label="Total Rides" />
              <StatTile value={formatRupees(stats.totalValue)} label="Total Spent" />
              <StatTile value={completedRides.length} label="Completed" />
              <StatTile value={cancelledRides.length} label="Cancelled" />
            </div>
          </div>
        </div>

        {/* RIDE HISTORY */}
        <div className={profileCard}>
          <div className="mb-4 flex items-center justify-between">
            <div className={sectionLabel}>
              <Route className="mr-1.5 inline size-4 align-text-bottom text-brand-500" />
              Ride History
            </div>
            <span className="rounded-full border border-brand-500/20 bg-brand-500/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-400">
              {rides.length} ride{rides.length !== 1 ? 's' : ''}
            </span>
          </div>

          {rides.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-slate-500">
              <Route className="size-8 text-slate-600" />
              <p>No rides found for this customer.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {rides.map((ride, i) => (
                <RideCard key={ride.id} ride={ride} index={i + 1} driverMap={driverMap} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
