import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
  Cell,
} from 'recharts';
import {
  Shield,
  Home,
  UserCheck,
  Users,
  Search,
  Moon,
  Sun,
  Bell,
  Car,
  Calendar,
  IndianRupee,
  LogOut,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
  Info,
  Menu,
  X,
  Phone,
  Star,
  Mail,
  Route,
  ClipboardList,
  User,
  Settings,
  ShieldCheck,
  Megaphone
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAdminData } from '../../hooks/useAdminData';
import { DriverReview } from './DriverReview';
import { CustomerDetail } from './CustomerDetail';
import { DriverProfile } from './DriverProfile';
import { AnnouncementsTab } from './AnnouncementsTab';
import { driverStatus, formatCompactRupees, formatRupees } from '../../lib/adminQueries';
import type { CustomerView, DriverRow } from '../../lib/types';

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = 'home' | 'drivers' | 'verified_drivers' | 'users' | 'announcements';

/** Round a max value up to a readable axis ceiling. */
function niceCeiling(max: number, step: number): number {
  if (max <= 0) return step;
  return Math.ceil(max / step) * step;
}

/* ------------------------------- primitives ------------------------------- */

const StatusPill: React.FC<{ status: 'VERIFIED' | 'PENDING' }> = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-xl border px-2.5 py-1 text-[11px] font-bold tracking-wide ${
      status === 'VERIFIED'
        ? 'border-brand-500/20 bg-brand-500/10 text-brand-500'
        : 'border-amber-500/20 bg-amber-500/10 text-amber-500'
    }`}
  >
    {status === 'VERIFIED' ? (
      <CheckCircle2 className="mr-1 size-3" />
    ) : (
      <AlertCircle className="mr-1 size-3" />
    )}
    {status}
  </span>
);

const Avatar: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-500/15">
    <span className="text-sm font-bold text-brand-500">{(label || '?').charAt(0).toUpperCase()}</span>
  </div>
);

/** Label/value pair used inside the mobile card rows. */
const Field = ({ label, children, icon }: { label: string; children: React.ReactNode; icon?: React.ReactNode }) => (
  <div className="min-w-0">
    <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
      {icon && <span className="text-slate-400">{icon}</span>}
      {label}
    </dt>
    <dd className="mt-0.5 truncate text-[13px] font-medium text-slate-200">{children}</dd>
  </div>
);

const EmptyRow: React.FC<{ message: string }> = ({ message }) => (
  <div className="px-5 py-8 text-center text-[13px] text-slate-500">{message}</div>
);

const th = 'px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500';
const td = 'px-6 py-4 text-[13px] text-slate-300';
const cardBox = 'relative rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.05] via-transparent to-transparent bg-ink-900/70 backdrop-blur-2xl shadow-[0_15px_35px_-5px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] ring-1 ring-white/[0.02] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(16,185,129,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] hover:border-brand-500/40 hover:bg-ink-900/90';
const iconBtn =
  'flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-ink-700 text-slate-400 transition hover:text-slate-200 disabled:opacity-50';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [usersSubTab, setUsersSubTab] = useState<'customers' | 'drivers'>('customers');
  /** When set, the Driver Verification tab shows the review screen instead of the list. */
  const [reviewDriverId, setReviewDriverId] = useState<string | null>(null);
  /** Users tab: which profile is open, if any. */
  const [viewCustomerId, setViewCustomerId] = useState<string | null>(null);
  const [viewDriverId, setViewDriverId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<{ name: string; email: string }>({ name: 'Admin', email: '' });

  const { data, loading, error, refreshing, lastUpdated, refresh } = useAdminData();

  // Show who is actually signed in, rather than a hardcoded name.
  useEffect(() => {
    let cancelled = false;
    void supabase.auth.getUser().then(({ data: userData }) => {
      if (cancelled || !userData.user) return;
      const meta = userData.user.user_metadata as { full_name?: string } | undefined;
      setAdmin({
        name: meta?.full_name?.trim() || 'Admin',
        email: userData.user.email ?? '',
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Handle theme toggling
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!sidebarOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sidebarOpen]);

  // Escape closes the drawer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setShowNotifications(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const drivers = data?.drivers ?? [];
  const customers = data?.customers ?? [];
  const weeklyBookings = data?.weeklyBookings ?? [];
  const weeklyEarnings = data?.weeklyEarnings ?? [];

  const pendingDrivers = useMemo(() => drivers.filter((d) => !d.is_verified), [drivers]);
  const verifiedDrivers = useMemo(() => drivers.filter((d) => d.is_verified), [drivers]);

  const driverMap = useMemo(() => {
    const sorted = [...drivers].sort(
      (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    );
    const map = new Map<string, string>();
    sorted.forEach((d, i) => {
      map.set(d.id, `EZMD${(i + 1).toString().padStart(4, '0')}`);
    });
    return map;
  }, [drivers]);

  /* ---------------------------- search filtering --------------------------- */

  const q = searchQuery.trim().toLowerCase();

  const filteredDrivers = useMemo(
    () =>
      drivers.filter(
        (d: DriverRow) => {
          const ezmdId = driverMap.get(d.id) || '';
          return (
            !q ||
            d.name?.toLowerCase().includes(q) ||
            d.phone?.toLowerCase().includes(q) ||
            d.email?.toLowerCase().includes(q) ||
            ezmdId.toLowerCase().includes(q)
          );
        }
      ),
    [drivers, q, driverMap]
  );

  const filteredPendingDrivers = useMemo(
    () => filteredDrivers.filter((d) => !d.is_verified),
    [filteredDrivers]
  );

  const filteredVerifiedDrivers = useMemo(
    () => filteredDrivers.filter((d) => d.is_verified),
    [filteredDrivers]
  );

  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (c: CustomerView) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      ),
    [customers, q]
  );

  /* ------------------------------ chart scales ----------------------------- */

  const bookingsMax = useMemo(
    () => niceCeiling(Math.max(0, ...weeklyBookings.map((b) => b.count)), 10),
    [weeklyBookings]
  );

  const earningsMax = useMemo(
    () => niceCeiling(Math.max(0, ...weeklyEarnings.map((e) => e.revenue)), 2000),
    [weeklyEarnings]
  );

  /* ----------------------------- notifications ----------------------------- */

  const notifications = useMemo(() => {
    const items: { icon: 'warn' | 'ok'; title: string; body: string }[] = [];

    for (const d of pendingDrivers.slice(0, 3)) {
      items.push({
        icon: 'warn',
        title: 'Driver awaiting verification',
        body: `${d.name || 'Unnamed'} · ${d.is_documents_uploaded ? 'documents submitted' : 'documents pending'}`,
      });
    }

    if (data && data.stats.bookingsToday > 0) {
      items.push({
        icon: 'ok',
        title: `${data.stats.bookingsToday} booking${data.stats.bookingsToday === 1 ? '' : 's'} today`,
        body: `${formatRupees(data.stats.earningsToday)} from completed trips`,
      });
    }

    return items;
  }, [pendingDrivers, data]);

  const goToTab = (tab: Tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    // Leaving the tab should drop the open review, not resurrect it later.
    setReviewDriverId(null);
    setViewCustomerId(null);
    setViewDriverId(null);
  };

  const navItem = (tab: Tab) =>
    `flex min-h-[44px] w-full items-center gap-3 rounded-[10px] px-4 py-3 text-sm transition ${
      activeTab === tab
        ? 'border-l-[3px] border-brand-500 bg-brand-950 font-semibold text-brand-500'
        : 'font-medium text-slate-400 hover:bg-white/5'
    }`;

  const pageTitle =
    activeTab === 'home'
      ? 'Dashboard Overview'
      : activeTab === 'drivers'
        ? 'Driver Verification Queue'
      : activeTab === 'verified_drivers'
        ? 'Verified Drivers'
      : activeTab === 'announcements'
        ? 'Announcements'
        : 'User Management';

  /* -------------------------------- render --------------------------------- */

  return (
    <div className="flex min-h-dvh w-full bg-ink-950 font-sans text-slate-200">
      {/* Drawer backdrop — mobile only */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR — off-canvas drawer below lg, static column at lg and up */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] shrink-0 flex-col border-r border-line bg-ink-900 px-4 py-6 transition-transform duration-300 ease-out lg:static lg:z-auto lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center gap-3 pl-2">
          <img src="/ezmoov-icon.png" alt="Logo" className="h-9 w-auto object-contain" />
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight">
              <span className="text-white">EZ</span>
              <span className="bg-gradient-to-r from-brand-400 to-[#EAB308] bg-clip-text text-transparent">moov</span>
            </span>
            <span className="text-[11px] font-medium text-slate-500">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="ml-auto flex size-9 items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5">
          <button onClick={() => goToTab('home')} className={navItem('home')}>
            <Home className={`size-[18px] ${activeTab === 'home' ? 'text-brand-500' : 'text-slate-400'}`} />
            <span className="flex-1 text-left">Home</span>
          </button>

          <button onClick={() => goToTab('drivers')} className={navItem('drivers')}>
            <UserCheck className={`size-[18px] ${activeTab === 'drivers' ? 'text-brand-500' : 'text-slate-400'}`} />
            <span className="flex-1 text-left">Driver Verification</span>
            {pendingDrivers.length > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white">
                {pendingDrivers.length}
              </span>
            )}
          </button>

          <button onClick={() => goToTab('verified_drivers')} className={navItem('verified_drivers')}>
            <CheckCircle2 className={`size-[18px] ${activeTab === 'verified_drivers' ? 'text-brand-500' : 'text-slate-400'}`} />
            <span className="flex-1 text-left">Verified Drivers</span>
          </button>

          <button onClick={() => goToTab('users')} className={navItem('users')}>
            <Users className={`size-[18px] ${activeTab === 'users' ? 'text-brand-500' : 'text-slate-400'}`} />
            <span className="flex-1 text-left">Users</span>
          </button>

          <button onClick={() => goToTab('announcements')} className={navItem('announcements')}>
            <Megaphone className={`size-[18px] ${activeTab === 'announcements' ? 'text-brand-500' : 'text-slate-400'}`} />
            <span className="flex-1 text-left">Announcements</span>
          </button>
        </nav>

        <div className="mt-auto flex items-center gap-3 rounded-[10px] border border-line bg-ink-700 p-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-500">
            <span className="text-sm font-bold text-[#062E21]">{admin.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[13px] font-semibold text-white">{admin.name}</span>
            <span className="truncate text-[11px] text-slate-500" title={admin.email}>
              {admin.email || '—'}
            </span>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            aria-label="Logout"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:text-slate-200"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-6 lg:px-9 lg:py-7">
        <header className="mb-6 flex flex-col gap-4 lg:mb-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className={`${iconBtn} lg:hidden`}
            >
              <Menu className="size-[18px]" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-white sm:text-xl lg:text-[22px]">{pageTitle}</h1>
              <p className="mt-0.5 truncate text-xs text-slate-400 sm:text-[13px]">
                {lastUpdated
                  ? `Live from Supabase · updated ${lastUpdated.toLocaleTimeString()}`
                  : 'Connecting to Supabase…'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex min-w-0 flex-1 items-center lg:w-[200px] lg:flex-none">
              <input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search drivers and customers"
                className="h-9 w-full rounded-full border border-line bg-ink-700 pl-4 pr-10 text-base text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500 sm:text-[13px]"
              />
              <Search className="pointer-events-none absolute right-3.5 size-4 text-slate-500" />
            </div>

            <button
              onClick={refresh}
              disabled={refreshing || loading}
              className={iconBtn}
              title="Refresh data"
              aria-label="Refresh data"
            >
              <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle Theme"
              aria-label="Toggle theme"
              className="hidden h-6 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 sm:flex"
            >
              {isDarkMode ? <Moon className="size-4 text-white" /> : <Sun className="size-4 text-amber-500" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`${iconBtn} relative`}
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="size-[18px]" />
                {notifications.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-[min(280px,calc(100vw-2rem))] rounded-xl border border-line bg-ink-700 p-3 shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
                  <div className="mb-2.5 border-b border-line pb-1.5 text-[13px] font-bold text-slate-50">
                    Notifications
                  </div>
                  {notifications.length === 0 && (
                    <div className="py-1 text-xs text-slate-500">Nothing to report.</div>
                  )}
                  {notifications.map((n, i) => (
                    <div key={i} className="mb-2.5 flex items-start gap-2.5 last:mb-0">
                      {n.icon === 'warn' ? (
                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-500" />
                      )}
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold">{n.title}</div>
                        <div className="text-xs text-slate-400">{n.body}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONNECTION ERROR */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex flex-col gap-3 rounded-[10px] border border-red-500/30 bg-red-500/10 p-4 text-[13px] text-red-300 sm:flex-row sm:items-center"
          >
            <AlertCircle className="size-[18px] shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 font-bold">Couldn't load data from Supabase</div>
              <div className="break-words text-xs opacity-85">{error}</div>
            </div>
            <button
              onClick={refresh}
              className="shrink-0 rounded-lg border border-red-500/35 bg-red-500/15 px-3.5 py-2 text-xs font-bold text-red-300"
            >
              Retry
            </button>
          </div>
        )}

        {/* INITIAL LOAD */}
        {loading && !data && (
          <div className="flex items-center justify-center gap-3 py-20 text-sm text-slate-400">
            <Loader2 className="size-5 animate-spin text-brand-500" />
            <span>Loading live data…</span>
          </div>
        )}

        {/* ------------------------------ HOME ------------------------------ */}
        {activeTab === 'home' && data && (
          <div className="flex flex-col gap-5 lg:gap-6">
            {/* STAT CARDS: 1 col phone → 2 col tablet → 4 col desktop */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
              <div className={`${cardBox} flex flex-col p-5`}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-[10px] bg-brand-950">
                    <Users className="size-5 text-brand-500" />
                  </div>
                  <span className="text-xs font-medium text-slate-400">Active</span>
                </div>
                <div className="text-3xl font-bold leading-none tracking-tight text-white">
                  {data.stats.totalCustomers}
                </div>
                <div className="mt-1.5 text-[13px] text-slate-400">Total Customers</div>
              </div>

              <div className={`${cardBox} flex flex-col p-5`}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-[10px] bg-brand-950">
                    <Car className="size-5 text-brand-500" />
                  </div>
                  <span className="text-xs font-medium text-slate-400">{verifiedDrivers.length} verified</span>
                </div>
                <div className="text-3xl font-bold leading-none tracking-tight text-white">
                  {data.stats.totalDrivers}
                </div>
                <div className="mt-1.5 text-[13px] text-slate-400">Total Drivers</div>
              </div>

              <div className={`${cardBox} flex flex-col p-5`}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-[10px] bg-[#0F2238]">
                    <Calendar className="size-5 text-sky-400" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-[7px] rounded-full bg-brand-500 shadow-[0_0_8px_#10B981]" />
                    <span className="text-xs font-medium text-slate-400">Live</span>
                  </div>
                </div>
                <div className="text-3xl font-bold leading-none tracking-tight text-white">
                  {data.stats.bookingsToday}
                </div>
                <div className="mt-1.5 text-[13px] text-slate-400">Total Bookings Today</div>
              </div>

              <div className={`${cardBox} flex flex-col p-5`}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-[10px] bg-[#29210E]">
                    <IndianRupee className="size-5 text-amber-500" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-[7px] rounded-full bg-brand-500 shadow-[0_0_8px_#10B981]" />
                    <span className="text-xs font-medium text-slate-400">Live</span>
                  </div>
                </div>
                <div className="text-3xl font-bold leading-none tracking-tight text-white">
                  {formatRupees(data.stats.earningsToday)}
                </div>
                <div className="mt-1.5 text-[13px] text-slate-400">Total Earnings Today</div>
              </div>
            </div>

            {/* CHARTS: stacked until xl */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <div className={`${cardBox} flex flex-col p-4 sm:p-5`}>
                <div className="mb-4">
                  <h2 className="text-base font-bold text-white">Bookings This Week</h2>
                  <p className="mt-1 text-xs text-slate-400">Total bookings per day</p>
                </div>
                <div className="-ml-4 h-[200px] sm:h-[230px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyBookings}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 11 }}
                        width={32}
                        allowDecimals={false}
                        domain={[0, bookingsMax]}
                      />
                      <RechartsTooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#fff',
                        }}
                        itemStyle={{ color: '#22C55E' }}
                        formatter={(value) => [`${Number(value ?? 0)}`, 'Bookings']}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        {weeklyBookings.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.isToday ? '#22C55E' : '#15803D'}
                            style={entry.isToday ? { filter: 'drop-shadow(0px 0px 8px rgba(34, 197, 94, 0.6))' } : {}}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={`${cardBox} flex flex-col p-4 sm:p-5`}>
                <div className="mb-4">
                  <h2 className="text-base font-bold text-white">Earnings This Week</h2>
                  <p className="mt-1 text-xs text-slate-400">Revenue per day (completed trips)</p>
                </div>
                <div className="-ml-4 h-[200px] sm:h-[230px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyEarnings}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22C55E" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 11 }}
                        width={46}
                        domain={[0, earningsMax]}
                        tickFormatter={(value: number) => formatCompactRupees(value)}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#fff',
                        }}
                        itemStyle={{ color: '#22C55E' }}
                        formatter={(value) => [formatRupees(Number(value ?? 0)), 'Revenue']}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#22C55E"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        activeDot={{ r: 6, fill: '#10B981', stroke: '#0B0F17', strokeWidth: 2 }}
                        dot={{ r: 4, fill: '#10B981', stroke: '#0B0F17', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------ ANNOUNCEMENTS ------------------------ */}
        {activeTab === 'announcements' && (
          <AnnouncementsTab />
        )}

        {/* ------------------------ DRIVER VERIFICATION ------------------------ */}
        {activeTab === 'drivers' && data && reviewDriverId && (
          <DriverReview
            driverId={reviewDriverId}
            onBack={() => setReviewDriverId(null)}
            onChanged={refresh}
          />
        )}

        {activeTab === 'drivers' && data && !reviewDriverId && (
          <div className={`${cardBox} flex flex-col py-5`}>
            <div className="mb-5 px-5">
              <h2 className="mb-1.5 text-lg font-bold text-slate-50">Drivers Awaiting Verification</h2>
              <p className="text-xs text-slate-500">
                {pendingDrivers.length} unverified
              </p>
            </div>

            {filteredPendingDrivers.length === 0 ? (
              <EmptyRow message={q ? `No pending drivers match "${searchQuery}".` : 'No drivers awaiting verification.'} />
            ) : (
              <>
                {/* Phone/tablet: stacked cards */}
                <ul className="flex flex-col gap-3 px-4 md:hidden">
                  {filteredPendingDrivers.map((drv) => {
                    const steps = [drv.is_vehicle_added, drv.is_documents_uploaded, drv.is_bank_details_added].filter(Boolean).length;
                    return (
                      <li key={drv.id} className="rounded-xl border border-line bg-ink-850 p-4">
                        <div className="mb-3 flex items-center gap-3">
                          <Avatar label={drv.name} />
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-200">
                            {drv.name || '—'}
                          </span>
                          <StatusPill status={driverStatus(drv)} />
                        </div>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                          <div className="col-span-2 min-w-0">
                            <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                              <ClipboardList className="size-3 text-slate-400" />
                              Unique ID
                            </dt>
                            <dd className="mt-0.5 truncate font-mono text-[11px] text-slate-400">{driverMap.get(drv.id)}</dd>
                          </div>
                          <Field label="Phone" icon={<Phone className="size-3" />}>{drv.phone || '—'}</Field>
                          <Field label="Onboarding" icon={<Route className="size-3" />}>{steps}/3 steps</Field>
                          <div className="col-span-2 min-w-0">
                            <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                              <Mail className="size-3 text-slate-400" />
                              Email
                            </dt>
                            <dd className="mt-0.5 truncate text-[13px] text-slate-300">{drv.email || '—'}</dd>
                          </div>
                        </dl>
                        <button
                          onClick={() => setReviewDriverId(drv.id)}
                          className="mt-4 flex min-h-[40px] w-full items-center justify-center rounded-lg border border-brand-500/25 bg-brand-500/10 text-[13px] font-semibold text-brand-500"
                        >
                          Review <span className="ml-1">→</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {/* Desktop: real table */}
                <div className="hidden md:block">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-line">
                        <th className={th}><div className="flex items-center gap-1.5"><User className="size-3.5" />Driver Name</div></th>
                        <th className={th}><div className="flex items-center gap-1.5"><ClipboardList className="size-3.5" />Unique ID</div></th>
                        <th className={th}><div className="flex items-center gap-1.5"><Phone className="size-3.5" />Phone</div></th>
                        <th className={th}><div className="flex items-center gap-1.5"><Mail className="size-3.5" />Email</div></th>
                        <th className={th}><div className="flex items-center gap-1.5"><Route className="size-3.5" />Onboarding</div></th>
                        <th className={th}><div className="flex items-center gap-1.5"><ShieldCheck className="size-3.5" />Status</div></th>
                        <th className={th}><div className="flex items-center gap-1.5"><Settings className="size-3.5" />Action</div></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPendingDrivers.map((drv) => {
                        const steps = [drv.is_vehicle_added, drv.is_documents_uploaded, drv.is_bank_details_added].filter(Boolean).length;
                        return (
                          <tr key={drv.id} className="border-b border-white/[0.02]">
                            <td className={td}>
                              <div className="flex items-center gap-3">
                                <Avatar label={drv.name} />
                                <span className="text-sm font-semibold text-slate-200">{drv.name || '—'}</span>
                              </div>
                            </td>
                            <td className={`${td} font-mono text-[11px] text-slate-400`}>{driverMap.get(drv.id)}</td>
                            <td className={td}>{drv.phone || '—'}</td>
                            <td className={td}>{drv.email || '—'}</td>
                            <td className={`${td} text-xs text-slate-400`}>{steps}/3 steps</td>
                            <td className={td}>
                              <StatusPill status={driverStatus(drv)} />
                            </td>
                            <td className={td}>
                              <button
                                onClick={() => setReviewDriverId(drv.id)}
                                className="flex items-center text-[13px] font-semibold text-brand-500 transition hover:text-brand-400"
                              >
                                Review <span className="ml-1">→</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ------------------------ VERIFIED DRIVERS ------------------------ */}
        {activeTab === 'verified_drivers' && data && viewDriverId && (
          <DriverProfile driverId={viewDriverId} onBack={() => setViewDriverId(null)} />
        )}

        {activeTab === 'verified_drivers' && data && !viewDriverId && (
          <div className="rounded-xl bg-ink-800 py-5">
            <div className="mb-5 px-5">
              <h2 className="mb-1.5 text-lg font-bold text-slate-50">Verified Drivers</h2>
              <p className="text-xs text-slate-500">
                {verifiedDrivers.length} verified drivers
              </p>
            </div>

            {filteredVerifiedDrivers.length === 0 ? (
              <EmptyRow message={q ? `No verified drivers match "${searchQuery}".` : 'No verified drivers found.'} />
            ) : (
              <>
                {/* Phone/tablet: stacked cards */}
                <ul className="flex flex-col gap-3 px-4 md:hidden">
                  {filteredVerifiedDrivers.map((drv) => {
                    return (
                      <li key={drv.id} className="rounded-xl border border-line bg-ink-850 p-4">
                        <div className="mb-3 flex items-center gap-3">
                          <Avatar label={drv.name} />
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-200">
                            {drv.name || '—'}
                          </span>
                          <StatusPill status={driverStatus(drv)} />
                        </div>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                          <div className="col-span-2 min-w-0">
                            <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                              <ClipboardList className="size-3 text-slate-400" />
                              Unique ID
                            </dt>
                            <dd className="mt-0.5 truncate font-mono text-[11px] text-slate-400">{driverMap.get(drv.id)}</dd>
                          </div>
                          <Field label="Phone" icon={<Phone className="size-3" />}>{drv.phone || '—'}</Field>
                          <Field label="Rating" icon={<Star className="size-3" />}>{drv.rating != null ? Number(drv.rating).toFixed(1) : '—'}</Field>
                          <div className="col-span-2 min-w-0">
                            <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                              <Mail className="size-3 text-slate-400" />
                              Email
                            </dt>
                            <dd className="mt-0.5 truncate text-[13px] text-slate-300">{drv.email || '—'}</dd>
                          </div>
                        </dl>
                        <button
                          onClick={() => setViewDriverId(drv.id)}
                          className="mt-4 flex min-h-[40px] w-full items-center justify-center rounded-lg border border-brand-500/25 bg-brand-500/10 text-[13px] font-semibold text-brand-500"
                        >
                          View Profile <span className="ml-1">→</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {/* Desktop: real table */}
                <div className="hidden md:block">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-line">
                        <th className={th}><div className="flex items-center gap-1.5"><User className="size-3.5" />Driver Name</div></th>
                        <th className={th}><div className="flex items-center gap-1.5"><ClipboardList className="size-3.5" />Unique ID</div></th>
                        <th className={th}><div className="flex items-center gap-1.5"><Phone className="size-3.5" />Phone</div></th>
                        <th className={th}><div className="flex items-center gap-1.5"><Mail className="size-3.5" />Email</div></th>
                        <th className={th}><div className="flex items-center gap-1.5"><Star className="size-3.5" />Rating</div></th>
                        <th className={th}><div className="flex items-center gap-1.5"><ShieldCheck className="size-3.5" />Status</div></th>
                        <th className={th}><div className="flex items-center gap-1.5"><Settings className="size-3.5" />Action</div></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVerifiedDrivers.map((drv) => {
                        return (
                          <tr key={drv.id} className="border-b border-white/[0.02]">
                            <td className={td}>
                              <div className="flex items-center gap-3">
                                <Avatar label={drv.name} />
                                <span className="text-sm font-semibold text-slate-200">{drv.name || '—'}</span>
                              </div>
                            </td>
                            <td className={`${td} font-mono text-[11px] text-slate-400`}>{driverMap.get(drv.id)}</td>
                            <td className={td}>{drv.phone || '—'}</td>
                            <td className={td}>{drv.email || '—'}</td>
                            <td className={`${td} font-semibold`}>
                              {drv.rating != null ? Number(drv.rating).toFixed(1) : '—'}
                            </td>
                            <td className={td}>
                              <StatusPill status={driverStatus(drv)} />
                            </td>
                            <td className={td}>
                              <button
                                onClick={() => setViewDriverId(drv.id)}
                                className="flex items-center text-[13px] font-semibold text-brand-500 transition hover:text-brand-400"
                              >
                                View Profile <span className="ml-1">→</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* --------------------------- USER MANAGEMENT --------------------------- */}
        {activeTab === 'users' && data && viewCustomerId && (
          <CustomerDetail userId={viewCustomerId} onBack={() => setViewCustomerId(null)} />
        )}

        {activeTab === 'users' && data && viewDriverId && (
          <DriverProfile driverId={viewDriverId} onBack={() => setViewDriverId(null)} />
        )}

        {activeTab === 'users' && data && !viewCustomerId && !viewDriverId && (
          <>
            <div className="mb-6 flex gap-6 border-b border-line pb-3 pl-2 sm:gap-8">
              <button
                onClick={() => setUsersSubTab('customers')}
                className={`flex items-center pb-2 text-sm font-semibold transition ${
                  usersSubTab === 'customers' ? '-mb-[14px] border-b-2 border-brand-500 text-brand-500' : 'text-slate-500'
                }`}
              >
                <UserCheck className="mr-1.5 size-4" />
                Customers
              </button>
              <button
                onClick={() => setUsersSubTab('drivers')}
                className={`flex items-center pb-2 text-sm font-semibold transition ${
                  usersSubTab === 'drivers' ? '-mb-[14px] border-b-2 border-brand-500 text-brand-500' : 'text-slate-500'
                }`}
              >
                <Car className="mr-1.5 size-4" />
                Drivers
              </button>
            </div>

            {usersSubTab === 'customers' && data.customerSource === 'bookings' && (
              <div className="mb-4 flex items-start gap-2.5 rounded-[10px] border border-sky-400/25 bg-sky-400/[0.08] p-3.5 text-xs leading-relaxed text-sky-100">
                <Info className="mt-0.5 size-4 shrink-0 text-sky-400" />
                <span>
                  <strong>public.users</strong> is protected by an <code>auth.uid() = id</code> RLS policy, so an
                  unauthenticated client reads zero rows. This list is derived from distinct{' '}
                  <code>bookings.customer_id</code> values instead.
                </span>
              </div>
            )}

            <div className={`${cardBox} flex flex-col py-5`}>
              <div className="mb-5 px-5">
                <h2 className="mb-1.5 text-lg font-bold text-slate-50">
                  {usersSubTab === 'customers' ? 'Active Customers' : 'Active Drivers'}
                </h2>
                <p className="text-xs text-slate-500">
                  {usersSubTab === 'customers'
                    ? `${customers.length} customer${customers.length === 1 ? '' : 's'}`
                    : `${drivers.length} driver${drivers.length === 1 ? '' : 's'}`}
                </p>
              </div>

              {(usersSubTab === 'customers' ? filteredCustomers.length : filteredDrivers.length) === 0 ? (
                <EmptyRow
                  message={q ? `No ${usersSubTab} match "${searchQuery}".` : `No ${usersSubTab} found in the database.`}
                />
              ) : (
                <>
                  {/* Phone/tablet: stacked cards */}
                  <ul className="flex flex-col gap-3 px-4 md:hidden">
                    {usersSubTab === 'customers'
                      ? filteredCustomers.map((c) => (
                          <li
                            key={c.id}
                            onClick={() => setViewCustomerId(c.id)}
                            className="cursor-pointer rounded-xl border border-line bg-ink-850 p-4 transition hover:border-brand-500/40"
                          >
                            <div className="mb-3 flex items-center gap-3">
                              <Avatar label={c.name} />
                              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-200">{c.name}</span>
                              <span className="text-[11px] font-bold tracking-wide text-brand-500">{c.status}</span>
                            </div>
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                              <Field label="Phone" icon={<Phone className="size-3" />}>{c.phone}</Field>
                              <Field label="Rides" icon={<Route className="size-3" />}>{c.rides}</Field>
                              <div className="col-span-2 min-w-0">
                                <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                  <Mail className="size-3 text-slate-400" />
                                  Email
                                </dt>
                                <dd className="mt-0.5 truncate text-[13px] text-slate-300">{c.email}</dd>
                              </div>
                            </dl>
                          </li>
                        ))
                      : filteredDrivers.map((d) => (
                          <li
                            key={d.id}
                            onClick={() => setViewDriverId(d.id)}
                            className="cursor-pointer rounded-xl border border-line bg-ink-850 p-4 transition hover:border-brand-500/40"
                          >
                            <div className="mb-3 flex items-center gap-3">
                              <Avatar label={d.name} />
                              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-200">
                                {d.name || '—'}
                              </span>
                              <StatusPill status={driverStatus(d)} />
                            </div>
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                              <Field label="Phone" icon={<Phone className="size-3" />}>{d.phone || '—'}</Field>
                              <Field label="Rating" icon={<Star className="size-3" />}>{d.rating != null ? Number(d.rating).toFixed(1) : '—'}</Field>
                              <div className="col-span-2 min-w-0">
                                <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                  <Mail className="size-3 text-slate-400" />
                                  Email
                                </dt>
                                <dd className="mt-0.5 truncate text-[13px] text-slate-300">{d.email || '—'}</dd>
                              </div>
                            </dl>
                          </li>
                        ))}
                  </ul>

                  {/* Desktop: real table */}
                  <div className="hidden md:block">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-line">
                          <th className={th}><div className="flex items-center gap-1.5"><User className="size-3.5" />Name</div></th>
                          <th className={th}><div className="flex items-center gap-1.5"><Phone className="size-3.5" />Phone</div></th>
                          <th className={th}><div className="flex items-center gap-1.5"><Mail className="size-3.5" />Email</div></th>
                          <th className={th}>
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className="size-3.5" />
                              {usersSubTab === 'customers' ? 'Status' : 'Verification'}
                            </div>
                          </th>
                          <th className={th}>
                            <div className="flex items-center gap-1.5">
                              {usersSubTab === 'customers' ? <Route className="size-3.5" /> : <Star className="size-3.5" />}
                              {usersSubTab === 'customers' ? 'Rides' : 'Rating'}
                            </div>
                          </th>
                          <th className={th}><div className="flex items-center gap-1.5"><Settings className="size-3.5" />Action</div></th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersSubTab === 'customers'
                          ? filteredCustomers.map((c) => (
                              <tr key={c.id} className="border-b border-white/[0.02]">
                                <td className={td}>
                                  <div className="flex items-center gap-3">
                                    <Avatar label={c.name} />
                                    <span className="text-sm font-semibold text-slate-200">{c.name}</span>
                                  </div>
                                </td>
                                <td className={td}>{c.phone}</td>
                                <td className={td}>{c.email}</td>
                                <td className={td}>
                                  <span className="text-[11px] font-bold tracking-wide text-brand-500">{c.status}</span>
                                </td>
                                <td className={`${td} font-semibold`}>{c.rides}</td>
                                <td className={td}>
                                  <button
                                    onClick={() => setViewCustomerId(c.id)}
                                    className="flex items-center text-[13px] font-semibold text-brand-500 transition hover:text-brand-400"
                                  >
                                    View <span className="ml-1">→</span>
                                  </button>
                                </td>
                              </tr>
                            ))
                          : filteredDrivers.map((d) => (
                              <tr key={d.id} className="border-b border-white/[0.02]">
                                <td className={td}>
                                  <div className="flex items-center gap-3">
                                    <Avatar label={d.name} />
                                    <span className="text-sm font-semibold text-slate-200">{d.name || '—'}</span>
                                  </div>
                                </td>
                                <td className={td}>{d.phone || '—'}</td>
                                <td className={td}>{d.email || '—'}</td>
                                <td className={td}>
                                  <StatusPill status={driverStatus(d)} />
                                </td>
                                <td className={`${td} font-semibold`}>
                                  {d.rating != null ? Number(d.rating).toFixed(1) : '—'}
                                </td>
                                <td className={td}>
                                  <button
                                    onClick={() => setViewDriverId(d.id)}
                                    className="flex items-center text-[13px] font-semibold text-brand-500 transition hover:text-brand-400"
                                  >
                                    View <span className="ml-1">→</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* Breathing room so the fixed Exit Admin button never covers content */}
        <div className="h-16 shrink-0" />
      </main>
    </div>
  );
};
