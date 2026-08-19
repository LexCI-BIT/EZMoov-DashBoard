import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Car,
  Landmark,
  Hourglass,
  Eye,
  EyeOff,
  ImageOff,
} from 'lucide-react';
import { fetchDriverDetail, maskAccountNumber, verifyDriverSection } from '../../lib/adminQueries';
import type { DriverDetail, VerifySection } from '../../lib/types';

interface DriverReviewProps {
  driverId: string;
  onBack: () => void;
  /** Lets the parent list refresh its counts after an approval. */
  onChanged?: () => void;
}

const card = 'rounded-2xl border border-line bg-ink-850 p-4 sm:p-6';
const sectionTitle = 'flex items-center gap-2 text-base font-bold text-white sm:text-lg';

/** A document/photo tile that degrades gracefully when the URL is missing or broken. */
const ImageTile: React.FC<{ label: string; url: string | null | undefined }> = ({ label, url }) => {
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
            className="h-40 w-full rounded-lg border border-line object-cover transition hover:opacity-90"
          />
        </a>
      ) : (
        <div className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-ink-900 text-slate-600">
          <ImageOff className="size-5" />
          <span className="text-xs">{url ? 'Failed to load' : 'Not uploaded'}</span>
        </div>
      )}
    </div>
  );
};

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-0">
    <span className="shrink-0 text-[13px] text-slate-400">{label}</span>
    <span className="min-w-0 truncate text-right text-[13px] font-semibold text-slate-100">
      {children}
    </span>
  </div>
);

