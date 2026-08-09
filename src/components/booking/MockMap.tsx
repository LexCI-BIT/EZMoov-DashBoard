import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { reverseGeocode } from '../../services/apiService';
import { FaMapMarkerAlt } from 'react-icons/fa';

const MockMap: React.FC = () => {
  const { activeInput, setPickup, setDrop, setActiveInput } = useBooking();
  const [loading, setLoading] = useState(false);

  const handleMapClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeInput) return;
    
    setLoading(true);
    // Generate fake coordinates based on click position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const mockCoords = { lat: 28.6139 + (y / 1000), lng: 77.2090 + (x / 1000) };

    // Call the service layer (easily swappable with real Google Maps SDK)
    const address = await reverseGeocode(mockCoords);

    if (activeInput === 'pickup') {
      setPickup({ address, coordinates: mockCoords });
    } else if (activeInput === 'drop') {
      setDrop({ address, coordinates: mockCoords });
    }
    setLoading(false);
    setActiveInput(null); // Blur the input after selection
  };

  return (
    <div 
      onClick={handleMapClick}
      className="relative h-[50vh] bg-green-50 border-b border-green-100 flex items-center justify-center cursor-pointer overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
    >
      {activeInput ? (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-10 animate-bounce">
          Tap on map to set {activeInput} location
        </div>
      ) : null}
      
      {/* Center Pin */}
      <div className="flex flex-col items-center text-green-600">
        <FaMapMarkerAlt className="text-5xl drop-shadow-md" />
        {loading ? <p className="mt-2 text-sm font-medium">Loading location...</p> : <p className="mt-2 text-sm font-medium">Mock Map View</p>}
      </div>
    </div>
  );
};

export default MockMap;