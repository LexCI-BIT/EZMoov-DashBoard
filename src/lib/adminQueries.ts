import { supabase } from './supabase';
import type {
  AdminData,
  BookingRow,
  CustomerSource,
  CustomerView,
  DayBookings,
  DayEarnings,
  DriverRow,
  UserRow,
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

/** All drivers, newest first. */
export async function fetchDrivers(): Promise<DriverRow[]> {
  const { data, error } = await supabase
    .from('drivers')
    .select(
      'id, name, email, phone, profile_pic_url, is_online, is_verified, is_vehicle_added, is_documents_uploaded, is_bank_details_added, is_vehicle_verified, is_documents_verified, rating, created_at'
    )
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to load drivers: ${error.message}`);
  return (data ?? []) as DriverRow[];
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
