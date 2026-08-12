import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaSpinner, FaChevronDown } from 'react-icons/fa';
import { useBooking } from '../../context/BookingContext';
import { mockVehicles, calculateDistance, calculateFare } from '../../services/apiService';
import type { Vehicle } from '../../types/booking';

// Map colorful emojis specifically for the dropdown category headers
const categoryIcons: Record<string, React.ReactNode> = {
  'Two-Wheelers': <span className="text-xl">🏍️</span>,
  'Three-Wheelers': <span className="text-xl">🛺</span>,
  'Mini Trucks': <span className="text-xl">🚚</span>,
  'Medium/Large Trucks': <span className="text-xl">🚛</span>,
};

type VehicleWithFare = Vehicle & { calculatedTotal: number };

const VehicleSelection: React.FC = () => {
  const navigate = useNavigate();
  const { pickup, drop, setSelectedVehicle } = useBooking();
  
  const [vehicles, setVehicles] = useState<VehicleWithFare[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState<string | null>('Two-Wheelers');

  useEffect(() => {
    if (!pickup.address || !drop.address) {
      navigate('/services/standard-parcel-delivery');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      const distance = await calculateDistance(pickup, drop);
      const vehiclesWithFares = await Promise.all(
        mockVehicles.map(async (v) => {
          const fare = await calculateFare(v, distance);
          return { ...v, calculatedTotal: fare.total };
        })
      );
      setVehicles(vehiclesWithFares);
      setLoading(false);
    };
    fetchData();
  }, [pickup, drop, navigate]);

  const handleSelectVehicle = (veh: Vehicle) => {
    setSelectedVehicle(veh);
    navigate('/booking/fare-estimation');
  };

  const categories = ['Two-Wheelers', 'Three-Wheelers', 'Mini Trucks', 'Medium/Large Trucks'];

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-gray-50 flex flex-col">
      <header className="bg-white p-4 shadow-sm flex items-center border-b sticky top-16 z-10">
        <FaArrowLeft className="text-gray-800 cursor-pointer mr-4 text-xl" onClick={() => navigate(-1)} />
        <h1 className="text-lg font-semibold text-gray-900">Select Vehicle</h1>
      </header>

      <div className="flex-grow p-4 space-y-4 max-w-md mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <FaSpinner className="animate-spin text-green-600 text-3xl mb-3" />
            <p>Calculating fares...</p>
          </div>
        ) : (
          categories.map((category) => {
            const filteredVehicles = vehicles.filter((v) => v.category === category);
            if (filteredVehicles.length === 0) return null;

            const isOpen = openCategory === category;

            return (
              <div key={category} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                {/* Dropdown Header */}
                <button 
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-gray-800 hover:bg-gray-50"
                  onClick={() => setOpenCategory(isOpen ? null : category)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{categoryIcons[category]}</span>
                    <span>{category}</span>
                  </div>
                  <FaChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Content */}
                {isOpen && (
                  <div className="divide-y divide-gray-100">
                    {filteredVehicles.map((v) => (
                      <div key={v.id} className="flex items-center justify-between p-4 hover:bg-green-50 transition-colors">
                        <div className="flex flex-col">
                          <h3 className="font-semibold text-gray-900 text-sm">{v.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{v.capacity} • {v.description}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-gray-900 mb-1">₹{v.calculatedTotal}</span>
                          <button 
                            onClick={() => handleSelectVehicle(v)} 
                            className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-500 flex items-center gap-1"
                          >
                            Select <FaArrowRight />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VehicleSelection;