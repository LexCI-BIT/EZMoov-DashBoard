import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaUser, FaTruck, FaMapMarkerAlt } from 'react-icons/fa';
import { useBookingsHistory } from '../../context/BookingsContext'; // Adjust import path as needed!

const CompletedRideDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBookingById } = useBookingsHistory();
  
  const booking = id ? getBookingById(id) : undefined;

  if (!booking || booking.status !== 'completed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <p className="text-gray-600 mb-4">Historical booking not found.</p>
        <button onClick={() => navigate('/bookings')} className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium">Back to Bookings</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white p-4 shadow-sm flex items-center border-b sticky top-0 z-10">
        <FaArrowLeft className="text-gray-800 cursor-pointer mr-4 text-xl" onClick={() => navigate('/bookings')} />
        <h1 className="text-lg font-semibold text-gray-900">Ride History</h1>
        <span className="ml-auto flex items-center gap-2 text-gray-500 font-bold text-sm bg-gray-100 px-3 py-1 rounded-full">
          <FaCheckCircle /> Completed
        </span>
      </header>

      <div className="flex-grow p-4 space-y-6 max-w-md mx-auto w-full pb-8">
        {/* Success Banner */}
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center gap-3">
          <FaCheckCircle className="text-2xl text-green-600" />
          <div>
            <p className="font-semibold">Trip Completed Successfully</p>
            <p className="text-xs text-green-700">Booked on {new Date(booking.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Driver & Vehicle Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Driver & Vehicle</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-50 p-3 rounded-full">
              <FaUser className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{booking.driverDetails.driverName}</p>
              <p className="text-sm text-gray-500">{booking.driverDetails.driverPhone}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
            <div className="bg-green-50 p-3 rounded-full">
              <FaTruck className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{booking.driverDetails.vehicleNumber}</p>
              <p className="text-sm text-gray-500">{booking.vehicle.name}</p>
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Route</h2>
          <div className="flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <div className="w-0.5 h-12 bg-gray-200"></div>
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Pickup</p>
                <p className="text-sm font-medium text-gray-900">{booking.pickup.address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Drop</p>
                <p className="text-sm font-medium text-gray-900">{booking.drop.address}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Recipient</p>
            <p className="text-sm font-medium text-gray-900">{booking.recipient.name} ({booking.recipient.phone})</p>
          </div>
        </div>

        {/* Fare Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Base Fare</span><span>₹{booking.fare.baseFare}</span></div>
            <div className="flex justify-between text-gray-600"><span>Distance ({booking.fare.distanceInKm} km)</span><span>₹{booking.fare.distanceCharge}</span></div>
            <div className="flex justify-between text-gray-600"><span>Taxes</span><span>₹{booking.fare.taxes}</span></div>
            <div className="flex justify-between font-bold text-lg text-gray-900 border-t pt-2 mt-2"><span>Total Paid</span><span>₹{booking.fare.total}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletedRideDetails;