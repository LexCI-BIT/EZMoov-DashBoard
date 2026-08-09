import type { Coordinates, FareBreakdown, LocationInfo, Vehicle, BookingPayload } from '../types/booking';

// Mock vehicle database
export const mockVehicles: Vehicle[] = [
  { id: 'bike', name: 'Bike', capacity: 'Up to 10 kg', description: 'Groceries, medium boxes, electronics', baseFare: 25, perKmRate: 8, icon: 'FaMotorcycle' },
  { id: 'scooter', name: 'Scooter', capacity: 'Up to 20 kg', description: 'Documents, food, parcels', baseFare: 35, perKmRate: 10, icon: 'FaBiking' },
  { id: 'auto', name: 'Auto (3-Wheeler)', capacity: 'Up to 500 kg', description: 'Electronics, retail', baseFare: 50, perKmRate: 14, icon: 'FaCarSide' },
  { id: 'mini_truck', name: 'Mini Truck', capacity: '750 kg – 1 Ton', description: 'Furniture, commercial', baseFare: 150, perKmRate: 22, icon: 'FaTruck' },
  { id: 'lcv', name: 'LCV', capacity: 'Up to 2.5 Tons', description: 'Industrial, shifting', baseFare: 250, perKmRate: 30, icon: 'FaTruckMoving' },
  { id: 'heavy_truck', name: 'Heavy Truck', capacity: '5+ Tons', description: 'Warehouse, bulk freight', baseFare: 450, perKmRate: 45, icon: 'FaTruckMoving' },
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
  // Fake distance calculation (e.g., 5 to 50 km)
  if (!pickup.coordinates || !drop.coordinates) return 0;
  return Math.floor(Math.random() * 45) + 5; 
};

// Mock Fare Calculation
export const calculateFare = async (vehicle: Vehicle, distanceInKm: number): Promise<FareBreakdown> => {
  await mockNetworkDelay();
  const baseFare = vehicle.baseFare;
  const distanceCharge = Math.round(distanceInKm * vehicle.perKmRate);
  const subtotal = baseFare + distanceCharge;
  const taxes = Math.round(subtotal * 0.05); // 5% tax
  return {
    baseFare,
    distanceCharge,
    taxes,
    total: subtotal + taxes,
    distanceInKm
  };
};

// Mock Booking Confirmation & Driver Allocation
export const confirmBooking = async (payload: BookingPayload): Promise<{ driverName: string; driverPhone: string; vehicleNumber: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate finding driver
  return {
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 98765 43210',
    vehicleNumber: 'DL 01 AB 1234'
  };
};

// ... existing apiService code ...

// Add this new function to simulate the driver updating the status
export const checkRideStatus = async (bookingId: string): Promise<'active' | 'completed'> => {
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network request
  
  // Mock logic: 20% chance the driver has completed the ride every time we check
  const isCompleted = Math.random() < 0.2; 
  return isCompleted ? 'completed' : 'active';
};
// ... existing apiService code ...

// Add this new function to simulate Outstation Bidding API
export const findOutstationBid = async (vehicleId: string): Promise<{
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
// ... existing apiService code ...

// Add this new function to simulate allocating a Survey Representative
export const bookSurveySlot = async (slotData: { date: string; time: string; address: string }): Promise<{
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