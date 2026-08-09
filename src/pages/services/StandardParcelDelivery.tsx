import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaPhone, FaArrowRight } from 'react-icons/fa';
import { useBooking } from '../../context/BookingContext';
import MockMap from '../../components/booking/MockMap';
import LocationInput from '../../components/booking/LocationInput';

const StandardParcelDelivery: React.FC = () => {
  const navigate = useNavigate();
  const { pickup, drop, recipient, setRecipient } = useBooking();

  const isFormValid = 
    pickup.address && pickup.coordinates && 
    drop.address && drop.coordinates && 
    recipient.name.length > 2 && 
    recipient.phone.length >= 10;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm flex items-center z-10 border-b">
        <FaArrowLeft className="text-gray-800 cursor-pointer mr-4 text-xl" onClick={() => navigate('/services')} />
        <h1 className="text-lg font-semibold text-gray-900">Standard Parcel Delivery</h1>
      </header>

      {/* Map View (Top Half) */}
      <MockMap />

      {/* Bottom Overlay (Form) */}
      <div className="bg-white p-6 shadow-2xl rounded-t-2xl -mt-6 z-10 flex-grow flex flex-col gap-4">
        
        {/* Location Inputs */}
        <div className="flex flex-col gap-3">
          {/* Changed type to inputType */}
          <LocationInput inputType="pickup" placeholder="Pickup Location" value={pickup} />
          <LocationInput inputType="drop" placeholder="Drop Location" value={drop} />
        </div>

        {/* Recipient Details */}
        <div className="flex flex-col gap-3">
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

        {/* Action Button */}
        <button 
          onClick={() => navigate('/booking/vehicle-selection')}
          disabled={!isFormValid}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          Select Vehicle <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default StandardParcelDelivery;