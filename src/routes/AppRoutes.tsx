import React, { Suspense, lazy } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

import { ProtectedRoute, PublicRoute } from './RouteGaurds';
import { BookingProvider } from '../context/BookingContext';

/*
  Every route is lazy-loaded so the browser only downloads the screen it needs.
  This matters most for the admin panel: it pulls in recharts (the single
  biggest dependency) and a customer will never open it.

  Note the casing — the directory on disk is `Pages`, not `pages`. Windows and
  macOS are case-insensitive so a mismatch works locally, but a Linux CI build
  fails with "module not found". Keep these capitalised.
*/
const Home = lazy(() => import('../Pages/Home'));
const Services = lazy(() => import('../Pages/Services'));
const Bookings = lazy(() => import('../Pages/Bookings'));
const Profile = lazy(() => import('../Pages/Profile'));
const Login = lazy(() => import('../Pages/Login'));
const Register = lazy(() => import('../Pages/Register'));
const ForgotPassword = lazy(() => import('../Pages/ForgotPassword'));

const StandardParcelDelivery = lazy(() => import('../Pages/services/StandardParcelDelivery'));
const OutstationBidding = lazy(() => import('../Pages/services/OutstationBidding'));
const ShiftingExperts = lazy(() => import('../Pages/services/ShiftingExperts'));
const LocalAdda = lazy(() => import('../Pages/services/LocalAdda'));

const VehicleSelection = lazy(() => import('../Pages/booking/VehicleSelection'));
const FareEstimation = lazy(() => import('../Pages/booking/FareEstimation'));
const RiderAllocation = lazy(() => import('../Pages/booking/RiderAllocation'));
const RiderStatus = lazy(() => import('../Pages/booking/RiderStatus'));
const ActiveRideDetails = lazy(() => import('../Pages/booking/ActiveRideDetails'));
const CompletedRideDetails = lazy(() => import('../Pages/booking/CompletedRideDetails'));

// AdminLayout is a named export, so map it onto the default `lazy()` expects.
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
        {/* ADMIN — renders standalone via the conditional layout in App.tsx */}
        <Route path="/admin/*" element={<AdminLayout />} />

        {/* PUBLIC HOMEPAGE */}
        <Route path="/" element={<Home />} />

        {/* PROTECTED */}
        <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />

        {/* Service pages that start the booking flow share one BookingProvider */}
        <Route element={<ProtectedRoute><BookingProvider><Outlet /></BookingProvider></ProtectedRoute>}>
          <Route path="/services/standard-parcel-delivery" element={<StandardParcelDelivery />} />
          <Route path="/services/local-adda" element={<LocalAdda />} />

          <Route path="/booking/vehicle-selection" element={<VehicleSelection />} />
          <Route path="/booking/fare-estimation" element={<FareEstimation />} />
          <Route path="/booking/rider-allocation" element={<RiderAllocation />} />
          <Route path="/booking/rider-status" element={<RiderStatus />} />
        </Route>

        {/* These service pages manage their own internal flow/state */}
        <Route path="/services/outstation-bidding" element={<ProtectedRoute><OutstationBidding /></ProtectedRoute>} />
        <Route path="/services/shifting-experts" element={<ProtectedRoute><ShiftingExperts /></ProtectedRoute>} />

        <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
        <Route path="/bookings/active/:id" element={<ProtectedRoute><ActiveRideDetails /></ProtectedRoute>} />
        <Route path="/bookings/completed/:id" element={<ProtectedRoute><CompletedRideDetails /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* PUBLIC */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
