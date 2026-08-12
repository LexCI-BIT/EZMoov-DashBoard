import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { useBooking } from '../../context/BookingContext';
import { calculateFare, confirmBooking } from '../../services/apiService';
import type { BookingPayload } from '../../types/booking';

const FareDetails: React.FC = () => {
  const { pickup, drop, recipient, selectedVehicle, fare, setFare, setStatus, setDriverDetails } = useBooking();
  const [loadingFare, setLoadingFare] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const getFare = async () => {
      if (selectedVehicle) {
        setLoadingFare(true);
        const distance = 10; // Mocked from previous step, or fetch again
        const calculatedFare = await calculateFare(selectedVehicle, distance);
        setFare(calculatedFare);
        setLoadingFare(false);
      }
    };
    getFare();
  }, [selectedVehicle]);

  const handleConfirmBooking = async () => {
    setIsConfirming(true);
    setStatus('searching_driver');

    const payload: BookingPayload = {
      pickup, drop, recipient, vehicle: selectedVehicle!, fare: fare!
    };
    
    // Simulate API call to backend
    const driver = await confirmBooking(payload);
    
    setDriverDetails(driver);
    setStatus('driver_assigned');
    setIsConfirming(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Fare Details</h2>
          {!isConfirming && (
            <FaTimes className="text-gray-500 cursor-pointer hover:text-gray-800" onClick={() => setStatus('idle')} />
          )}
        </div>

        {loadingFare ? (
          <div className="p-10 text-center text-gray-500">Calculating fare...</div>
        ) : (
          <>
            <div className="p-4 space-y-4 flex-grow overflow-y-auto">
              {/* Route Summary */}
              <div className="bg-green-50 p-4 rounded-lg space-y-2">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    <div className="w-0.5 h-6 bg-gray-300"></div>
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="text-gray-800 font-medium truncate">{pickup.address}</p>
                    <p className="text-gray-800 font-medium truncate mt-3">{drop.address}</p>
                  </div>
                </div>
                <div className="border-t border-green-200 pt-2 mt-2">
                  <p className="text-sm font-semibold text-gray-900">Vehicle: {selectedVehicle?.name}</p>
                  <p className="text-xs text-gray-500">Recipient: {recipient.name} ({recipient.phone})</p>
                </div>
              </div>

              {/* Fare Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Base Fare</span>
                  <span>₹{fare?.baseFare}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Distance Charge ({fare?.distanceInKm} km)</span>
                  <span>₹{fare?.distanceCharge}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-gray-900 border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>₹{fare?.total}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t">
              <button
                onClick={handleConfirmBooking}
                disabled={isConfirming}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-500 transition-colors flex items-center justify-center"
              >
                {isConfirming ? (
                  <><FaSpinner className="animate-spin mr-2" /> Finding Driver...</>
                ) : (
                  `Confirm Booking • ₹${fare?.total}`
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FareDetails;