import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaUser, FaPhone, FaLocationArrow, FaArrowRight } from 'react-icons/fa';
import { useBooking } from '../../context/BookingContext';

const LocalAdda: React.FC = () => {
  const navigate = useNavigate();
  const { pickup, drop, recipient, setPickup, setDrop, setRecipient } = useBooking();

  const isFormValid = 
    pickup.address.length > 3 && 
    drop.address.length > 3 && 
    recipient.name.length > 2 && 
    recipient.phone.length >= 10;

  // Helper to handle manual text input since we aren't using the Map here
  const handleLocationChange = (type: 'pickup' | 'drop', address: string) => {
    const mockCoords = { lat: 28.6139 + Math.random(), lng: 77.2090 + Math.random() };
    if (type === 'pickup') setPickup({ address, coordinates: mockCoords });
    if (type === 'drop') setDrop({ address, coordinates: mockCoords });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white p-4 shadow-sm flex items-center z-10 border-b">
        <FaArrowLeft className="text-gray-800 cursor-pointer mr-4 text-xl" onClick={() => navigate('/services')} />
        <h1 className="text-lg font-semibold text-gray-900">Local Adda</h1>
      </header>

      <div className="flex-grow p-6 max-w-md mx-auto w-full flex flex-col">
        
        {/* Info Banner */}
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-start gap-3 mb-6">
          <FaLocationArrow className="text-green-600 text-xl mt-1" />
          <div>
            <p className="font-semibold text-sm">Instant Neighborhood Matching</p>
            <p className="text-xs text-green-700">Connect directly with drivers at your local stand for zero wait times.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4 flex-grow">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2"><FaMapMarkerAlt className="text-green-600" /> Trip Details</h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <FaMapMarkerAlt className="text-green-600" />
              <input 
                type="text" 
                placeholder="Pickup Location / Local Stand" 
                className="flex-1 outline-none text-sm text-gray-800 bg-transparent"
                value={pickup.address}
                onChange={(e) => handleLocationChange('pickup', e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <FaMapMarkerAlt className="text-red-500" />
              <input 
                type="text" 
                placeholder="Drop Location" 
                className="flex-1 outline-none text-sm text-gray-800 bg-transparent"
                value={drop.address}
                onChange={(e) => handleLocationChange('drop', e.target.value)}
              />
            </div>
          </div>

          <h2 className="font-semibold text-gray-900 flex items-center gap-2 pt-2"><FaUser className="text-green-600" /> Recipient Details</h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <FaUser className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Recipient Name" 
                className="flex-1 outline-none text-sm text-gray-800 bg-transparent"
                value={recipient.name}
                onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <FaPhone className="text-gray-400" />
              <input 
                type="tel" 
                placeholder="Recipient Phone Number" 
                className="flex-1 outline-none text-sm text-gray-800 bg-transparent"
                value={recipient.phone}
                onChange={(e) => setRecipient({ ...recipient, phone: e.target.value })}
              />
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate('/booking/vehicle-selection')}
          disabled={!isFormValid}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
        >
          Select Vehicle <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default LocalAdda;