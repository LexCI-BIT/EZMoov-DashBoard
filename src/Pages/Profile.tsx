interface ProfileProps {
  onLogout: () => void;
}

export default function Profile({ onLogout }: ProfileProps) {
  return (
    <div className="flex flex-col flex-1 animate-fade-in w-full max-w-7xl mx-auto px-6 py-6 pb-20">
      <div className="pb-4 border-b border-[#E0E0E0] mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Profile</h1>
      </div>

      <div className="max-w-md mx-auto w-full bg-white border border-[#E0E0E0] rounded-2xl p-8 shadow-sm text-center">
        <div className="flex flex-col items-center py-6">
          <div className="w-[80px] h-[80px] bg-[#E6F6EE] text-[#00B14F] rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-sm">
            JD
          </div>
          <div className="text-xl font-bold text-[#1A1A1A] mb-1">John Doe</div>
          <div className="text-sm text-[#666666] font-medium">+1 234 567 8900</div>
        </div>

        <button 
          onClick={onLogout}
          className="w-full mt-6 py-4 text-[#D32F2F] bg-[#FFEBEE] hover:bg-[#FFCDD2] border-none text-sm font-bold uppercase tracking-wide rounded-xl cursor-pointer transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
