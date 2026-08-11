import React from 'react';
import { Link } from 'react-router-dom';
import { FaTruck, FaArrowRight } from 'react-icons/fa';
// Import your image here (Make sure the path matches your folder structure)
import homepageImage from '../assets/homepage.png'; 

const Home: React.FC = () => {
  return (
    <div 
      className="h-[calc(100vh-4rem)] w-full flex items-center justify-center overflow-hidden relative bg-cover bg-center p-4"
      style={{ backgroundImage: `url(${homepageImage})` }}
    >
      {/* Dark overlay slightly increased to keep text readable over a transparent card */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Liquid Transparent Card - More Transparent */}
      <div className="relative w-[90%] max-w-md sm:max-w-xl md:max-w-2xl p-6 sm:p-8 md:p-10 text-center rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/0 backdrop-blur-xl shadow-2xl">
        
        {/* Responsive Icon */}
        <FaTruck className="text-5xl sm:text-6xl text-green-400 drop-shadow-md mx-auto mb-4 sm:mb-6" />
        
        {/* Responsive Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-3 sm:mb-4">
          Welcome to <span className="text-green-400">EZMoov</span>
        </h1>
        
        {/* Responsive Paragraph */}
        <p className="text-sm sm:text-base md:text-lg text-gray-100/90 max-w-xl mx-auto mb-6 sm:mb-8 drop-shadow">
          Your seamless ride-booking platform. Fast, reliable, and secure. 
          Book your next ride with just a few taps.
        </p>
        
        {/* Responsive Buttons - Now visible to everyone */}
        <Link 
          to="/services" 
          className="inline-flex items-center gap-2 bg-green-600/90 hover:bg-green-500 text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-300 shadow-lg hover:scale-105"
        >
          View Services <FaArrowRight />
        </Link>
      </div>
    </div>
  );
};

export default Home;