import React, { createContext, useContext, useState } from 'react';
import type { ActiveInput, FareBreakdown, LocationInfo, RecipientInfo, Vehicle } from '../types/booking';

interface BookingContextType {
  pickup: LocationInfo;
  drop: LocationInfo;
  recipient: RecipientInfo;
  activeInput: ActiveInput; // <-- ADD THIS BACK
  selectedVehicle: Vehicle | null;
  fare: FareBreakdown | null;
  driverDetails: { driverName: string; driverPhone: string; vehicleNumber: string } | null;
  setPickup: (loc: LocationInfo) => void;
  setDrop: (loc: LocationInfo) => void;
  setRecipient: (rec: RecipientInfo) => void;
  setActiveInput: (inp: ActiveInput) => void; // <-- ADD THIS BACK
  setSelectedVehicle: (veh: Vehicle | null) => void;
  setFare: (fare: FareBreakdown | null) => void;
  setDriverDetails: (det: any) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pickup, setPickup] = useState<LocationInfo>({ address: '', coordinates: null });
  const [drop, setDrop] = useState<LocationInfo>({ address: '', coordinates: null });
  const [recipient, setRecipient] = useState<RecipientInfo>({ name: '', phone: '' });
  const [activeInput, setActiveInput] = useState<ActiveInput>(null); // <-- ADD THIS BACK
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [fare, setFare] = useState<FareBreakdown | null>(null);
  const [driverDetails, setDriverDetails] = useState<any>(null);

  const resetBooking = () => {
    setPickup({ address: '', coordinates: null });
    setDrop({ address: '', coordinates: null });
    setRecipient({ name: '', phone: '' });
    setActiveInput(null); // <-- ADD THIS BACK
    setSelectedVehicle(null);
    setFare(null);
    setDriverDetails(null);
  };

  return (
    <BookingContext.Provider value={{
      pickup, drop, recipient, activeInput, selectedVehicle, fare, driverDetails,
      setPickup, setDrop, setRecipient, setActiveInput, setSelectedVehicle, setFare, setDriverDetails,
      resetBooking
    }}>
      {children}
    </BookingContext.Provider>
  );
};