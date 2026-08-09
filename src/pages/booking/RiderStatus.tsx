import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaUser, FaPhone, FaTruck } from 'react-icons/fa';
import { useBooking } from '../../context/BookingContext';
import { useBookingsHistory } from '../../context/BookingsContext'; // NEW IMPORT
import type { Booking } from '../../types/booking'; // NEW IMPORT

const RiderStatus: React.FC = () => {
  const navigate = useNavigate();
  const { driverDetails, resetBooking, selectedVehicle, pickup, drop, recipient, fare } = useBooking();
  const { addBooking } = useBookingsHistory(); // NEW HOOK

  if (!driverDetails) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <p className="text-gray-600 mb-4">Session expired or booking already completed.</p>
        <button onClick={() => navigate('/')} className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium">Go Home</button>
      </div>
    );
  }

  const handleFinish = () => {
    // 1. Construct the booking object
    const newBooking: Booking = {
      id: `bk_${Date.now()}`,
      status: 'active', // Initially set as active
      pickup,
      drop,
      recipient,
      vehicle: selectedVehicle!,
      fare: fare!,
      driverDetails,
      createdAt: new Date().toISOString()
    };

    // 2. Save to global bookings state
    addBooking(newBooking);

    // 3. Reset the current booking flow state
    resetBooking();

    // 4. Navigate to bookings list
    navigate('/bookings');
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full p-8 text-center">
        <FaCheckCircle className="text-green-600 text-7xl mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Driver Allocated!</h2>
        <p className="text-gray-600 mb-8">Your booking has been confirmed successfully. The driver is on the way.</p>
        
        <div className="bg-green-50 rounded-xl p-5 text-left mb-8 border border-green-100">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Driver Details</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-800">
              <div className="bg-white p-2 rounded-full shadow-sm">
                <FaUser className="text-green-600" />
              </div>
              <span className="font-medium">{driverDetails.driverName}</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-800">
              <div className="bg-white p-2 rounded-full shadow-sm">
                <FaPhone className="text-green-600" />
              </div>
              <span className="font-medium">{driverDetails.driverPhone}</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-800">
              <div className="bg-white p-2 rounded-full shadow-sm">
                <FaTruck className="text-green-600" />
              </div>
              <span className="font-medium">{driverDetails.vehicleNumber} • {selectedVehicle?.name}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleFinish} 
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-500 transition-colors"
        >
          Track Booking
        </button>
      </div>
    </div>
  );
};

export default RiderStatus;