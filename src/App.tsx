import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { BookingsProvider } from './context/BookingsContext';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

// A wrapper component that checks the current URL path
const AppContent: React.FC = () => {
  const location = useLocation();
  
  // Check if we are on an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  // If it's an admin route, render ONLY the routes (no Navbar, no customer layout)
  if (isAdminRoute) {
    return <AppRoutes />;
  }

  // Otherwise, render the standard customer layout with the Navbar
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <AppRoutes />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BookingsProvider>
        <Router>
          <AppContent />
          
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </Router>
      </BookingsProvider>
    </AuthProvider>
  );
};

export default App;