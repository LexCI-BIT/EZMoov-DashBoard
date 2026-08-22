import React, { useEffect, useState } from 'react';
import { LiveTrackerMap } from './LiveTrackerMap';
import { AlertCircle, CheckCircle2, Clock, Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  fetchDriverProfile,
  formatMemberSince,
  formatRupees,
  maskAccountNumber,
} from '../../lib/adminQueries';
import type { DriverProfileData } from '../../lib/types';
import {
  ADDRESS_UNAVAILABLE,
  Avatar,
  BackLink,
  Badge,
  ImageTile,
  InfoRow,
  StatTile,
  profileCard,
  sectionLabel,
} from './ProfileParts';

interface DriverProfileProps {
  driverId: string;
  onBack: () => void;
}

/** One row of the Verification Status list. Read-only — approvals live in DriverReview. */
const VerificationRow: React.FC<{ label: string; done: boolean }> = ({ label, done }) => (
  <div className="flex items-center justify-between rounded-xl bg-ink-900 px-5 py-4">
    <span className="text-[15px] text-slate-200">{label}</span>
    <span
      className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${
        done ? 'text-brand-400' : 'text-amber-400'
      }`}
    >
      {done ? <CheckCircle2 className="size-4" /> : <Clock className="size-4" />}
      {done ? 'Verified' : 'Pending'}
    </span>
  </div>
);

export const DriverProfile: React.FC<DriverProfileProps> = ({ driverId, onBack }) => {
  const [data, setData] = useState<DriverProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAccount, setShowAccount] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void fetchDriverProfile(driverId)
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load driver.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [driverId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-slate-400">
        <Loader2 className="size-5 animate-spin text-brand-500" />
        <span>Loading driver…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <AlertCircle className="mx-auto mb-3 size-8 text-red-400" />
        <p className="mb-4 text-sm text-red-300">{error ?? 'Driver not found.'}</p>
        <BackLink label="Back to Drivers" onClick={onBack} />
      </div>
    );
  }

  const { driver, vehicle, bank, stats } = data;
  const name = driver.name?.trim() || 'Unnamed Driver';
  const fullyVerified = driver.is_verified === true;

  return (
    <div>
      <BackLink label="Back to Drivers" onClick={onBack} />

      <div className={profileCard}>
        {/* IDENTITY */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar name={name} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-2xl font-bold text-white">{name}</h2>
            <p className="mt-1 truncate text-[15px] text-slate-400">
              {driver.email || '—'} · {driver.phone || '—'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={fullyVerified ? 'green' : 'amber'}>
              {fullyVerified ? (
                <CheckCircle2 className="size-3" />
              ) : (
                <Clock className="size-3" />
              )}
              {fullyVerified ? 'VERIFIED' : 'PENDING'}
            </Badge>
            {driver.is_online ? <Badge tone="green">ONLINE</Badge> : <Badge tone="green">ACTIVE</Badge>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* PERSONAL INFORMATION */}
          <div>
            <div className={sectionLabel}>Personal Information</div>
            <InfoRow label="Full Name">{name}</InfoRow>
            <InfoRow label="Email">{driver.email || '—'}</InfoRow>
            <InfoRow label="Phone">{driver.phone || '—'}</InfoRow>
            {/* public.drivers has no address column at all. */}
            <InfoRow label="Address" muted>
              {ADDRESS_UNAVAILABLE}
            </InfoRow>
            <InfoRow label="Member Since">{formatMemberSince(driver.created_at)}</InfoRow>
          </div>

          {/* ACTIVITY + VERIFICATION */}
          <div className="flex flex-col gap-8">
            <div>
              <div className={sectionLabel}>Activity Summary</div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatTile value={stats.totalRides} label="Total Rides" />
                <StatTile
                  value={driver.rating != null ? Number(driver.rating).toFixed(1) : '—'}
                  label="Rating"
                />
                <StatTile value={formatRupees(stats.totalValue)} label="Earnings" />
              </div>
            </div>

            <div>
              <div className={sectionLabel}>Verification Status</div>
              <div className="flex flex-col gap-3">
                <VerificationRow label="Documents" done={driver.is_documents_verified === true} />
                <VerificationRow label="Vehicle" done={driver.is_vehicle_verified === true} />
                <VerificationRow label="Bank" done={driver.is_bank_details_verified === true} />
              </div>
            </div>
          </div>
        </div>

        {/* VEHICLE */}
        <div className="mt-10 border-t border-white/[0.06] pt-8">
          <div className={sectionLabel}>Vehicle Information</div>
          {vehicle ? (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
              <div>
                <InfoRow label="Vehicle Number">{vehicle.vehicle_number || '—'}</InfoRow>
                <InfoRow label="RC Number">{vehicle.rc_number || '—'}</InfoRow>
              </div>
              <ImageTile label="RC Image" url={vehicle.rc_pic_url} />
            </div>
          ) : (
            <p className="py-6 text-[15px] text-slate-500">No vehicle has been added yet.</p>
          )}
        </div>

        {/* BANK */}
        <div className="mt-10 border-t border-white/[0.06] pt-8">
          <div className={sectionLabel}>Bank Information</div>
          {bank ? (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
              <div>
                <InfoRow label="Account Holder">{bank.account_holder_name || '—'}</InfoRow>
                <InfoRow label="Bank Name">{bank.bank_name || '—'}</InfoRow>
                <InfoRow label="Account Number">
                  <span className="inline-flex items-center gap-2">
                    <span className="font-mono">
                      {showAccount ? bank.account_number : maskAccountNumber(bank.account_number)}
                    </span>
                    <button
                      onClick={() => setShowAccount((v) => !v)}
                      aria-label={showAccount ? 'Hide account number' : 'Show account number'}
                      className="text-slate-400 transition hover:text-white"
                    >
                      {showAccount ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </span>
                </InfoRow>
                <InfoRow label="IFSC Code">{bank.ifsc_code || '—'}</InfoRow>
                <InfoRow label="UPI ID">{bank.upi_id || '—'}</InfoRow>
              </div>
              <ImageTile label="Passbook" url={bank.passbook_pic_url} />
            </div>
          ) : (
            <p className="py-6 text-[15px] text-slate-500">No bank details submitted yet.</p>
          )}
        </div>

        {/* LIVE LOCATION (Only for fully verified drivers) */}
        {fullyVerified && (
          <div className="mt-10 border-t border-white/[0.06] pt-8">
            <div className="mb-4">
              <div className={sectionLabel}>Live Location</div>
              <p className="mt-1 text-sm text-slate-400">
                Tracking driver in real-time via Supabase. Map updates automatically when the driver moves.
              </p>
            </div>
            <LiveTrackerMap driverId={driverId} driverName={name} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverProfile;
