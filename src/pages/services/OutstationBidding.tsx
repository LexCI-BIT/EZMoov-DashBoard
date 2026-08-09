import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaUser, FaTruck, FaSpinner, FaPhoneAlt, FaCheck, FaTimes, FaGavel } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useBookingsHistory } from '../../context/BookingsContext';
import { mockVehicles, findOutstationBid } from '../../services/apiService';
import type { Booking, Vehicle } from '../../types/booking';

type Step = 'details' | 'bidding' | 'success';

interface BidData {
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  bidAmount: number;
}

const OutstationBidding: React.FC = () => {
  const navigate = useNavigate();
  const { addBooking } = useBookingsHistory();

  // Form State
  const [step, setStep] = useState<Step>('details');
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Bidding State
  const [isSearching, setIsSearching] = useState(false);
  const [currentBid, setCurrentBid] = useState<BidData | null>(null);
  const [confirmedBid, setConfirmedBid] = useState<BidData | null>(null);

  const handleStartBidding = async () => {
    if (!pickup || !drop || !recipientName || !recipientPhone || !selectedVehicle) {
      toast.error('Please fill all details and select a vehicle');
      return;
    }
    setStep('bidding');
    await searchNextBid();
  };

  const searchNextBid = async () => {
    setIsSearching(true);
    setCurrentBid(null);
    // Call mock API to get a new bid
    const bid = await findOutstationBid(selectedVehicle!.id);
    setCurrentBid(bid);
    setIsSearching(false);
  };

  const handleRejectBid = () => {
    toast.info('Searching for the next driver...');
    searchNextBid();
  };

  const handleCallDriver = () => {
    toast.success(`Calling ${currentBid?.driverName}... (Mock Call)`);
  };

  const handleAcceptBid = () => {
    if (!currentBid || !selectedVehicle) return;

    // 1. Construct the booking object using the accepted bid amount
    const newBooking: Booking = {
      id: `bk_outstation_${Date.now()}`,
      status: 'active',
      pickup: { address: pickup, coordinates: null },
      drop: { address: drop, coordinates: null },
      recipient: { name: recipientName, phone: recipientPhone },
      vehicle: selectedVehicle,
      // Map the bid amount to the fare structure
      fare: {
        baseFare: 0,
        distanceCharge: currentBid.bidAmount,
        taxes: 0,
        total: currentBid.bidAmount,
        distanceInKm: 0 // Negligible for bidding
      },
      driverDetails: {
        driverName: currentBid.driverName,
        driverPhone: currentBid.driverPhone,
        vehicleNumber: currentBid.vehicleNumber
      },
      createdAt: new Date().toISOString()
    };

    // 2. Save to global bookings state
    addBooking(newBooking);
    setConfirmedBid(currentBid);
    setStep('success');
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm flex items-center border-b sticky top-16 z-10">
        <FaArrowLeft 
          className="text-gray-800 cursor-pointer mr-4 text-xl" 
          onClick={() => step === 'bidding' ? setStep('details') : navigate('/services')} 
        />
        <h1 className="text-lg font-semibold text-gray-900">Outstation Bidding</h1>
      </header>

      <div className="flex-grow p-4 max-w-md mx-auto w-full">
        
        {/* STEP 1: Details Form */}
        {step === 'details' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2"><FaMapMarkerAlt className="text-green-600" /> Trip Details</h2>
              <input 
                type="text" placeholder="Pickup City / Location" value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-green-500 text-sm"
              />
              <input 
                type="text" placeholder="Destination City / Location" value={drop}
                onChange={(e) => setDrop(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-green-500 text-sm"
              />
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2"><FaUser className="text-green-600" /> Recipient Details</h2>
              <input 
                type="text" placeholder="Recipient Name" value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-green-500 text-sm"
              />
              <input 
                type="tel" placeholder="Recipient Phone Number" value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-green-500 text-sm"
              />
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2"><FaTruck className="text-green-600" /> Select Vehicle</h2>
              <div className="grid grid-cols-2 gap-3">
                {mockVehicles.slice(2).map((v) => ( // Showing larger vehicles for outstation
                  <button 
                    key={v.id} 
                    onClick={() => setSelectedVehicle(v)}
                    className={`p-3 border rounded-lg text-left transition-colors ${selectedVehicle?.id === v.id ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                  >
                    <p className="font-semibold text-sm text-gray-900">{v.name}</p>
                    <p className="text-xs text-gray-500">{v.capacity}</p>
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleStartBidding}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-500 transition-colors flex items-center justify-center gap-2"
            >
              <FaGavel /> Start Bidding
            </button>
          </div>
        )}

        {/* STEP 2: Bidding Process */}
        {step === 'bidding' && (
          <div className="space-y-6 mt-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Bidding in Progress</h2>
              <p className="text-sm text-gray-500">Route: {pickup} to {drop}</p>
            </div>

            {isSearching && (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <FaSpinner className="animate-spin text-green-600 text-4xl mb-4" />
                <p className="font-semibold text-gray-900">Finding nearby drivers...</p>
                <p className="text-sm text-gray-500 mt-1">Negotiating best fares for you.</p>
              </div>
            )}

            {currentBid && !isSearching && (
              <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-green-500 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">BID RECEIVED</span>
                  <p className="text-2xl font-extrabold text-green-600">₹{currentBid.bidAmount}</p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-50 p-2 rounded-full"><FaUser className="text-green-600" /></div>
                    <p className="font-medium text-gray-900">{currentBid.driverName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-50 p-2 rounded-full"><FaTruck className="text-green-600" /></div>
                    <p className="font-medium text-gray-900">{currentBid.vehicleNumber} • {selectedVehicle?.name}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleCallDriver}
                    className="w-full bg-blue-50 text-blue-700 border border-blue-200 py-3 rounded-lg font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaPhoneAlt /> Call to Negotiate
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handleRejectBid}
                      className="w-full bg-red-50 text-red-600 border border-red-200 py-3 rounded-lg font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaTimes /> Reject
                    </button>
                    <button 
                      onClick={handleAcceptBid}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-500 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaCheck /> Accept
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Success / Ride Confirmed */}
        {step === 'success' && confirmedBid && (
          <div className="flex flex-col items-center justify-center text-center mt-10">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full p-8">
              <FaCheck className="text-green-600 text-6xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ride Confirmed!</h2>
              <p className="text-gray-600 mb-6">Your outstation ride has been booked successfully.</p>
              
              <div className="bg-green-50 rounded-xl p-4 text-left mb-6 border border-green-100">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Driver</span>
                  <span className="font-semibold text-gray-900">{confirmedBid.driverName}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Vehicle</span>
                  <span className="font-semibold text-gray-900">{confirmedBid.vehicleNumber}</span>
                </div>
                <div className="flex justify-between border-t border-green-200 mt-2 pt-2">
                  <span className="text-sm text-gray-600">Confirmed Fare</span>
                  <span className="font-bold text-green-600 text-lg">₹{confirmedBid.bidAmount}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/bookings')} 
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-500 transition-colors"
              >
                View in Bookings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutstationBidding;