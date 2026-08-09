import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

import Home from '../pages/Home';
import Services from '../pages/Services';
import Bookings from '../pages/Bookings';
import Profile from '../pages/Profile';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';

// ... existing imports (Home, Services, Bookings, etc.)
import { AdminLayout } from '../components/admin/AdminLayout'; // Import your Admin Layout

import StandardParcelDelivery from '../pages/services/StandardParcelDelivery';
import OutstationBidding from '../pages/services/OutstationBidding';
import ShiftingExperts from '../pages/services/ShiftingExperts';
import LocalAdda from '../pages/services/LocalAdda'; // Ensure imported

// Booking Flow Pages
import VehicleSelection from '../pages/booking/VehicleSelection';
import FareEstimation from '../pages/booking/FareEstimation';
import RiderAllocation from '../pages/booking/RiderAllocation';
import RiderStatus from '../pages/booking/RiderStatus';

import ActiveRideDetails from '../pages/booking/ActiveRideDetails';
import CompletedRideDetails from '../pages/booking/CompletedRideDetails';

import { ProtectedRoute, PublicRoute } from './RouteGaurds';
import { BookingProvider } from '../context/BookingContext';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
        {/* ADMIN ROUTE - Renders standalone because of the App.tsx conditional logic */}
      <Route path="/admin/*" element={<AdminLayout />} />
      {/* PUBLIC HOMEPAGE */}
      <Route path="/" element={<Home />} />
      
      {/* PROTECTED ROUTES */}
      <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
      
      {/* Wrap Service Pages that initiate the booking flow inside BookingProvider */}
      <Route element={<ProtectedRoute><BookingProvider><Outlet /></BookingProvider></ProtectedRoute>}>
        
        <Route path="/services/standard-parcel-delivery" element={<StandardParcelDelivery />} />
        <Route path="/services/local-adda" element={<LocalAdda />} /> {/* MOVED INSIDE PROVIDER */}
        
        {/* Shared Booking Flow Routes */}
        <Route path="/booking/vehicle-selection" element={<VehicleSelection />} />
        <Route path="/booking/fare-estimation" element={<FareEstimation />} />
        <Route path="/booking/rider-allocation" element={<RiderAllocation />} />
        <Route path="/booking/rider-status" element={<RiderStatus />} />
      </Route>

      {/* These service pages handle their own internal flow/state */}
      <Route path="/services/outstation-bidding" element={<ProtectedRoute><OutstationBidding /></ProtectedRoute>} />
      <Route path="/services/shifting-experts" element={<ProtectedRoute><ShiftingExperts /></ProtectedRoute>} />
      
      <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
      <Route path="/bookings/active/:id" element={<ProtectedRoute><ActiveRideDetails /></ProtectedRoute>} />
      <Route path="/bookings/completed/:id" element={<ProtectedRoute><CompletedRideDetails /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* PUBLIC ROUTES */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
    </Routes>
  );
};

export default AppRoutes;