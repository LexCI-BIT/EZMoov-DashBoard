import React from 'react';
import { Link } from 'react-router-dom';
import { FaTruck, FaSpinner } from 'react-icons/fa'; // Changed FaCarSide to FaTruck
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, loading } = useAuth();

  return (
    <nav className="sticky top-0 z-40 bg-white shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-green-600 font-bold text-xl">
            {/* Updated Icon Here */}
            <FaTruck className="text-2xl" />
            <span>EZMoov</span>
          </Link>

          {/* Right Side Items */}
          <div className="flex items-center gap-4 sm:gap-6">
            {loading ? (
              <FaSpinner className="animate-spin text-green-600 text-xl" />
            ) : user ? (
              <>
                <Link to="/services" className="text-gray-600 hover:text-green-600 text-sm sm:text-base font-medium transition-colors">
                  Services
                </Link>
                <Link to="/bookings" className="text-gray-600 hover:text-green-600 text-sm sm:text-base font-medium transition-colors">
                  Bookings
                </Link>
                <Link to="/profile" className="text-gray-600 hover:text-green-600 text-sm sm:text-base font-medium transition-colors">
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="bg-green-600 text-white hover:bg-green-500 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;