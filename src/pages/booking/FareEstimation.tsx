import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { useBooking } from '../../context/BookingContext';
import { calculateFare } from '../../services/apiService';

const FareEstimation: React.FC = () => {
  const navigate = useNavigate();
  const { pickup, drop, recipient, selectedVehicle, fare, setFare } = useBooking();
  const [loadingFare, setLoadingFare] = useState(!fare);

  useEffect(() => {
    // Safety redirect
    if (!selectedVehicle || !pickup.address) {
      navigate('/services/standard-parcel-delivery');
      return;
    }

    const getFare = async () => {
      if (!fare) {
        setLoadingFare(true);
        // Re-fetch distance implicitly by calculating fare again (mocked)
        // In a real app, you'd pass the actual distance calculated prior
        const distance = 10; // Mocked distance continuation
        const calculatedFare = await calculateFare(selectedVehicle, distance);
        setFare(calculatedFare);
        setLoadingFare(false);
      }
    };
    getFare();
  }, [selectedVehicle, pickup, fare, setFare, navigate]);

  const handleConfirmBooking = () => {
    navigate('/booking/rider-allocation');
  };

  if (loadingFare || !fare || !selectedVehicle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
        <FaSpinner className="animate-spin text-green-600 text-3xl mb-3" />
        <p>Calculating fare...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white p-4 shadow-sm flex items-center border-b sticky top-0 z-10">
        <FaArrowLeft className="text-gray-800 cursor-pointer mr-4 text-xl" onClick={() => navigate(-1)} />
        <h1 className="text-lg font-semibold text-gray-900">Fare Estimation</h1>
      </header>

      <div className="flex-grow p-4 space-y-6 max-w-md mx-auto w-full">
        {/* Route Summary */}
        <div className="bg-green-50 p-4 rounded-lg space-y-2 border border-green-100">
          <div className="flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <div className="w-2 h-2 rounded-full bg-green-600"></div>
              <div className="w-0.5 h-8 bg-gray-300"></div>
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
            </div>
            <div className="flex-1 text-sm">
              <p className="text-gray-800 font-medium">{pickup.address}</p>
              <p className="text-gray-800 font-medium mt-4">{drop.address}</p>
            </div>
          </div>
          <div className="border-t border-green-200 pt-3 mt-2">
            <p className="text-sm font-semibold text-gray-900">Vehicle: {selectedVehicle.name}</p>
            <p className="text-xs text-gray-500">Recipient: {recipient.name} ({recipient.phone})</p>
          </div>
        </div>

        {/* Fare Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Base Fare</span>
            <span>₹{fare.baseFare}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Distance Charge ({fare.distanceInKm} km)</span>
            <span>₹{fare.distanceCharge}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Taxes & Fees</span>
            <span>₹{fare.taxes}</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-gray-900 border-t pt-3 mt-3">
            <span>Total Payable</span>
            <span>₹{fare.total}</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t sticky bottom-0">
        <div className="max-w-md mx-auto w-full">
          <button
            onClick={handleConfirmBooking}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-500 transition-colors"
          >
            Confirm Booking • ₹{fare.total}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FareEstimation;