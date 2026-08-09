import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTruck, FaSpinner, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close the menu whenever the route changes, otherwise it stays open
  // over the new page after tapping a link.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Escape closes the menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Prevent the page scrolling behind the open mobile menu.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const authedLinks = [
    { to: '/services', label: 'Services' },
    { to: '/bookings', label: 'Bookings' },
    { to: '/profile', label: 'Profile' },
  ];

  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-green-600"
            onClick={() => setMenuOpen(false)}
          >
            <FaTruck className="text-2xl" />
            <span>EZMoov</span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden items-center gap-6 md:flex">
            {loading ? (
              <FaSpinner className="animate-spin text-xl text-green-600" />
            ) : user ? (
              authedLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`text-base font-medium transition-colors ${
                    isActive(l.to) ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  {l.label}
                </Link>
              ))
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-green-600"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-500"
                >
                  Register
                </Link>
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
          <div
            className="fixed inset-0 top-16 z-30 bg-black/30 md:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            className="relative z-40 border-t border-gray-100 bg-white px-4 pb-4 pt-2 shadow-lg md:hidden"
          >
            {user ? (
              <div className="flex flex-col">
                {authedLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={`flex min-h-[48px] items-center rounded-lg px-3 text-base font-medium transition-colors ${
                      isActive(l.to) ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  className="flex min-h-[48px] items-center justify-center rounded-lg border border-gray-200 text-base font-medium text-gray-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex min-h-[48px] items-center justify-center rounded-lg bg-green-600 text-base font-medium text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
