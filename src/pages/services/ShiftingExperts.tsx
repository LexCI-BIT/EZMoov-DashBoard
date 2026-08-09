import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaUser, FaCalendarAlt, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useBookingsHistory } from '../../context/BookingsContext';
import { bookSurveySlot } from '../../services/apiService';
import type { Booking, Vehicle } from '../../types/booking';

const ShiftingExperts: React.FC = () => {
  const navigate = useNavigate();
  const { addBooking } = useBookingsHistory();

  // Form State
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [surveyDate, setSurveyDate] = useState('');
  const [surveyTime, setSurveyTime] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [confirmedSurveyor, setConfirmedSurveyor] = useState<{ driverName: string; driverPhone: string; vehicleNumber: string } | null>(null);

  // A dummy vehicle object to satisfy the standard Booking type structure
  const surveyVehicle: Vehicle = {
    id: 'survey',
    name: 'Pre-Move Survey',
    capacity: 'Inspection Only',
    description: 'Expert assessment of inventory',
    baseFare: 0,
    perKmRate: 0,
    icon: 'FaTruckMoving'
  };

  const handleBookSurvey = async () => {
    if (!pickupAddress || !dropAddress || !recipientName || !recipientPhone || !surveyDate || !surveyTime) {
      toast.error('Please fill all details to book the survey');
      return;
    }

    setLoading(true);
    
    // 1. Call mock API to allocate surveyor
    const surveyor = await bookSurveySlot({ date: surveyDate, time: surveyTime, address: pickupAddress });
    
    // 2. Construct the booking object
    const newBooking: Booking = {
      id: `bk_survey_${Date.now()}`,
      status: 'active',
      pickup: { address: pickupAddress, coordinates: null },
      drop: { address: dropAddress, coordinates: null },
      recipient: { name: recipientName, phone: recipientPhone },
      vehicle: surveyVehicle,
      fare: { baseFare: 0, distanceCharge: 0, taxes: 0, total: 0, distanceInKm: 0 }, // Survey is free
      driverDetails: surveyor,
      createdAt: new Date().toISOString(),
      surveyDate: surveyDate,
      surveyTime: surveyTime
    };

    // 3. Save to global bookings state
    addBooking(newBooking);
    setConfirmedSurveyor(surveyor);
    setLoading(false);
  };

  // SUCCESS VIEW
  if (confirmedSurveyor) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full p-8 text-center">
          <FaCheckCircle className="text-green-600 text-7xl mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Survey Scheduled!</h2>
          <p className="text-gray-600 mb-8">Your pre-move survey has been booked successfully.</p>
          
          <div className="bg-green-50 rounded-xl p-5 text-left mb-8 border border-green-100 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Surveyor Name</span>
              <span className="font-semibold text-gray-900">{confirmedSurveyor.driverName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Contact</span>
              <span className="font-semibold text-gray-900">{confirmedSurveyor.driverPhone}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Scheduled For</span>
              <span className="font-semibold text-gray-900">{surveyDate} at {surveyTime}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-green-200 pt-3">
              <span className="text-gray-600">Survey Location</span>
              <span className="font-semibold text-gray-900 text-right max-w-[60%] truncate">{pickupAddress}</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/bookings')} 
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-500 transition-colors"
          >
            Track in Bookings
          </button>
        </div>
      </div>
    );
  }

  // FORM VIEW
  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-gray-50 flex flex-col">
      <header className="bg-white p-4 shadow-sm flex items-center border-b sticky top-16 z-10">
        <FaArrowLeft className="text-gray-800 cursor-pointer mr-4 text-xl" onClick={() => navigate('/services')} />
        <h1 className="text-lg font-semibold text-gray-900">Shifting Experts</h1>
      </header>

      <div className="flex-grow p-4 max-w-md mx-auto w-full space-y-4 pb-8">
        
        {/* Survey Slot Details */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2"><FaCalendarAlt className="text-green-600" /> Schedule Pre-Move Survey</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <input 
                type="date" 
                value={surveyDate}
                onChange={(e) => setSurveyDate(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-green-500 text-sm text-gray-700"
              />
            </div>
            <div className="relative">
              <input 
                type="time" 
                value={surveyTime}
                onChange={(e) => setSurveyTime(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-green-500 text-sm text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2"><FaMapMarkerAlt className="text-green-600" /> Location Details</h2>
          <input 
            type="text" placeholder="Current Shifting Address" value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-green-500 text-sm"
          />
          <input 
            type="text" placeholder="Destination Address" value={dropAddress}
            onChange={(e) => setDropAddress(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-green-500 text-sm"
          />
        </div>

        {/* Contact Details */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2"><FaUser className="text-green-600" /> Contact Details</h2>
          <input 
            type="text" placeholder="Your Name" value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-green-500 text-sm"
          />
          <input 
            type="tel" placeholder="Phone Number" value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-green-500 text-sm"
          />
        </div>

        <button 
          onClick={handleBookSurvey}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-500 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><FaSpinner className="animate-spin" /> Allocating Representative...</>
          ) : (
            <>Book Survey Slot</>
          )}
        </button>
      </div>
    </div>
  );
};

export default ShiftingExperts;