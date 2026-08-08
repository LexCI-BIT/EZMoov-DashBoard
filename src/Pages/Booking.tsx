import React, { useState } from 'react';
import { isValidName, isValidPhone, isDateNotPast } from '../lib/validation';

interface BookingProps {
  serviceName: string;
  onBack: () => void;
  onSubmitBooking: (bookingData: any) => void;
}

export default function Booking({ serviceName, onBack, onSubmitBooking }: BookingProps) {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [errors, setErrors] = useState<{[k:string]:string}>({});

  // Packers & Movers dynamic fields
  const [surveyRequired, setSurveyRequired] = useState('Yes');
  const [moveDate, setMoveDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[k:string]:string} = {};
    if (!pickup.trim()) newErrors.pickup = 'Enter pickup address.';
    if (!dropoff.trim()) newErrors.dropoff = 'Enter drop-off address.';
    if (!isValidName(senderName)) newErrors.senderName = 'Enter valid sender name.';
    if (!isValidPhone(senderPhone)) newErrors.senderPhone = 'Enter valid sender phone.';
    if (!isValidName(recipientName)) newErrors.recipientName = 'Enter valid recipient name.';
    if (!isValidPhone(recipientPhone)) newErrors.recipientPhone = 'Enter valid recipient phone.';

    if (serviceName === 'Packers and Movers') {
      if (moveDate && !isDateNotPast(moveDate)) newErrors.moveDate = 'Move date cannot be in the past.';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    onSubmitBooking({
      pickup,
      dropoff,
      senderName,
      senderPhone,
      recipientName,
      recipientPhone,
      surveyRequired: serviceName === 'Packers and Movers' ? surveyRequired : undefined,
      moveDate: serviceName === 'Packers and Movers' ? moveDate : undefined,
    });
  };

  return (
    <div className="flex flex-col flex-1 animate-fade-in w-full max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#E0E0E0] mb-8 flex items-center min-h-[56px] w-full">
        <button 
          onClick={onBack}
          className="text-2xl text-[#1A1A1A] mr-4 cursor-pointer bg-none border-none p-0 line-height-1"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Route & Contact Details</h1>
      </div>

      {/* Grid Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        {/* Left Side: Inputs and Contact Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Address Fields with icons */}
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 text-[#1A1A1A]">Addresses</h3>
            <div className="flex gap-4">
              <div className="flex flex-col items-center pt-4 gap-1.5">
                <div className="w-2.5 h-2.5 bg-[#00B14F] rounded-full" />
                <div className="w-0.5 h-[40px] border-l-2 border-dashed border-[#00B14F]" />
                <div className="w-2.5 h-2.5 bg-[#00B14F]" />
              </div>
              <div className="flex-1 flex flex-col gap-4">
                <input 
                  type="text" 
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="Enter pickup address"
                  className="border-none border-b border-[#E0E0E0] py-3 text-base outline-none text-[#1A1A1A] placeholder-[#aaa] focus:border-[#00B14F] transition-colors"
                />
                <input 
                  type="text" 
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  placeholder="Enter drop-off address"
                  className="border-none border-b border-[#E0E0E0] py-3 text-base outline-none text-[#1A1A1A] placeholder-[#aaa] focus:border-[#00B14F] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Contact Details Cards */}
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h4 className="text-base font-bold text-[#1A1A1A] mb-4">Sender Details (Pickup)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-1.5">Sender Name</label>
                  <input 
                    type="text" 
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Name of person at pickup"
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg text-base outline-none bg-[#F5F5F5] focus:bg-white focus:border-[#00B14F] transition-all"
                  />
                  {errors.senderName && <div className="text-red-500 text-xs mt-1">{errors.senderName}</div>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-1.5">Sender Phone</label>
                  <input 
                    type="tel" 
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg text-base outline-none bg-[#F5F5F5] focus:bg-white focus:border-[#00B14F] transition-all"
                  />
                  {errors.senderPhone && <div className="text-red-500 text-xs mt-1">{errors.senderPhone}</div>}
                </div>
              </div>
            </div>

            <div className="border-t border-[#E0E0E0] pt-6">
              <h4 className="text-base font-bold text-[#1A1A1A] mb-4">Recipient Details (Drop-off)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-1.5">Recipient Name</label>
                  <input 
                    type="text" 
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Name of person at drop-off"
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg text-base outline-none bg-[#F5F5F5] focus:bg-white focus:border-[#00B14F] transition-all"
                  />
                  {errors.recipientName && <div className="text-red-500 text-xs mt-1">{errors.recipientName}</div>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-1.5">Recipient Phone</label>
                  <input 
                    type="tel" 
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+1 987 654 3210"
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg text-base outline-none bg-[#F5F5F5] focus:bg-white focus:border-[#00B14F] transition-all"
                  />
                  {errors.recipientPhone && <div className="text-red-500 text-xs mt-1">{errors.recipientPhone}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Map and actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Map view mockup */}
          <div className="h-[260px] bg-[#E0E0E0] rounded-2xl flex items-center justify-center text-sm font-medium text-[#666666] shadow-sm border border-[#E0E0E0]">
            Light Mode Map View
          </div>

          {/* Dynamic section based on service category */}
          {serviceName === 'Outstation Bidding' && (
            <div className="bg-[#F5F5F5] border border-[#E0E0E0] p-4 rounded-xl">
              <p className="text-sm text-[#666666]">Note: Fare will be negotiated via call with the driver.</p>
            </div>
          )}

          {serviceName === 'Packers and Movers' && (
            <div className="bg-[#F5F5F5] border border-[#E0E0E0] p-5 rounded-xl space-y-4">
              <h4 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">Shifting Preferences</h4>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Schedule Pre-move Survey</span>
                <select 
                  value={surveyRequired}
                  onChange={(e) => setSurveyRequired(e.target.value)}
                  className="border border-[#E0E0E0] p-1.5 px-3 rounded-lg bg-white outline-none"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Select Move Date</span>
                <input 
                  type="date" 
                  value={moveDate}
                  onChange={(e) => setMoveDate(e.target.value)}
                  className="border border-[#E0E0E0] p-1.5 px-3 rounded-lg bg-white outline-none"
                />
                {errors.moveDate && <div className="text-red-500 text-xs mt-1">{errors.moveDate}</div>}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            className="w-full py-4 bg-[#00B14F] hover:bg-[#009542] text-white rounded-xl text-base font-bold uppercase tracking-wide cursor-pointer transition-colors border-none shadow-sm"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}
