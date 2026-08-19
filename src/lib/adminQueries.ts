import { supabase } from './supabase';
import type {
  ActivityStats,
  AdminData,
  BankDetailsRow,
  BookingRow,
  CustomerDetailData,
  DriverProfileData,
  CustomerSource,
  CustomerView,
  DayBookings,
  DayEarnings,
  DocumentsRow,
  DriverDetail,
  DriverRow,
  UserRow,
  VehicleRow,
  VerifySection,
} from './types';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number): Date {
  const d = startOfToday();
  d.setDate(d.getDate() - n);
  return d;
}

/** Rupee shorthand used by the earnings chart labels. */
export function formatCompactRupees(value: number): string {
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return `₹${Math.round(value)}`;
}

export function formatRupees(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

const DRIVER_COLUMNS =
  'id, name, email, phone, profile_pic_url, is_online, is_verified, is_vehicle_added, is_documents_uploaded, is_bank_details_added, is_vehicle_verified, is_documents_verified, is_bank_details_verified, rating, created_at';

/** All drivers, newest first. */
export async function fetchDrivers(): Promise<DriverRow[]> {
  const { data, error } = await supabase
    .from('drivers')
    .select(DRIVER_COLUMNS)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to load drivers: ${error.message}`);
  return (data ?? []) as DriverRow[];
}

/**
 * Everything the Verify Driver screen shows, in one round trip.
 *
 * vehicles/documents/bank_details are one-row-per-driver in practice but have
 * no unique constraint on driver_id, so this takes the most recent row rather
 * than using .single(), which would throw if a driver ever had two.
 */
export async function fetchDriverDetail(driverId: string): Promise<DriverDetail> {
  const [driverRes, vehicleRes, docsRes, bankRes] = await Promise.all([
    supabase.from('drivers').select(DRIVER_COLUMNS).eq('id', driverId).maybeSingle(),
    supabase
      .from('vehicles')
      .select('id, driver_id, vehicle_number, rc_number, rc_pic_url')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('documents')
      .select(
        'id, driver_id, driving_license_url, aadhaar_url, pan_card_url, selfie_with_vehicle_url, vehicle_rc_url, insurance_url, puc_url, permit_url, fitness_url, police_clearance_url, status'
      )
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('bank_details')
      .select(
        'id, driver_id, account_holder_name, bank_name, account_number, ifsc_code, upi_id, passbook_pic_url'
      )
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false })
      .limit(1),
  ]);

  if (driverRes.error) throw new Error(`Failed to load driver: ${driverRes.error.message}`);
  if (!driverRes.data) throw new Error('Driver not found.');

  return {
    driver: driverRes.data as DriverRow,
    vehicle: (vehicleRes.data?.[0] as VehicleRow) ?? null,
    documents: (docsRes.data?.[0] as DocumentsRow) ?? null,
    bank: (bankRes.data?.[0] as BankDetailsRow) ?? null,
  };
}

/**
 * Approve one section of a driver's application.
 *
 * `is_verified` is derived, not set by hand: a driver counts as verified only
 * once documents, vehicle and bank have all passed. Computing it here from the
 * three flags keeps it from drifting out of sync.
 *
 * NOTE: public.drivers currently has a `USING (true)` RLS policy, so anyone
 * holding the anon key can perform this same update. Tightening that is
 * tracked in SCHEMA-CHANGES.md §1.6.
 */
export async function verifyDriverSection(
  driverId: string,
  section: VerifySection,
  approved = true
): Promise<DriverRow> {
  const column = {
    documents: 'is_documents_verified',
    vehicle: 'is_vehicle_verified',
    bank: 'is_bank_details_verified',
  }[section];

  const { data: current, error: readErr } = await supabase
    .from('drivers')
    .select('is_documents_verified, is_vehicle_verified, is_bank_details_verified')
    .eq('id', driverId)
    .single();

  if (readErr) throw new Error(`Could not read driver state: ${readErr.message}`);

  const next = {
    is_documents_verified: current.is_documents_verified,
    is_vehicle_verified: current.is_vehicle_verified,
    is_bank_details_verified: current.is_bank_details_verified,
    [column]: approved,
  };

  const { data, error } = await supabase
    .from('drivers')
    .update({
      ...next,
      is_verified:
        next.is_documents_verified === true &&
        next.is_vehicle_verified === true &&
        next.is_bank_details_verified === true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', driverId)
    .select(DRIVER_COLUMNS)
    .single();

  if (error) throw new Error(`Failed to update verification: ${error.message}`);
  return data as DriverRow;
}

/**
 * Lifetime ride count and value for one participant.
 *
 * bookings.amount is jsonb, which PostgREST can't sum server-side, so the rows
 * come back and are totalled here. Volumes are small; revisit if that changes.
 */
async function fetchActivityStats(
  column: 'customer_id' | 'driver_id',
  id: string
): Promise<ActivityStats> {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, status, amount')
    .eq(column, id);

  if (error) throw new Error(`Failed to load activity: ${error.message}`);

  const rows = (data ?? []) as BookingRow[];
  return {
    totalRides: rows.length,
    totalValue: rows
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + bookingTotal(b), 0),
  };
}

/** Everything the customer profile screen shows. */
export async function fetchCustomerDetail(userId: string): Promise<CustomerDetailData> {
  const [userRes, addressRes, stats] = await Promise.all([
    supabase
      .from('users')
      .select('id, full_name, phone_number, email, role, created_at')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('saved_addresses')
      .select('address, is_default')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .limit(1),
    fetchActivityStats('customer_id', userId),
  ]);

  if (userRes.error) throw new Error(`Failed to load customer: ${userRes.error.message}`);
  if (!userRes.data) throw new Error('Customer not found.');

  return {
    user: userRes.data as UserRow,
    address: addressRes.data?.[0]?.address ?? null,
    stats,
  };
}

/** Read-only driver profile: identity, activity, verification, vehicle, bank. */
export async function fetchDriverProfile(driverId: string): Promise<DriverProfileData> {
  const [detail, stats] = await Promise.all([
    fetchDriverDetail(driverId),
    fetchActivityStats('driver_id', driverId),
  ]);
  return { ...detail, stats };
}

/** "15 November 2024" — the Member Since format in the design. */
export function formatMemberSince(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Mask all but the last four digits of an account number. */
export function maskAccountNumber(value: string | null | undefined): string {
  if (!value) return '—';
  const trimmed = value.trim();
  if (trimmed.length <= 4) return trimmed;
  return '•'.repeat(Math.min(trimmed.length - 4, 12)) + trimmed.slice(-4);
}

/**
 * Total value of a booking.
 *
 * The numeric `fare` column was dropped and replaced by `amount` (jsonb).
 * Falls back to summing the components if total_price is ever absent.
 */
export function bookingTotal(b: BookingRow): number {
  const a = b.amount;
  if (!a) return 0;

  if (typeof a.total_price === 'number') return a.total_price;

  return (
    Number(a.base_fare ?? 0) +
    Number(a.distance_charges ?? 0) +
    Number(a['taxes_&_gst'] ?? 0) -
    Number(a.discount_amount ?? 0)
  );
}

/** Bookings from the last 7 days — small enough to aggregate client-side. */
export async function fetchRecentBookings(): Promise<BookingRow[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      'id, customer_id, customer_name, customer_phone, driver_id, driver_name, status, amount, service, pickup_address, drop_address, created_at'
    )
    .gte('created_at', daysAgo(6).toISOString())
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to load bookings: ${error.message}`);
  return (data ?? []) as BookingRow[];
}

