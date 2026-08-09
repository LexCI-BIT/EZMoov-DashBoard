import React, { createContext, useContext, useState } from 'react';
import type {
  ActiveInput,
  BookingFlowStatus,
  FareBreakdown,
  LocationInfo,
  RecipientInfo,
  Vehicle,
} from '../types/booking';

type DriverDetails = { driverName: string; driverPhone: string; vehicleNumber: string };

interface BookingContextType {
  pickup: LocationInfo;
  drop: LocationInfo;
  recipient: RecipientInfo;
  activeInput: ActiveInput;
  selectedVehicle: Vehicle | null;
  fare: FareBreakdown | null;
  /** Current step of the booking wizard — FareDetails drives this. */
  status: BookingFlowStatus;
  driverDetails: DriverDetails | null;
  setPickup: (loc: LocationInfo) => void;
  setDrop: (loc: LocationInfo) => void;
  setRecipient: (rec: RecipientInfo) => void;
  setActiveInput: (inp: ActiveInput) => void;
  setSelectedVehicle: (veh: Vehicle | null) => void;
  setFare: (fare: FareBreakdown | null) => void;
  setStatus: (status: BookingFlowStatus) => void;
  setDriverDetails: (det: DriverDetails | null) => void;
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
  const [activeInput, setActiveInput] = useState<ActiveInput>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [fare, setFare] = useState<FareBreakdown | null>(null);
  const [status, setStatus] = useState<BookingFlowStatus>('idle');
  const [driverDetails, setDriverDetails] = useState<DriverDetails | null>(null);

  const resetBooking = () => {
    setPickup({ address: '', coordinates: null });
    setDrop({ address: '', coordinates: null });
    setRecipient({ name: '', phone: '' });
    setActiveInput(null);
    setSelectedVehicle(null);
    setFare(null);
    setStatus('idle');
    setDriverDetails(null);
  };

  return (
    <BookingContext.Provider value={{
      pickup, drop, recipient, activeInput, selectedVehicle, fare, status, driverDetails,
      setPickup, setDrop, setRecipient, setActiveInput, setSelectedVehicle, setFare, setStatus,
      setDriverDetails, resetBooking
    }}>
      {children}
    </BookingContext.Provider>
  );
};