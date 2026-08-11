import React, { Suspense, lazy } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

import { PublicRoute } from './RouteGaurds';
import { BookingProvider } from '../context/BookingContext';

const Home = lazy(() => import('../pages/Home'));
const Services = lazy(() => import('../pages/Services'));
const Bookings = lazy(() => import('../pages/Bookings'));
const Profile = lazy(() => import('../pages/Profile'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));

const StandardParcelDelivery = lazy(() => import('../pages/services/StandardParcelDelivery'));
const OutstationBidding = lazy(() => import('../pages/services/OutstationBidding'));
const ShiftingExperts = lazy(() => import('../pages/services/ShiftingExperts'));
const LocalAdda = lazy(() => import('../pages/services/LocalAdda'));

const VehicleSelection = lazy(() => import('../pages/booking/VehicleSelection'));
const FareEstimation = lazy(() => import('../pages/booking/FareEstimation'));
const RiderAllocation = lazy(() => import('../pages/booking/RiderAllocation'));
const RiderStatus = lazy(() => import('../pages/booking/RiderStatus'));
const ActiveRideDetails = lazy(() => import('../pages/booking/ActiveRideDetails'));
const CompletedRideDetails = lazy(() => import('../pages/booking/CompletedRideDetails'));

const AdminLayout = lazy(() =>
  import('../components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout }))
);

const RouteFallback: React.FC = () => (
  <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-gray-50">
    <FaSpinner className="animate-spin text-3xl text-green-600" aria-label="Loading" />
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* ADMIN */}
        <Route path="/admin/*" element={<AdminLayout />} />

        {/* PUBLIC HOMEPAGE */}
        <Route path="/" element={<Home />} />

        {/* ALL PAGES NOW PUBLIC */}
        <Route path="/services" element={<Services />} />

        {/* Service pages that start the booking flow share one BookingProvider */}
        <Route element={<BookingProvider><Outlet /></BookingProvider>}>
          <Route path="/services/standard-parcel-delivery" element={<StandardParcelDelivery />} />
          <Route path="/services/local-adda" element={<LocalAdda />} />

          <Route path="/booking/vehicle-selection" element={<VehicleSelection />} />
          <Route path="/booking/fare-estimation" element={<FareEstimation />} />
          <Route path="/booking/rider-allocation" element={<RiderAllocation />} />
          <Route path="/booking/rider-status" element={<RiderStatus />} />
        </Route>

        <Route path="/services/outstation-bidding" element={<OutstationBidding />} />
        <Route path="/services/shifting-experts" element={<ShiftingExperts />} />

        <Route path="/bookings" element={<Bookings />} />
        <Route path="/bookings/active/:id" element={<ActiveRideDetails />} />
        <Route path="/bookings/completed/:id" element={<CompletedRideDetails />} />
        <Route path="/profile" element={<Profile />} />

        {/* AUTH ROUTES - Redirect to home if already logged in */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;