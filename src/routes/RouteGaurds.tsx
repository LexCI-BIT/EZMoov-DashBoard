import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSpinner } from 'react-icons/fa';

// For pages like Home, Services, Bookings, Profile (Requires Login)
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <FaSpinner className="animate-spin text-green-600 text-4xl mb-4" />
        <p className="text-gray-600">Loading EZMoov...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// For pages like Login, Register (Redirect to Home if already logged in)
export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <FaSpinner className="animate-spin text-green-600 text-4xl mb-4" />
        <p className="text-gray-600">Loading EZMoov...</p>
      </div>
    );
  }

  if (user) {
    // Redirect to home if already logged in
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};