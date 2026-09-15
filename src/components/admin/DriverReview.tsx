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
  Hash,
  UserCircle,
  Code,
  CreditCard,
  XCircle,
  Send,
  X,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import {
  fetchDriverDetail,
  maskAccountNumber,
  verifyDriverSection,
  acceptAllDriverVerification,
  rejectAllDriverVerification,
  driverStatus,
  deleteDriver,
} from '../../lib/adminQueries';
import type { DriverDetail, VerifySection } from '../../lib/types';
import { toast } from 'react-toastify';

interface DriverReviewProps {
  driverId: string;
  onBack: () => void;
  /** Lets the parent list refresh its counts after an approval. */
  onChanged?: () => void;
}

const card = 'rounded-2xl border border-line bg-ink-850 p-4 sm:p-6';
const sectionTitle = 'flex items-center gap-2 text-base font-bold text-white sm:text-lg';

const PRESET_REASONS = [
  'Documents unreadable or blurry',
  'Driving Licence expired or invalid',
  'Vehicle RC number mismatch',
  'Bank account / IFSC details incorrect',
  'Selfie with vehicle missing or unclear',
];

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

const Row: React.FC<{ label: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ label, children, icon }) => (
  <div className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-0">
    <div className="flex items-center gap-2.5 shrink-0 text-[13px] text-slate-400">
      {icon && <span className="text-slate-500">{icon}</span>}
      <span>{label}</span>
    </div>
    <span className="min-w-0 truncate text-right text-[13px] font-semibold text-slate-100">
      {children}
    </span>
  </div>
);

