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
  is_bank_details_verified: boolean | null;
  rating: number | null;
  created_at: string | null;
  latitude?: number | null;
  longitude?: number | null;
  last_location_update?: string | null;
}

export interface VehicleRow {
  id: string;
  driver_id: string;
  vehicle_number: string;
  rc_number: string;
  rc_pic_url: string | null;
}

export interface DocumentsRow {
  id: string;
  driver_id: string;
  // Identity / licensing
  driving_license_url: string | null;
  aadhaar_url: string | null;
  pan_card_url: string | null;
  selfie_with_vehicle_url: string | null;
  // Vehicle paperwork
  vehicle_rc_url: string | null;
  insurance_url: string | null;
  puc_url: string | null;
  permit_url: string | null;
  fitness_url: string | null;
  police_clearance_url: string | null;
  status: string | null;
}

export interface BankDetailsRow {
  id: string;
  driver_id: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string | null;
  passbook_pic_url: string | null;
}

/** Everything the Verify Driver screen needs, in one shape. */
export interface DriverDetail {
  driver: DriverRow;
  vehicle: VehicleRow | null;
  documents: DocumentsRow | null;
  bank: BankDetailsRow | null;
}

/** Which of the three sections a Verify button acts on. */
export type VerifySection = 'documents' | 'vehicle' | 'bank';

/** Lifetime totals shown in the Activity Summary panels. */
export interface ActivityStats {
  totalRides: number;
  totalValue: number;
}

export interface CustomerDetailData {
  user: UserRow;
  /**
   * Null whenever saved_addresses is unreadable. Its RLS policy is
   * `auth.uid() = user_id`, so an admin cannot see anyone else's address —
   * the UI says so rather than showing a blank.
   */
  address: string | null;
  stats: ActivityStats;
}

export interface DriverProfileData extends DriverDetail {
  stats: ActivityStats;
}

/**
 * The fare breakdown, stored as jsonb in bookings.amount.
 * Note the '&' in the tax key — it comes from the writer and has to be
 * quoted in SQL, so prefer reading it through bookingTotal() below.
 */
export interface BookingAmount {
  base_fare?: number;
  distance_charges?: number;
  'taxes_&_gst'?: number;
  discount_amount?: number;
  promo_code?: string;
  total_price?: number;
}

export interface BookingRow {
  id: string;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  driver_id: string | null;
  driver_name: string | null;
  status: string;
  /** Replaced the old numeric `fare` column. */
  amount: BookingAmount | null;
  /** standard_parcel | local_adda | bidding_outstation | shifting_experts | null */
  service: string | null;
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
