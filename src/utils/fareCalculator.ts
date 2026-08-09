import type { FareBreakdown, LocationPoint, Vehicle } from '../types/booking';

// Haversine formula to calculate distance between two coordinates
export const calculateDistance = (point1: LocationPoint, point2: LocationPoint): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(point2.lat - point1.lat);
  const dLon = deg2rad(point2.lng - point1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const calculateFareLogic = (distance: number, vehicle: Vehicle): FareBreakdown => {
  const baseFare = vehicle.baseFare;
  const distanceCharge = Math.round(distance * vehicle.perKmRate * 100) / 100;
  const subtotal = baseFare + distanceCharge;
  const taxes = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST mock
  const total = Math.round((subtotal + taxes) * 100) / 100;

  return {
    baseFare,
    distanceCharge,
    taxes,
    total,
    distanceInKm: distance,
  };
};