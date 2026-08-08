
interface NavbarProps {
  isLoggedIn: boolean;
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export default function Navbar({ isLoggedIn, activeScreen, onNavigate }: NavbarProps) {
  return (
    <div className="bg-white border-b border-[#E0E0E0] sticky top-0 z-[100] min-h-[56px] w-full">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center w-full">
      <div 
        className="font-bold text-[#00B14F] text-lg cursor-pointer tracking-tight" 
        onClick={() => onNavigate(isLoggedIn ? 'services' : 'login')}
      >
        EZmoov
      </div>

      {!isLoggedIn ? (
        <div className="flex gap-4 items-center">
          <button 
            className="bg-[#00B14F] hover:bg-[#009542] text-white px-4 py-2 rounded-lg text-xs font-medium uppercase transition-colors border-none"
            onClick={() => onNavigate('login')}
          >
            Login
          </button>
          <button 
            className="bg-transparent text-[#00B14F] hover:text-[#009542] text-sm font-medium border-none cursor-pointer"
            onClick={() => onNavigate('signup')}
          >
            Sign Up
          </button>
        </div>
      ) : (
        <div className="flex gap-4 items-center">
          <button 
            className={`bg-transparent border-none text-sm font-medium cursor-pointer pb-1 transition-all ${
              activeScreen === 'services' || activeScreen === 'booking' || activeScreen === 'vehicles' || activeScreen === 'finding'
                ? 'text-[#1A1A1A] border-b-2 border-[#00B14F]' 
                : 'text-[#666666] hover:text-[#1A1A1A]'
            }`}
            onClick={() => onNavigate('services')}
          >
            Services
          </button>
          <button 
            className={`bg-transparent border-none text-sm font-medium cursor-pointer pb-1 transition-all ${
              activeScreen === 'bookings' || activeScreen === 'tracking'
                ? 'text-[#1A1A1A] border-b-2 border-[#00B14F]' 
                : 'text-[#666666] hover:text-[#1A1A1A]'
            }`}
            onClick={() => onNavigate('bookings')}
          >
            Bookings
          </button>
          <button 
            className={`bg-transparent border-none text-sm font-medium cursor-pointer pb-1 transition-all ${
              activeScreen === 'profile'
                ? 'text-[#1A1A1A] border-b-2 border-[#00B14F]' 
                : 'text-[#666666] hover:text-[#1A1A1A]'
            }`}
            onClick={() => onNavigate('profile')}
          >
            Profile
          </button>
        </div>
      )}
    </div>
  </div>
  );
}
