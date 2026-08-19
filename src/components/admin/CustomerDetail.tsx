import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { fetchCustomerDetail, formatMemberSince, formatRupees } from '../../lib/adminQueries';
import type { CustomerDetailData } from '../../lib/types';
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
}

export const CustomerDetail: React.FC<CustomerDetailProps> = ({ userId, onBack }) => {
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

  const { user, address, stats } = data;
  const name = user.full_name?.trim() || 'Unnamed Customer';

  return (
    <div>
      <BackLink label="Back to Customers" onClick={onBack} />

      <div className={profileCard}>
        {/* IDENTITY */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar name={name} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-2xl font-bold text-white">{name}</h2>
            <p className="mt-1 truncate text-[15px] text-slate-400">
              {user.email || '—'} · {user.phone_number || '—'}
            </p>
          </div>
          <Badge tone="green">ACTIVE</Badge>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* PERSONAL INFORMATION */}
          <div>
            <div className={sectionLabel}>Personal Information</div>
            <InfoRow label="Full Name">{name}</InfoRow>
            <InfoRow label="Email">{user.email || '—'}</InfoRow>
            <InfoRow label="Phone">{user.phone_number || '—'}</InfoRow>
            <InfoRow label="Address" muted={!address}>
              {address ?? ADDRESS_UNAVAILABLE}
            </InfoRow>
            <InfoRow label="Member Since">{formatMemberSince(user.created_at)}</InfoRow>
          </div>

          {/* ACTIVITY SUMMARY */}
          <div>
            <div className={sectionLabel}>Activity Summary</div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatTile value={stats.totalRides} label="Total Rides" />
              <StatTile value={formatRupees(stats.totalValue)} label="Total Spent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
