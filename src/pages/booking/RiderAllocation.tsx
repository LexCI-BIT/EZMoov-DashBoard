import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaMapMarkerAlt } from 'react-icons/fa';
import { useBooking } from '../../context/BookingContext';
import { confirmBooking } from '../../services/apiService';
import type { BookingPayload } from '../../types/booking';

const RiderAllocation: React.FC = () => {
  const navigate = useNavigate();
  const { pickup, drop, recipient, selectedVehicle, fare, setDriverDetails } = useBooking();
  const [error, setError] = useState('');

  useEffect(() => {
    // Safety redirect
    if (!selectedVehicle || !fare) {
      navigate('/services/standard-parcel-delivery');
      return;
    }

    const allocateDriver = async () => {
      try {
        const payload: BookingPayload = {
          pickup, drop, recipient, vehicle: selectedVehicle, fare
        };
        
        // Simulate API call to backend
        const driver = await confirmBooking(payload);
        setDriverDetails(driver);
        
        // Navigate to success page once driver is allocated
        navigate('/booking/rider-status', { replace: true });
      } catch (err) {
        setError('Failed to allocate driver. Please try again.');
      }
    };

    allocateDriver();
  }, []); // Run only once on mount

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <FaMapMarkerAlt className="text-green-600 text-6xl" />
        <FaSpinner className="animate-spin text-green-500 text-2xl absolute -bottom-2 -right-2 bg-white rounded-full p-1 border-2 border-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Finding nearby drivers...</h2>
      <p className="text-gray-600 max-w-xs">We are connecting you with the best rider for your Standard Parcel Delivery.</p>
      
      {error && (
        <div className="mt-6 text-red-600 bg-red-50 px-4 py-2 rounded-lg text-sm">
          {error}
          <button onClick={() => navigate(-1)} className="ml-2 font-bold underline">Go Back</button>
        </div>
      )}
    </div>
  );
};

export default RiderAllocation;