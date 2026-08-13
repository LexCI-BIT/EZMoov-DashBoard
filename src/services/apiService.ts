import type { Coordinates, FareBreakdown, LocationInfo, Vehicle, BookingPayload } from '../types/booking';

// Updated Mock vehicle database with categories, sizes, and 0-3 km fixed base fares
export const mockVehicles: Vehicle[] = [
  // 1. Two-Wheelers
  { id: 'v1', name: 'Bike', category: 'Two-Wheelers', capacity: 'up to 10 kg', description: ' ', baseFare: 100, perKmRate: 5, icon: 'FaMotorcycle' },
  { id: 'v2', name: 'Scooter', category: 'Two-Wheelers', capacity: 'up to 20 kg', description: ' ', baseFare: 100, perKmRate: 5, icon: 'FaBiking' },
  
  // 2. Three-Wheelers
  { id: 'v3', name: '3 Wheeler (Tempo)', category: 'Three-Wheelers', capacity: '~500 kg', description: ' ', baseFare: 175, perKmRate: 8, icon: 'FaTruck' },
  { id: 'v4', name: '3 Wheeler Electric', category: 'Three-Wheelers', capacity: '~500 kg', description: ' ', baseFare: 175, perKmRate: 8, icon: 'FaTruck' },
  { id: 'v5', name: 'E-Rickshaw Loader', category: 'Three-Wheelers', capacity: '~500 kg', description: ' ', baseFare: 175, perKmRate: 8, icon: 'FaTruck' },
  { id: 'v6', name: 'Mahindra Champion', category: 'Three-Wheelers', capacity: '~500 kg', description: 'approx. 5ft', baseFare: 175, perKmRate: 8, icon: 'FaTruck' },

  // 3. Mini Trucks
  { id: 'v7', name: 'Tata Ace (Chota Hathi)', category: 'Mini Trucks', capacity: '750 kg', description: 'approx. 7ft', baseFare: 200, perKmRate: 10, icon: 'FaTruckPickup' },
  { id: 'v8', name: 'Maruti Eeco', category: 'Mini Trucks', capacity: '~700 kg', description: 'approx. 6.5ft', baseFare: 200, perKmRate: 10, icon: 'FaCarSide' },
  { id: 'v9', name: 'Tata Super Ace', category: 'Mini Trucks', capacity: '1,000 kg', description: 'approx. 8ft', baseFare: 250, perKmRate: 12, icon: 'FaTruckPickup' },
  { id: 'v10', name: 'Mahindra Bolero Pik-Up', category: 'Mini Trucks', capacity: '1,000 kg', description: 'approx. 8ft', baseFare: 250, perKmRate: 12, icon: 'FaTruckPickup' },
  { id: 'v11', name: 'Mahindra Bolero Maxi Truck', category: 'Mini Trucks', capacity: '1,700 kg', description: 'approx. 9ft', baseFare: 270, perKmRate: 15, icon: 'FaTruckMoving' },

  // 4. Medium/Large Trucks
  { id: 'v12', name: 'Tata 407', category: 'Medium/Large Trucks', capacity: '~2,500 kg', description: 'approx. 9ft to 10ft', baseFare: 270, perKmRate: 15, icon: 'FaTruckMoving' },
  { id: 'v13', name: 'Eicher Canter 14ft', category: 'Medium/Large Trucks', capacity: '3,500 kg', description: 'approx. 14ft', baseFare: 300, perKmRate: 20, icon: 'FaTruckMoving' },
  { id: 'v14', name: 'Tata 909 / Eicher 17ft', category: 'Medium/Large Trucks', capacity: '6,000 kg', description: 'approx. 17ft', baseFare: 300, perKmRate: 20, icon: 'FaTruckMoving' },
];

const mockNetworkDelay = () => new Promise((resolve) => setTimeout(resolve, 600));

// Mock Google Places Autocomplete
export const getPlacePredictions = async (input: string): Promise<string[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (!input) return [];
  // Generate fake addresses based on input
  return [
    `${input} Main Street, Downtown`,
    `${input} Avenue, Tech Park`,
    `${input} Road, Sector 12`,
    `${input} Boulevard, Near Mall`
  ];
};

// Mock Google Reverse Geocoding
export const reverseGeocode = async (coords: Coordinates): Promise<string> => {
  await mockNetworkDelay();
  // Return a fake address string based on coordinates
  return `Mock Address ${Math.abs(coords.lat).toFixed(2)}, ${Math.abs(coords.lng).toFixed(2)}`;
};

// Mock Distance Matrix API
export const calculateDistance = async (pickup: LocationInfo, drop: LocationInfo): Promise<number> => {
  await mockNetworkDelay();
  // Fake distance calculation (e.g., 2 to 15 km to properly test the 0-3 km fixed rate logic)
  if (!pickup.coordinates || !drop.coordinates) return 0;
  return Math.floor(Math.random() * 14) + 2; 
};

// Mock Fare Calculation with 0-3 km fixed logic
export const calculateFare = async (vehicle: Vehicle, distanceInKm: number): Promise<FareBreakdown> => {
  await mockNetworkDelay();
  
  const BASE_DISTANCE_KM = 3;
  let distanceCharge = 0;
  
  // If distance is more than 3 km, charge the per km rate for the extra distance only
  if (distanceInKm > BASE_DISTANCE_KM) {
    const extraKms = distanceInKm - BASE_DISTANCE_KM;
    distanceCharge = Math.round(extraKms * vehicle.perKmRate);
  }

  return {
    baseFare: vehicle.baseFare,
    distanceCharge,
    taxes: 0,
    total: vehicle.baseFare + distanceCharge,
    distanceInKm
  };
};

// Mock Booking Confirmation & Driver Allocation
export const confirmBooking = async (_payload: BookingPayload): Promise<{ driverName: string; driverPhone: string; vehicleNumber: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate finding driver
  return {
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 98765 43210',
    vehicleNumber: 'DL 01 AB 1234'
  };
};

// Add this new function to simulate the driver updating the status
export const checkRideStatus = async (_bookingId: string): Promise<'active' | 'completed'> => {
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network request
  
  // Mock logic: 20% chance the driver has completed the ride every time we check
  const isCompleted = Math.random() < 0.2; 
  return isCompleted ? 'completed' : 'active';
};

// Add this new function to simulate Outstation Bidding API
export const findOutstationBid = async (_vehicleId: string): Promise<{
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  bidAmount: number;
}> => {
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network delay
  
  const driverNames = ['Rajesh Kumar', 'Vijay Singh', 'Mahesh Yadav', 'Suresh Patel'];
  // Generate a random bid amount between 1500 and 6000
  const randomAmount = Math.floor(Math.random() * 4500) + 1500; 
  
  return {
    driverName: driverNames[Math.floor(Math.random() * driverNames.length)],
    driverPhone: `+91 98${Math.floor(10000000 + Math.random() * 89999999)}`,
    vehicleNumber: 'DL 01 AB ' + Math.floor(1000 + Math.random() * 8999),
    bidAmount: randomAmount
  };
};

// Add this new function to simulate allocating a Survey Representative
export const bookSurveySlot = async (_slotData: { date: string; time: string; address: string }): Promise<{
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
}> => {
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network delay
  
  const surveyors = ['Anil Sharma', 'Sunil Verma', 'Rakesh Gupta'];
  return {
    driverName: surveyors[Math.floor(Math.random() * surveyors.length)],
    driverPhone: `+91 99${Math.floor(10000000 + Math.random() * 89999999)}`,
    vehicleNumber: 'SURVEY-' + Math.floor(1000 + Math.random() * 8999) // Mock badge ID
  };
};