const StatusChip: React.FC<{ status: 'VERIFIED' | 'PENDING' | 'REJECTED' }> = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide ${
      status === 'VERIFIED'
        ? 'border-brand-500/20 bg-brand-500/10 text-brand-500'
        : status === 'REJECTED'
        ? 'border-red-500/20 bg-red-500/10 text-red-400'
        : 'border-amber-500/20 bg-amber-500/10 text-amber-500'
    }`}
  >
    {status === 'VERIFIED' ? (
      <CheckCircle2 className="size-3" />
    ) : status === 'REJECTED' ? (
      <XCircle className="size-3" />
    ) : (
      <Hourglass className="size-3" />
    )}
    {status}
  </span>
);

export const DriverReview: React.FC<DriverReviewProps> = ({ driverId, onBack, onChanged }) => {
  const [detail, setDetail] = useState<DriverDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<VerifySection | null>(null);
  const [showAccount, setShowAccount] = useState(false);

  const [actionProcessing, setActionProcessing] = useState<'accept' | 'reject' | 'delete' | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

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
    if (saving || actionProcessing) return;
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

  const handleAcceptAll = async () => {
    if (actionProcessing || saving) return;
    setActionProcessing('accept');
    try {
      const updated = await acceptAllDriverVerification(driverId);
      setDetail((prev) => (prev ? { ...prev, driver: updated } : prev));
      setError(null);
      toast.success('Driver verification accepted! Automated approval notification sent to driver.');
      onChanged?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Accept failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setActionProcessing(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (actionProcessing || saving) return;
    setActionProcessing('reject');
    try {
      const updated = await rejectAllDriverVerification(driverId, rejectReason);
      setDetail((prev) => (prev ? { ...prev, driver: updated } : prev));
      setError(null);
      toast.warn('Driver verification rejected. Automated notification sent to driver for document resubmission.');
      setShowRejectModal(false);
      setRejectReason('');
      onChanged?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Reject failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setActionProcessing(null);
    }
  };

  const handleDeleteDriverConfirm = async () => {
    if (actionProcessing || saving) return;
    setActionProcessing('delete');
    try {
      await deleteDriver(driverId);
      toast.success('Driver account deleted. Partner App access revoked.');
      setShowDeleteModal(false);
      onChanged?.();
      onBack();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Delete failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setActionProcessing(null);
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

  const verifiedSectionsCount = steps.filter((s) => s.done).length;
  const allSectionsVerified = verifiedSectionsCount === 3;

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
        <StatusChip status={driverStatus(driver)} />
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
              <Row label="Vehicle Number" icon={<Hash className="size-4" />}>{vehicle.vehicle_number || '—'}</Row>
              <Row label="RC Number" icon={<FileText className="size-4" />}>{vehicle.rc_number || '—'}</Row>
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
              <Row label="Account Holder" icon={<UserCircle className="size-4" />}>{bank.account_holder_name || '—'}</Row>
              <Row label="Bank Name" icon={<Landmark className="size-4" />}>{bank.bank_name || '—'}</Row>
              <Row label="Account Number" icon={<Hash className="size-4" />}>
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
              <Row label="IFSC Code" icon={<Code className="size-4" />}>{bank.ifsc_code || '—'}</Row>
              <Row label="UPI ID" icon={<CreditCard className="size-4" />}>{bank.upi_id || '—'}</Row>
            </div>
            <ImageTile label="Passbook" url={bank.passbook_pic_url} />
          </div>
        ) : (
          <p className="py-6 text-center text-[13px] text-slate-500">
            No bank details have been submitted yet.
          </p>
        )}
      </div>

      {/* BOTTOM-RIGHT DRIVER VERIFICATION CONTROL BAR */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-line bg-[#0F141C]/95 p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-md sm:bottom-8 sm:right-8 sm:p-4">
        <div className="flex flex-col pr-2 text-left">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Section Verification
          </span>
          <span className={`text-xs font-bold ${allSectionsVerified ? 'text-brand-400' : 'text-amber-400'}`}>
            {verifiedSectionsCount}/3 Sections Verified
          </span>
        </div>

        <button
          onClick={handleAcceptAll}
          disabled={!allSectionsVerified || actionProcessing !== null}
          title={
            allSectionsVerified
              ? 'Accept driver verification & send approval notification'
              : 'Please verify all 3 sections above (Documents, Vehicle, Bank) before accepting'
          }
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition sm:text-sm ${
            allSectionsVerified
              ? 'bg-brand-500 text-[#05291D] shadow-[0_4px_16px_rgba(16,185,129,0.4)] hover:bg-brand-400 hover:scale-[1.02] active:scale-[0.98]'
              : 'cursor-not-allowed border border-line bg-ink-800 text-slate-500 opacity-60'
          }`}
        >
          {actionProcessing === 'accept' ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          <span>Accept</span>
        </button>

        <button
          onClick={() => setShowRejectModal(true)}
          disabled={actionProcessing !== null}
          title="Reject documents if missing or mismatching, & request resubmission"
          className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-2.5 text-xs font-bold text-red-300 shadow-md transition hover:bg-red-500/25 hover:text-red-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 sm:text-sm"
        >
          {actionProcessing === 'reject' ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <XCircle className="size-4" />
          )}
          <span>Reject</span>
        </button>

        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={actionProcessing !== null}
          title="Delete driver account permanently & revoke partner app access"
          className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-950/50 px-3.5 py-2.5 text-xs font-bold text-red-400 shadow-md transition hover:bg-red-900/70 hover:text-red-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 sm:text-sm"
        >
          {actionProcessing === 'delete' ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-line bg-[#121824] p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
                  <AlertTriangle className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Delete Driver Account</h3>
                  <p className="text-xs text-slate-400">Revoke partner app access permanently</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="mb-6 text-xs leading-relaxed text-slate-300">
              Are you sure you want to delete <strong className="text-white">{driver.name || 'this driver'}</strong>? This will permanently delete their account and revoke access to the EZMoov Partner App.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={actionProcessing !== null}
                className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDriverConfirm}
                disabled={actionProcessing !== null}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-red-500 active:scale-[0.98] disabled:opacity-50"
              >
                {actionProcessing === 'delete' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-line bg-[#121824] p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
                  <AlertTriangle className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Reject Driver Verification</h3>
                  <p className="text-xs text-slate-400">
                    Send automated resubmission notification to {driver.name || 'Driver'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-xs font-semibold text-slate-300">
                Select or enter rejection reason:
              </label>
              <div className="mb-3 flex flex-wrap gap-2">
                {PRESET_REASONS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectReason(preset)}
                    className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                      rejectReason === preset
                        ? 'border-red-500 bg-red-500/20 font-semibold text-red-200'
                        : 'border-line bg-ink-900 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Specify what needs correction (e.g. Driving License image is blurry, please re-upload clear photo)..."
                className="w-full rounded-xl border border-line bg-ink-950 p-3 text-xs text-white placeholder:text-slate-600 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={actionProcessing !== null}
                className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={actionProcessing !== null}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-red-500 active:scale-[0.98] disabled:opacity-50"
              >
                {actionProcessing === 'reject' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
                <span>Reject &amp; Trigger Notification</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverReview;
