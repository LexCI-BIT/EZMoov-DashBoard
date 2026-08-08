import { useState } from 'react';
import { isDateNotPast, isValidTimeRange } from '../lib/validation';

interface ShiftingExpertsProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
}

export default function ShiftingExperts({ onBack, onSubmit }: ShiftingExpertsProps) {
  const [dateSlot, setDateSlot] = useState('');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('11:00 AM');
  const [errors, setErrors] = useState<{[k:string]:string}>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[k:string]:string} = {};
    if (!dateSlot) newErrors.dateSlot = 'Please select a date slot.';
    else if (!isDateNotPast(dateSlot)) newErrors.dateSlot = 'Selected date cannot be in the past.';
    if (!isValidTimeRange(startTime, endTime)) newErrors.time = 'End time must be after start time.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit({
      dateSlot,
      startTime,
      endTime,
    });
  };

  return (
    <div className="flex flex-col flex-1 animate-fade-in w-full max-w-7xl mx-auto px-6 py-6 pb-20 bg-white">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm font-medium mb-6 bg-transparent border-none cursor-pointer self-start"
      >
        <span>&lt;</span> Back to Services
      </button>

      {/* Stepper Progress Flow */}
      <div className="flex items-center justify-between mb-10 w-full max-w-2xl mx-auto">
        <div className="flex flex-col items-center flex-1">
          <div className="w-8 h-8 rounded-full bg-[#00B14F] text-white flex items-center justify-center font-bold text-sm shadow-sm">1</div>
          <span className="text-xs sm:text-sm font-bold mt-2 text-[#00B14F] text-center">Survey Booking</span>
        </div>
        <div className="h-0.5 bg-gray-200 flex-1 -mt-6 mx-2" />
        <div className="flex flex-col items-center flex-1">
          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm">2</div>
          <span className="text-xs sm:text-sm font-medium mt-2 text-gray-500 text-center">Representative Visit</span>
        </div>
        <div className="h-0.5 bg-gray-200 flex-1 -mt-6 mx-2" />
        <div className="flex flex-col items-center flex-1">
          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm">3</div>
          <span className="text-xs sm:text-sm font-medium mt-2 text-gray-500 text-center">Schedule Day</span>
        </div>
      </div>

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        {/* Left Column: Descriptions & Fee */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] mb-4">Pre-Move Survey Booking</h2>
            <p className="text-sm font-bold text-gray-700 mb-4">A representative will visit your place to:</p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#E6F6EE] text-[#00B14F] font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                <span className="text-[#1A1A1A] text-sm sm:text-base font-medium">List inventory and assess weight.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#E6F6EE] text-[#00B14F] font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                <span className="text-[#1A1A1A] text-sm sm:text-base font-medium">Finalize suitable vehicle size.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#E6F6EE] text-[#00B14F] font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                <span className="text-[#1A1A1A] text-sm sm:text-base font-medium">Schedule the move date.</span>
              </div>
            </div>
          </div>

          {/* Survey Fee Box */}
          <div className="bg-[#E6F6EE] border border-[#d2f4e4] rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-white text-[#00B14F] rounded-full flex items-center justify-center text-2xl font-bold shadow-sm shrink-0">
              ₹
            </div>
            <div>
              <div className="text-base font-bold text-[#1A1A1A]">Survey Fee: ₹150</div>
              <div className="text-xs text-gray-500 font-medium">Refundable if you book with us</div>
            </div>
          </div>
        </div>

        {/* Right Column: Time Selection and CTA */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-sm space-y-6">
          {/* Date Slot */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1A1A1A]">Date Slot</label>
            <div className="relative flex items-center border border-[#E0E0E0] rounded-xl px-4 py-3 bg-white">
              <span className="mr-3 text-gray-400">📅</span>
              <input 
                type="date"
                value={dateSlot}
                onChange={(e) => setDateSlot(e.target.value)}
                className="w-full text-base outline-none bg-transparent text-[#1A1A1A]"
              />
              {errors.dateSlot && <div className="text-red-500 text-xs mt-1">{errors.dateSlot}</div>}
            </div>
          </div>

          {/* Time Slot */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1A1A1A]">Time Slot</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative flex items-center border border-[#E0E0E0] rounded-xl px-3 py-3 bg-white">
                <span className="mr-2 text-gray-400">⏰</span>
                <select 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-sm sm:text-base outline-none bg-transparent text-[#1A1A1A] cursor-pointer"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="01:00 PM">01:00 PM</option>
                </select>
              </div>

              <div className="relative flex items-center border border-[#E0E0E0] rounded-xl px-3 py-3 bg-white">
                <span className="mr-2 text-gray-400">⏰</span>
                <select 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full text-sm sm:text-base outline-none bg-transparent text-[#1A1A1A] cursor-pointer"
                >
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="01:00 PM">01:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                </select>
              </div>
            </div>
            {errors.time && <div className="text-red-500 text-xs mt-1">{errors.time}</div>}
          </div>

          {/* Submit CTA */}
          <button 
            type="submit"
            className="w-full py-4 bg-[#00B14F] hover:bg-[#009542] text-white rounded-xl text-base font-bold uppercase tracking-wide cursor-pointer transition-colors border-none shadow-sm flex items-center justify-center gap-2"
          >
            Proceed to Payment & Book Slot <span>&gt;</span>
          </button>
        </form>
      </div>
    </div>
  );
}