/** Total booking count, unbounded by date. */
export async function fetchTotalBookingCount(): Promise<number> {
  const { count, error } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true });

  if (error) throw new Error(`Failed to count bookings: ${error.message}`);
  return count ?? 0;
}

/**
 * Customers.
 *
 * Preferred source is public.users (role = 'customer'), but that table's RLS
 * policy is `auth.uid() = id` — an anonymous client sees zero rows. When that
 * happens we fall back to deriving distinct customers from public.bookings,
 * which is currently world-readable. The caller gets `source` so the UI can be
 * honest about where the numbers came from.
 */
export async function fetchCustomers(
  bookings: BookingRow[]
): Promise<{ customers: CustomerView[]; source: CustomerSource }> {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, phone_number, email, role, created_at')
    .eq('role', 'customer')
    .order('created_at', { ascending: false });

  if (!error && data && data.length > 0) {
    const rows = data as UserRow[];
    const customers = rows.map((u) => ({
      id: u.id,
      name: u.full_name?.trim() || 'Unnamed Customer',
      phone: u.phone_number ?? '—',
      email: u.email ?? '—',
      status: 'ACTIVE',
      rides: bookings.filter((b) => b.customer_id === u.id).length,
    }));
    return { customers, source: 'users' };
  }

  // Fallback: distinct customer_id values seen in bookings.
  const byId = new Map<string, CustomerView>();
  for (const b of bookings) {
    // customer_id is nullable now that it's a real uuid FK.
    if (!b.customer_id) continue;
    const existing = byId.get(b.customer_id);
    if (existing) {
      existing.rides += 1;
      if (existing.phone === '—' && b.customer_phone) existing.phone = b.customer_phone;
    } else {
      byId.set(b.customer_id, {
        id: b.customer_id,
        name: b.customer_name?.trim() || b.customer_id,
        phone: b.customer_phone ?? '—',
        email: '—',
        status: 'ACTIVE',
        rides: 1,
      });
    }
  }

  return { customers: [...byId.values()], source: 'bookings' };
}

