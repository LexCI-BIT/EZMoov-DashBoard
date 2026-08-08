import { useState } from 'react';

interface VehicleOption {
  id: string;
  name: string;
  capacity: string;
  category: string;
  icon: string;
}

interface VehiclesProps {
  onBack: () => void;
  onConfirm: (vehicle: VehicleOption) => void;
}

export default function Vehicles({ onBack, onConfirm }: VehiclesProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const vehicleOptions: VehicleOption[] = [
    // Two-Wheeler
    { id: 'bike', name: 'Bike/2-Wheeler', capacity: 'Up to 10 kg', category: 'Two-Wheeler', icon: '🏍️' },
    { id: 'scooter', name: 'Scooter', capacity: 'Up to 20 kg', category: 'Two-Wheeler', icon: '🛵' },

    // Three-Wheeler
    { id: '3w-tempo', name: '3 Wheeler (Tempo)', capacity: '~500 kg', category: 'Three-Wheeler', icon: '🛺' },
    { id: '3w-electric', name: '3 Wheeler Electric', capacity: '~500 kg', category: 'Three-Wheeler', icon: '⚡' },
    { id: 'e-rickshaw', name: 'E-Rickshaw Loader', capacity: '~500 kg', category: 'Three-Wheeler', icon: '🔋' },

    // Mini Trucks
    { id: 'tata-ace', name: 'Tata Ace (Chota Hathi)', capacity: '750 kg capacity', category: 'Mini Trucks (700-1,700 kg)', icon: '🛻' },
    { id: 'maruti-eeco', name: 'Maruti Eeco', capacity: '~700 kg capacity', category: 'Mini Trucks (700-1,700 kg)', icon: '🚗' },
    { id: 'pickup-8ft', name: 'Pickup 8ft / 1 Ton', capacity: '1,000 kg capacity', category: 'Mini Trucks (700-1,700 kg)', icon: '🛻' },
    { id: 'tata-super-ace', name: 'Tata Super Ace 8ft', capacity: '1,000 kg capacity', category: 'Mini Trucks (700-1,700 kg)', icon: '🛻' },
    { id: 'mahindra-champion', name: 'Mahindra Champion', capacity: '~1,000 kg capacity', category: 'Mini Trucks (700-1,700 kg)', icon: '🛻' },
    { id: 'pickup-1-7t', name: 'Pickup 1.7 Ton', capacity: '1,700 kg capacity', category: 'Mini Trucks (700-1,700 kg)', icon: '🛻' },
    { id: 'pickup-2-0t', name: 'Pickup 2.0 Ton', capacity: '2,000 kg capacity', category: 'Mini Trucks (700-1,700 kg)', icon: '🛻' },

    // Medium/Large Trucks
    { id: 'tata-407', name: 'Tata 407', capacity: '~2,500 kg', category: 'Medium/Large Trucks', icon: '🚛' },
    { id: 'canter-14ft', name: 'Canter 14ft / Pickup 14ft', capacity: '3,500 kg', category: 'Medium/Large Trucks', icon: '🚛' },
    { id: 'truck-17ft', name: '17ft trucks', capacity: '6,000 kg', category: 'Medium/Large Trucks', icon: '🚛' },
  ];

  // Group vehicles by category
  const categories = Array.from(new Set(vehicleOptions.map((v) => v.category)));

  // State to track open categories (closed by default)
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    if (openCategories.includes(category)) {
      setOpenCategories(openCategories.filter((c) => c !== category));
    } else {
      setOpenCategories([...openCategories, category]);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Two-Wheeler':
        return '🛵';
      case 'Three-Wheeler':
        return '🛺';
      case 'Mini Trucks (700-1,700 kg)':
        return '🛻';
      case 'Medium/Large Trucks':
        return '🚛';
      default:
        return '📦';
    }
  };

  const handleConfirm = () => {
    if (!selectedId) return;
    const selectedVehicle = vehicleOptions.find((v) => v.id === selectedId);
    if (selectedVehicle) {
      onConfirm(selectedVehicle);
    }
  };

  return (
    <div className="flex flex-col flex-1 animate-fade-in w-full max-w-7xl mx-auto px-6 py-6 pb-20">
      {/* Header */}
      <div className="pb-4 border-b border-[#E0E0E0] mb-8 flex items-center min-h-[56px] w-full">
        <button
          onClick={onBack}
          className="text-2xl text-[#1A1A1A] mr-4 cursor-pointer bg-none border-none p-0 line-height-1"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Select Vehicle</h1>
      </div>

      {/* Accordion Categories List */}
      <div className="space-y-4 mb-8 w-full">
        {categories.map((category) => {
          const isOpen = openCategories.includes(category);
          return (
            <div key={category} className="border border-[#E0E0E0] rounded-2xl bg-white overflow-hidden shadow-sm">
              {/* Accordion Trigger Header */}
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="w-full flex justify-between items-center px-5 py-4 bg-gray-50/50 hover:bg-gray-50 transition-colors border-none outline-none cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{getCategoryIcon(category)}</span>
                  <h3 className="text-base font-bold text-[#00B14F] border-l-4 border-[#00B14F] pl-2.5">
                    {category}
                  </h3>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Accordion Content */}
              {isOpen && (
                <div className="p-4 border-t border-[#E0E0E0] bg-white animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {vehicleOptions
                      .filter((v) => v.category === category)
                      .map((vehicle) => {
                        const isSelected = selectedId === vehicle.id;
                        return (
                          <div
                            key={vehicle.id}
                            onClick={() => setSelectedId(vehicle.id)}
                            className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition-all min-h-[70px] ${isSelected
                                ? 'border-2 border-[#00B14F] bg-[#E6F6EE] shadow-sm'
                                : 'border-[#E0E0E0] bg-white hover:border-[#00B14F] hover:shadow-sm'
                              }`}
                          >
                            <div className="vehicle-info">
                              <h4 className="text-sm font-bold text-[#1A1A1A] mb-0.5">{vehicle.name}</h4>
                              <p className="text-xs text-[#666666]">{vehicle.capacity}</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirm CTA */}
      <div className="w-full flex justify-center mt-4">
        <button
          onClick={handleConfirm}
          disabled={!selectedId}
          className={`w-full max-w-xl py-4 rounded-xl text-base font-bold uppercase tracking-wide transition-all border-none ${selectedId
              ? 'bg-[#00B14F] hover:bg-[#009542] text-white cursor-pointer active:scale-[0.99] shadow-sm'
              : 'bg-[#E0E0E0] text-[#666666] cursor-not-allowed'
            }`}
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
