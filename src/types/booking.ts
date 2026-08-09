export interface Coordinates {
  lat: number;
  lng: number;
}
export interface LocationPoint {
  lat: number;
  lng: number;
}

export interface LocationInfo {
  address: string;
  coordinates: Coordinates | null;
}

export interface RecipientInfo {
  name: string;
  phone: string;
}

export interface Vehicle {
  id: string;
  name: string;
  capacity: string;
  description: string;
  baseFare: number;
  perKmRate: number;
  icon: string;
}

export interface FareBreakdown {
  baseFare: number;
  distanceCharge: number;
  taxes: number;
  total: number;
  distanceInKm: number;
}

export interface BookingPayload {
  pickup: LocationInfo;
  drop: LocationInfo;
  recipient: RecipientInfo;
  vehicle: Vehicle;
  fare: FareBreakdown;
}

export type ActiveInput = 'pickup' | 'drop' | null;

/**
 * Where the user is in the live booking wizard. Distinct from BookingStatus,
 * which describes a booking that already exists in history.
 */
export type BookingFlowStatus =
  | 'idle'
  | 'selecting_vehicle'
  | 'viewing_fare'
  | 'searching_driver'
  | 'driver_assigned';

/** Lifecycle state of a saved booking. */
export type BookingStatus = 'active' | 'completed';

export interface Booking {
  id: string;
  status: BookingStatus;
  pickup: LocationInfo;
  drop: LocationInfo;
  recipient: RecipientInfo;
  vehicle: Vehicle;
  fare: FareBreakdown;
  driverDetails: {
    driverName: string;
    driverPhone: string;
    vehicleNumber: string;
  };
  createdAt: string;

  // Optional fields for the Shifting Experts survey
  surveyDate?: string;
  surveyTime?: string;
}