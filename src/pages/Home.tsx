import React from 'react';
import { Link } from 'react-router-dom';
import { FaTruck, FaArrowRight } from 'react-icons/fa';
// Import your image here (Make sure the path matches your folder structure)
import homepageImage from '../assets/homepage.png'; 

const Home: React.FC = () => {
  return (
    <div 
      className="h-[calc(100vh-4rem)] w-full flex items-center justify-start overflow-hidden relative bg-cover bg-center"
      style={{ backgroundImage: `url(${homepageImage})` }}
    >
      {/* Gradient overlay: Darker on the left for text readability, fading to transparent on the right */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
      
      {/* Content Container - Left Aligned */}
      <div className="relative z-10 w-full md:w-3/4 lg:w-1/2 pl-6 sm:pl-10 md:pl-16 lg:pl-20 pr-6 flex flex-col items-start text-left mr-auto">
        
        {/* Icon */}
        <FaTruck className="text-3xl sm:text-4xl text-white drop-shadow-md mb-4" />
        
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4">
          Welcome to <span className="text-[#00c853]">EZMoov</span>
        </h1>
        
        {/* Paragraph */}
        <p className="text-base sm:text-lg md:text-xl text-gray-100 max-w-lg mb-8 drop-shadow-md leading-relaxed">
          Your seamless ride-booking platform. Fast, reliable, and secure. 
          Book your next ride with just a few taps.
        </p>
        
        {/* Button */}
        <Link 
          to="/services" 
          className="inline-flex items-center gap-2 bg-[#00c853] hover:bg-[#00a844] text-white px-6 py-3 sm:px-8 sm:py-3.5 rounded-md text-sm sm:text-base font-bold transition-all duration-300 shadow-lg hover:-translate-y-1"
        >
          View Services <FaArrowRight />
        </Link>
      </div>
    </div>
  );
};

export default Home;