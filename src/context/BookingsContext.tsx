import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Booking, BookingStatus } from '../types/booking';

interface BookingsContextType {
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  getBookingById: (id: string) => Booking | undefined;
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);
const STORAGE_KEY = 'ezmoov_bookings';

export const useBookingsHistory = () => {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error('useBookingsHistory must be used within BookingsProvider');
  return ctx;
};

export const BookingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Load from storage on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setBookings(JSON.parse(stored));
    } catch (error) {
      console.error('Failed to load bookings', error);
    }
  }, []);

  // Save to storage whenever bookings change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }, [bookings]);

  const addBooking = (booking: Booking) => {
    setBookings((prev) => [booking, ...prev]);
  };

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    setBookings((prev) => 
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  };

  const getBookingById = (id: string) => bookings.find((b) => b.id === id);

  return (
    <BookingsContext.Provider value={{ bookings, addBooking, updateBookingStatus, getBookingById }}>
      {children}
    </BookingsContext.Provider>
  );
};