/**
 * Types mirroring the live EZMoov Supabase schema (project icpqdnkbhdavpcaievdz).
 *
 * NOTE: the database currently holds two parallel models. Everything below maps
 * to the *live* one (public.drivers / public.bookings). The `driver.*` and
 * `customer.*` schemas are unused (0 rows) and are deliberately not modelled here.
 * See SUPABASE_SCHEMA.md for the full audit.
 */

export interface DriverRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  profile_pic_url: string | null;
  is_online: boolean | null;
  is_verified: boolean | null;
  is_vehicle_added: boolean | null;
  is_documents_uploaded: boolean | null;
  is_bank_details_added: boolean | null;
  is_vehicle_verified: boolean | null;
  is_documents_verified: boolean | null;
  rating: number | null;
  created_at: string | null;
}

export interface BookingRow {
  id: string;
  customer_id: string;
  customer_phone: string | null;
  driver_id: string | null;
  driver_name: string | null;
  status: string;
  fare: number | null;
  pickup_address: string;
  drop_address: string;
  created_at: string | null;
}

export interface UserRow {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  email: string | null;
  role: 'customer' | 'driver' | 'admin';
  created_at: string | null;
}

/** A customer as rendered in the admin table. */
export interface CustomerView {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  rides: number;
}

/** Where the customer list came from — see adminQueries.fetchCustomers. */
export type CustomerSource = 'users' | 'bookings';

export interface DashboardStats {
  totalCustomers: number;
  totalDrivers: number;
  bookingsToday: number;
  earningsToday: number;
}

export interface DayBookings {
  day: string;
  count: number;
  isToday: boolean;
}

export interface DayEarnings {
  day: string;
  revenue: number;
  label: string;
}

export interface AdminData {
  stats: DashboardStats;
  drivers: DriverRow[];
  customers: CustomerView[];
  customerSource: CustomerSource;
  weeklyBookings: DayBookings[];
  weeklyEarnings: DayEarnings[];
}
