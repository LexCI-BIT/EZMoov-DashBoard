import { useEffect } from 'react';

interface FindingProps {
  onFound: () => void;
}

export default function Finding({ onFound }: FindingProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFound();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onFound]);

  return (
    <div className="flex flex-col flex-1 animate-fade-in w-full max-w-7xl mx-auto px-6 py-6 pb-20">
      <div className="pb-4 border-b border-[#E0E0E0] mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Confirming Booking</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center w-full">
        {/* Left Side: Map searching status */}
        <div className="w-full lg:w-3/5 h-[350px] bg-[#E0E0E0] flex items-center justify-center text-sm font-medium text-[#666666] rounded-2xl border border-[#E0E0E0] shadow-inner">
          Searching nearby drivers on map...
        </div>

        {/* Right Side: Status progress indicators */}
        <div className="w-full lg:w-2/5 flex flex-col items-center justify-center text-center p-8 bg-white border border-[#E0E0E0] rounded-2xl shadow-sm min-h-[350px]">
          {/* Spinner */}
          <div className="w-16 h-16 border-4 border-[#E6F6EE] border-b-[#00B14F] rounded-full animate-rotation mb-8" />

          <div className="text-xl font-bold text-[#1A1A1A] mb-2">Finding nearby drivers</div>
          <div className="text-sm text-[#666666] max-w-[280px] mx-auto">Please wait while we connect you to the closest vehicle partner.</div>
        </div>
      </div>
    </div>
  );
}
