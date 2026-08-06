import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import heroImg from './assets/hero.png';
import './App.css';
import { AdminLayout } from './components/admin/AdminLayout';
import { Shield, ArrowRight } from 'lucide-react';

function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  if (currentPath === '/admin' || currentPath.startsWith('/admin')) {
    return <AdminLayout onNavigateHome={() => navigateTo('/')} />;
  }

  return (
    <div className="min-h-dvh w-full bg-ink-950 text-slate-200">
      {/* Admin access banner — stacks on phones so nothing gets squeezed */}
      <div className="flex flex-col gap-3 border-b border-line bg-[#121824] px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-2 text-slate-300 sm:items-center">
          <Shield className="mt-0.5 size-4 shrink-0 text-brand-500 sm:mt-0" />
          <span className="text-xs sm:text-sm">
            EZMoov Super Admin Panel is available at <code>/admin</code>
          </span>
        </div>
        <button
          onClick={() => navigateTo('/admin')}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-brand-500 px-4 py-2 text-xs font-bold text-[#062E21] transition hover:bg-brand-400 active:scale-[0.98] sm:w-auto"
        >
          <span>Go to Admin Portal</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>

      <div className="mx-auto w-full max-w-[1126px] px-4 py-5 sm:px-5">
        <section id="center">
          <div className="hero">
            <img src={heroImg} className="base" width="170" height="179" alt="" />
            <img src={reactLogo} className="framework" alt="React logo" />
            <img src={viteLogo} className="vite" alt="Vite logo" />
          </div>

          <div className="text-center">
            {/* Fluid type: scales smoothly instead of jumping at one breakpoint */}
            <h1 className="text-[clamp(2rem,7vw,3.5rem)] font-semibold tracking-tight text-slate-100">
              EZMoov Webapp
            </h1>
            <p className="mt-3 text-balance text-sm text-slate-400 sm:text-base">
              Smart Logistics &amp; Fleet Operations Platform
            </p>
          </div>

          <div className="mt-6 flex w-full justify-center">
            <button
              onClick={() => navigateTo('/admin')}
              className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-[#062E21] shadow-[0_4px_14px_rgba(16,185,129,0.4)] transition hover:bg-brand-400 active:scale-[0.98] sm:w-auto sm:text-[15px]"
            >
              <Shield className="size-[18px] shrink-0" />
              <span className="truncate">Open Super Admin Dashboard</span>
            </button>
          </div>
        </section>

        <div className="ticks" />

        <section id="next-steps">
          <div id="docs">
            <svg className="icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#documentation-icon" />
            </svg>
            <h2 className="text-lg sm:text-xl">Super Admin Features</h2>
            <p className="mt-1 text-sm text-slate-400">Built with EZMoov UI specifications</p>
            <ul>
              <li>
                <a href="/admin" onClick={(e) => { e.preventDefault(); navigateTo('/admin'); }}>
                  Live Dashboard Analytics &amp; Stats
                </a>
              </li>
              <li>
                <a href="/admin" onClick={(e) => { e.preventDefault(); navigateTo('/admin'); }}>
                  Driver Verification Queue
                </a>
              </li>
              <li>
                <a href="/admin" onClick={(e) => { e.preventDefault(); navigateTo('/admin'); }}>
                  Weekly Earnings &amp; Bookings Visualizer
                </a>
              </li>
            </ul>
          </div>

          <div id="social">
            <svg className="icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#social-icon" />
            </svg>
            <h2 className="text-lg sm:text-xl">EZMoov Quick Navigation</h2>
            <p className="mt-1 text-sm text-slate-400">Switch routes easily</p>
            <ul>
              <li>
                <a href="/" onClick={(e) => { e.preventDefault(); navigateTo('/'); }}>
                  Home Page (/)
                </a>
              </li>
              <li>
                <a href="/admin" onClick={(e) => { e.preventDefault(); navigateTo('/admin'); }}>
                  Super Admin Login (/admin)
                </a>
              </li>
            </ul>
          </div>
        </section>

        <div className="ticks" />
        <section id="spacer" />
      </div>
    </div>
  );
}

export default App;
