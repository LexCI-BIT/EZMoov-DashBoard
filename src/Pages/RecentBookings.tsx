interface RecentBookingsProps {
  onSelectBooking: (bookingId: string) => void;
}

export default function RecentBookings({ onSelectBooking }: RecentBookingsProps) {
  const bookings = [
    { id: 'b1', date: 'Oct 24, 2023', status: 'Delivered', route: ['123 Main St', '456 Oak Ave'] },
    { id: 'b2', date: 'Oct 20, 2023', status: 'Cancelled', route: ['Downtown', 'Airport'] },
  ];

  return (
    <div className="flex flex-col flex-1 animate-fade-in w-full max-w-7xl mx-auto px-6 py-6 pb-20">
      <div className="pb-4 border-b border-[#E0E0E0] mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Recent Bookings</h1>
      </div>

      <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-sm divide-y divide-[#E0E0E0]">
        {bookings.map((booking) => (
          <div 
            key={booking.id}
            onClick={() => onSelectBooking(booking.id)}
            className="py-4 first:pt-0 last:pb-0 cursor-pointer hover:bg-gray-50/50 transition-colors rounded-xl px-4"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-[#666666] font-medium">{booking.date}</span>
              <span className={`text-[11px] px-2.5 py-1 rounded font-bold tracking-wide uppercase ${
                booking.status === 'Delivered' 
                  ? 'bg-[#E6F6EE] text-[#00B14F]' 
                  : 'bg-[#FFE0E0] text-[#D32F2F]'
              }`}>
                {booking.status}
              </span>
            </div>
            <div className="text-base font-bold text-[#1A1A1A] flex items-center gap-2">
              <span>{booking.route[0]}</span>
              <span className="text-xs text-[#666666]">➔</span>
              <span>{booking.route[1]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
