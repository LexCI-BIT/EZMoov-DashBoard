import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTruck, FaTruckPickup, FaTruckMoving, FaMotorcycle, FaBiking, FaCarSide, FaArrowRight, FaSpinner } from 'react-icons/fa';
import { useBooking } from '../../context/BookingContext';
import { mockVehicles, calculateDistance, calculateFare } from '../../services/apiService';
import type { Vehicle } from '../../types/booking';

const iconMap: Record<string, React.ReactNode> = {
  FaMotorcycle: <FaMotorcycle />,
  FaBiking: <FaBiking />,
  FaCarSide: <FaCarSide />,
  FaTruck: <FaTruck />,
  FaTruckMoving: <FaTruckMoving />,
  FaTruckPickup: <FaTruckPickup />,
};

// Create a new type that includes the dynamic fare property
type VehicleWithFare = Vehicle & { calculatedTotal: number };

const VehicleSelection: React.FC = () => {
  const navigate = useNavigate();
  const { pickup, drop, setSelectedVehicle } = useBooking();
  
  // Use the new type for the state. Initialize as an empty array.
  const [vehicles, setVehicles] = useState<VehicleWithFare[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety redirect if user accesses page directly without context data
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
          return { ...v, calculatedTotal: fare.total }; // This now matches VehicleWithFare
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white p-4 shadow-sm flex items-center border-b sticky top-0 z-10">
        <FaArrowLeft className="text-gray-800 cursor-pointer mr-4 text-xl" onClick={() => navigate(-1)} />
        <h1 className="text-lg font-semibold text-gray-900">Select Vehicle</h1>
      </header>

      <div className="flex-grow p-4 space-y-3 max-w-md mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <FaSpinner className="animate-spin text-green-600 text-3xl mb-3" />
            <p>Calculating fares...</p>
          </div>
        ) : (
          vehicles.map((v) => (
            <div key={v.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-green-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className="text-3xl text-green-600">{iconMap[v.icon]}</div>
                <div>
                  <h3 className="font-semibold text-gray-900">{v.name}</h3>
                  <p className="text-xs text-gray-500">{v.capacity} • {v.description}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                {/* No more TypeScript error here because v is now of type VehicleWithFare */}
                <span className="font-bold text-gray-900 mb-1">₹{v.calculatedTotal}</span>
                <button 
                  onClick={() => handleSelectVehicle(v)} 
                  className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-500 flex items-center gap-1"
                >
                  Select <FaArrowRight />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VehicleSelection;