import React from 'react';
import { Link } from 'react-router-dom';
import { FaTruck, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    // {/* 
    //   min-h-[calc(100vh-4rem)] makes it 100% of the screen height minus 4rem (standard navbar height).
    //   flex items-center justify-center centers the content vertically and horizontally.
    // */}
    <div className="bg-green-50 min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
        {/* Updated Icon Here */}
        <FaTruck className="text-6xl text-green-600 mx-auto mb-6" />
        
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
          Welcome to <span className="text-green-600">EZMoov</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Your seamless ride-booking platform. Fast, reliable, and secure. 
          Book your next ride with just a few taps.
        </p>
        {user ? (
          <Link 
            to="/services" 
            className="inline-flex items-center gap-2 bg-green-600 text-white hover:bg-green-500 px-8 py-3 rounded-md text-base font-medium transition-colors shadow-sm"
          >
            View Services <FaArrowRight />
          </Link>
        ) : (
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 bg-green-600 text-white hover:bg-green-500 px-8 py-3 rounded-md text-base font-medium transition-colors shadow-sm"
          >
            Get Started <FaArrowRight />
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home;