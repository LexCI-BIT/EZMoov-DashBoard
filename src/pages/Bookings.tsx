import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { useBookingsHistory } from '../context/BookingsContext';
import { useAuth } from '../context/AuthContext';

const Bookings: React.FC = () => {
  const { bookings } = useBookingsHistory();
  const { user } = useAuth();
  const navigate = useNavigate();

  // If accessed directly via URL without auth
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-12 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-extrabold text-gray-900">Your Bookings</h1>
        <p className="mt-4 text-lg text-gray-600">Please log in to view your active and completed trips.</p>
        <Link to="/login" className="mt-8 bg-green-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-500 transition-colors">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900">Your Bookings</h1>
          <p className="mt-4 text-lg text-gray-600">View your active and completed trips.</p>
        </div>

        <div className="space-y-6 max-w-3xl mx-auto">
          {bookings.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No bookings found. Book a ride to see it here!</p>
          ) : (
            bookings.map((booking) => (
              <div 
                key={booking.id} 
                onClick={() => navigate(`/bookings/${booking.status}/${booking.id}`)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{booking.vehicle.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      booking.status === 'active' 
                        ? 'bg-green-100 text-green-700 animate-pulse' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center text-gray-600 text-sm gap-2 sm:gap-6">
                    <span className="flex items-center gap-2">
                      <FaCalendarAlt className="text-green-500" /> {new Date(booking.createdAt).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-2 truncate">
                      <FaMapMarkerAlt className="text-green-500 flex-shrink-0" /> 
                      <span className="truncate">{booking.pickup.address} to {booking.drop.address}</span>
                    </span>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-gray-500">Total Fare</p>
                  <p className="text-xl font-bold text-green-600">₹{booking.fare.total}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Bookings;