const StatusChip: React.FC<{ verified: boolean }> = ({ verified }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide ${
      verified
        ? 'border-brand-500/20 bg-brand-500/10 text-brand-500'
        : 'border-amber-500/20 bg-amber-500/10 text-amber-500'
    }`}
  >
    {verified ? <CheckCircle2 className="size-3" /> : <Hourglass className="size-3" />}
    {verified ? 'VERIFIED' : 'PENDING'}
  </span>
);

export const DriverReview: React.FC<DriverReviewProps> = ({ driverId, onBack, onChanged }) => {
  const [detail, setDetail] = useState<DriverDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<VerifySection | null>(null);
  const [showAccount, setShowAccount] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDetail(await fetchDriverDetail(driverId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load driver.');
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleVerify = async (section: VerifySection, approved: boolean) => {
    if (saving) return;
    setSaving(section);
    try {
      const updated = await verifyDriverSection(driverId, section, approved);
      setDetail((prev) => (prev ? { ...prev, driver: updated } : prev));
      setError(null);
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setSaving(null);
    }
  };

  if (loading && !detail) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-slate-400">
        <Loader2 className="size-5 animate-spin text-brand-500" />
        <span>Loading driver…</span>
      </div>
    );
  }

  if (error && !detail) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <AlertCircle className="mx-auto mb-3 size-8 text-red-400" />
        <p className="mb-4 text-sm text-red-300">{error}</p>
        <button onClick={onBack} className="text-sm font-semibold text-brand-500">
          ← Back to Driver List
        </button>
      </div>
    );
  }

  if (!detail) return null;

  const { driver, vehicle, documents, bank } = detail;

  const steps: { key: VerifySection; label: string; done: boolean }[] = [
    { key: 'documents', label: 'Documents', done: driver.is_documents_verified === true },
    { key: 'vehicle', label: 'Vehicle', done: driver.is_vehicle_verified === true },
    { key: 'bank', label: 'Bank', done: driver.is_bank_details_verified === true },
  ];

  const VerifyButton: React.FC<{ section: VerifySection; done: boolean; disabled?: boolean }> = ({
    section,
    done,
    disabled,
  }) => (
    <button
      onClick={() => handleVerify(section, !done)}
      disabled={disabled || saving !== null}
      title={disabled ? 'Nothing submitted for this section yet' : undefined}
      className={`flex h-10 shrink-0 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
        done
          ? 'border border-line bg-ink-700 text-slate-300 hover:text-white'
          : 'bg-brand-500 text-[#062E21] hover:bg-brand-400'
      }`}
    >
      {saving === section ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <CheckCircle2 className="size-4" />
      )}
      {done ? 'Undo' : `Verify ${section === 'bank' ? 'Bank' : section === 'vehicle' ? 'Vehicle' : 'Documents'}`}
    </button>
  );

  return (
    <div className="flex flex-col gap-5">
      <button
        onClick={onBack}
        className="flex w-fit items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Back to Driver List
      </button>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">
          {error}
        </div>
      )}

      {/* IDENTITY */}
      <div className={`${card} flex flex-col gap-4 sm:flex-row sm:items-center`}>
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-500/15">
          <span className="text-xl font-bold text-brand-500">
            {(driver.name || '?').charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-bold text-white">{driver.name || '—'}</h2>
          <p className="mt-0.5 truncate text-[13px] text-slate-400">
            {driver.phone || '—'} · {driver.email || '—'}
          </p>
        </div>
        <StatusChip verified={driver.is_verified === true} />
      </div>

      {/* PROGRESS */}
      <div className={card}>
        <div className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Verification Progress
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                  s.done ? 'bg-brand-500/10' : 'bg-amber-500/10'
                }`}
              >
                {s.done ? (
                  <CheckCircle2 className="size-4 text-brand-500" />
                ) : (
                  <Hourglass className="size-4 text-amber-500" />
                )}
              </div>
              <div className="min-w-0">
                <div className={`text-sm font-bold ${s.done ? 'text-brand-500' : 'text-amber-500'}`}>
                  {s.label}
                </div>
                <div className="text-xs text-slate-400">{s.done ? 'Verified' : 'Pending'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DOCUMENTS */}
      <div className={card}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className={sectionTitle}>
              <FileText className="size-5 text-brand-500" />
              Documents
            </h3>
            <p className="mt-1 text-xs text-slate-400">Uploaded certificate images</p>
          </div>
          <VerifyButton
            section="documents"
            done={driver.is_documents_verified === true}
            disabled={!documents}
          />
        </div>

        {documents ? (
          <div className="flex flex-col gap-6">
            {/* Identity documents first — these are what actually verify the person. */}
            <div>
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Identity &amp; Licence
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <ImageTile label="Driving Licence" url={documents.driving_license_url} />
                <ImageTile label="Aadhaar" url={documents.aadhaar_url} />
                <ImageTile label="PAN Card" url={documents.pan_card_url} />
                <ImageTile label="Selfie With Vehicle" url={documents.selfie_with_vehicle_url} />
              </div>
            </div>

            <div>
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Vehicle Paperwork
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <ImageTile label="Vehicle RC" url={documents.vehicle_rc_url} />
                <ImageTile label="Insurance" url={documents.insurance_url} />
                <ImageTile label="PUC Certificate" url={documents.puc_url} />
                <ImageTile label="Permit" url={documents.permit_url} />
                <ImageTile label="Fitness Certificate" url={documents.fitness_url} />
                <ImageTile label="Police Clearance" url={documents.police_clearance_url} />
              </div>
            </div>
          </div>
        ) : (
          <p className="py-6 text-center text-[13px] text-slate-500">
            This driver hasn&apos;t uploaded any documents yet.
          </p>
        )}
      </div>

      {/* VEHICLE */}
      <div className={card}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className={sectionTitle}>
              <Car className="size-5 text-brand-500" />
              Vehicle Details
            </h3>
            <p className="mt-1 text-xs text-slate-400">Vehicle registration info</p>
          </div>
          <VerifyButton
            section="vehicle"
            done={driver.is_vehicle_verified === true}
            disabled={!vehicle}
          />
        </div>

        {vehicle ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <Row label="Vehicle Number">{vehicle.vehicle_number || '—'}</Row>
              <Row label="RC Number">{vehicle.rc_number || '—'}</Row>
            </div>
            <ImageTile label="RC Image" url={vehicle.rc_pic_url} />
          </div>
        ) : (
          <p className="py-6 text-center text-[13px] text-slate-500">
            No vehicle has been added yet.
          </p>
        )}
      </div>

      {/* BANK */}
      <div className={card}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className={sectionTitle}>
              <Landmark className="size-5 text-brand-500" />
              Bank Details
            </h3>
            <p className="mt-1 text-xs text-slate-400">Bank account info</p>
          </div>
          <VerifyButton section="bank" done={driver.is_bank_details_verified === true} disabled={!bank} />
        </div>

        {bank ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <Row label="Account Holder">{bank.account_holder_name || '—'}</Row>
              <Row label="Bank Name">{bank.bank_name || '—'}</Row>
              <Row label="Account Number">
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
              </Row>
              <Row label="IFSC Code">{bank.ifsc_code || '—'}</Row>
              <Row label="UPI ID">{bank.upi_id || '—'}</Row>
            </div>
            <ImageTile label="Passbook" url={bank.passbook_pic_url} />
          </div>
        ) : (
          <p className="py-6 text-center text-[13px] text-slate-500">
            No bank details have been submitted yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default DriverReview;
