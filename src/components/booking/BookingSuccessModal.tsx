export interface Coordinates {
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
export type BookingStatus = 'idle' | 'selecting_vehicle' | 'viewing_fare' | 'searching_driver' | 'driver_assigned';