/** Bookings per day for the trailing 7 days, oldest first. */
function buildWeeklyBookings(bookings: BookingRow[]): DayBookings[] {
  const todayKey = startOfToday().toDateString();
  const buckets: DayBookings[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = daysAgo(i);
    buckets.push({
      day: DAY_LABELS[d.getDay()],
      count: 0,
      isToday: d.toDateString() === todayKey,
    });
  }

  for (const b of bookings) {
    if (!b.created_at) continue;
    const created = new Date(b.created_at);
    created.setHours(0, 0, 0, 0);
    const offset = Math.round((startOfToday().getTime() - created.getTime()) / 86_400_000);
    const idx = 6 - offset;
    if (idx >= 0 && idx < 7) buckets[idx].count += 1;
  }

  return buckets;
}

/** Completed-booking revenue per day for the trailing 7 days, oldest first. */
function buildWeeklyEarnings(bookings: BookingRow[]): DayEarnings[] {
  const buckets: DayEarnings[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = daysAgo(i);
    buckets.push({ day: DAY_LABELS[d.getDay()], revenue: 0, label: '₹0' });
  }

  for (const b of bookings) {
    if (!b.created_at || b.status !== 'completed') continue;
    const created = new Date(b.created_at);
    created.setHours(0, 0, 0, 0);
    const offset = Math.round((startOfToday().getTime() - created.getTime()) / 86_400_000);
    const idx = 6 - offset;
    if (idx >= 0 && idx < 7) buckets[idx].revenue += bookingTotal(b);
  }

  for (const bucket of buckets) bucket.label = formatCompactRupees(bucket.revenue);
  return buckets;
}

/** One call that populates the whole admin dashboard. */
export async function fetchAdminData(): Promise<AdminData> {
  const [drivers, bookings] = await Promise.all([fetchDrivers(), fetchRecentBookings()]);
  const { customers, source } = await fetchCustomers(bookings);

  const todayStart = startOfToday().getTime();
  const todaysBookings = bookings.filter(
    (b) => b.created_at && new Date(b.created_at).getTime() >= todayStart
  );

  const earningsToday = todaysBookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + bookingTotal(b), 0);

  return {
    stats: {
      totalCustomers: customers.length,
      totalDrivers: drivers.length,
      bookingsToday: todaysBookings.length,
      earningsToday,
    },
    drivers,
    customers,
    customerSource: source,
    weeklyBookings: buildWeeklyBookings(bookings),
    weeklyEarnings: buildWeeklyEarnings(bookings),
  };
}

/** Verification state derived from the driver's boolean flags. */
export function driverStatus(d: DriverRow): 'VERIFIED' | 'PENDING' {
  return d.is_verified ? 'VERIFIED' : 'PENDING';
}
