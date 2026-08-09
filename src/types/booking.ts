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
// export type BookingStatus = 'idle' | 'selecting_vehicle' | 'viewing_fare' | 'searching_driver' | 'driver_assigned';

// Add these to your existing types/booking.ts file
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
}
// Add these two optional fields to your existing Booking interface
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
  
  // NEW: Optional fields for Shifting Experts Survey
  surveyDate?: string;
  surveyTime?: string;
}