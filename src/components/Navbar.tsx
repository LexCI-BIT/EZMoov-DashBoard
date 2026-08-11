import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTruck, FaSpinner, FaBars, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const handleBookingsClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      toast.info('Please login to view your bookings.');
    }
  };

  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-green-600" onClick={() => setMenuOpen(false)}>
            <FaTruck className="text-2xl" />
            <span>EZMoov</span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden items-center gap-6 md:flex">
            {loading ? (
              <FaSpinner className="animate-spin text-xl text-green-600" />
            ) : (
              <>
                <Link to="/services" className={`text-base font-medium transition-colors ${isActive('/services') ? 'text-green-600' : 'text-gray-600 hover:text-green-600'}`}>
                  Services
                </Link>
                
                <Link 
                  to="/bookings" 
                  onClick={handleBookingsClick}
                  className={`text-base font-medium transition-colors ${isActive('/bookings') ? 'text-green-600' : 'text-gray-600 hover:text-green-600'}`}
                >
                  Bookings
                </Link>

                {user ? (
                  <Link to="/profile" className={`text-base font-medium transition-colors ${isActive('/profile') ? 'text-green-600' : 'text-gray-600 hover:text-green-600'}`}>
                    Profile
                  </Link>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link to="/login" className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-green-600 border border-gray-200">
                      Log In
                    </Link>
                    <Link to="/register" className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-500">
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <div className="flex items-center gap-3 md:hidden">
            {loading && <FaSpinner className="animate-spin text-lg text-green-600" />}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="flex size-11 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100"
            >
              {menuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 top-16 z-30 bg-black/30 md:hidden" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <div id="mobile-menu" className="relative z-40 border-t border-gray-100 bg-white px-4 pb-4 pt-2 shadow-lg md:hidden">
            <div className="flex flex-col">
              <Link to="/services" className={`flex min-h-[48px] items-center rounded-lg px-3 text-base font-medium transition-colors ${isActive('/services') ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                Services
              </Link>
              
              <Link 
                to="/bookings" 
                onClick={handleBookingsClick}
                className={`flex min-h-[48px] items-center rounded-lg px-3 text-base font-medium transition-colors ${isActive('/bookings') ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Bookings
              </Link>

              {user ? (
                <Link to="/profile" className={`flex min-h-[48px] items-center rounded-lg px-3 text-base font-medium transition-colors ${isActive('/profile') ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                  Profile
                </Link>
              ) : (
                <div className="flex flex-col gap-2 mt-4">
                  <Link to="/login" className="flex min-h-[48px] items-center justify-center rounded-lg border border-gray-200 text-base font-medium text-gray-700">
                    Log In
                  </Link>
                  <Link to="/register" className="flex min-h-[48px] items-center justify-center rounded-lg bg-green-600 text-base font-medium text-white">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;