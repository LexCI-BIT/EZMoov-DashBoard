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
  category: 'Two-Wheelers' | 'Three-Wheelers' | 'Mini Trucks' | 'Medium/Large Trucks';
  capacity: string;
  description: string; // Holds the size info
  baseFare: number;    // Fixed price for 0-3 km
  perKmRate: number;   // Price per km after 3 km
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

export type BookingFlowStatus =
  | 'idle'
  | 'selecting_vehicle'
  | 'viewing_fare'
  | 'searching_driver'
  | 'driver_assigned';

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
  surveyDate?: string;
  surveyTime?: string;
}