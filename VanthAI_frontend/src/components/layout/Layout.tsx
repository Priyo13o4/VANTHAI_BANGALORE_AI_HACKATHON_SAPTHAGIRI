/**
 * Layout.tsx
 * Replaces Next.js DashboardLayout.tsx.
 * Uses react-router-dom useNavigate + useLocation instead of next/navigation.
 * All data-chatbot-id → data-vanthai-id.
 */
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import VanthAIChatWidget from '../chat/VanthAIChatWidget';
import SpotlightOverlay from '../guidance/SpotlightOverlay';

const DRAWER_WIDTH = 260;
const _ = DRAWER_WIDTH; // suppress unused warning — kept for reference

type NavSection = 'cloudcare' | 'itr';

const cloudcareNav = [
  { label: 'Dashboard',         path: '/cloudcare',                       icon: '🏥' },
  { label: 'Vitals & Sensors',  path: '/cloudcare/patient/vitals',        icon: '📊' },
  { label: 'Appointments',      path: '/cloudcare/patient/appointments',   icon: '📅' },
  { label: 'Prescriptions',     path: '/cloudcare/patient/prescriptions',  icon: '💊' },
  { label: 'Medical Records',   path: '/cloudcare/patient/records',        icon: '📋' },
];

const itrNav = [
  { label: 'Overview',         path: '/itr',               icon: '📁' },
  { label: 'Personal Info',    path: '/itr/personal',      icon: '👤' },
  { label: 'Salary Income',    path: '/itr/salary',        icon: '💰' },
  { label: 'Deductions',       path: '/itr/deductions',    icon: '🧾' },
  { label: 'Tax Paid',         path: '/itr/tax-paid',      icon: '✅' },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Detect which app section we are in
  const section: NavSection = location.pathname.startsWith('/itr') ? 'itr' : 'cloudcare';
  const navItems = section === 'itr' ? itrNav : cloudcareNav;

  // Store userEmail initial in state (no SSR quirks)
  const [initial, setInitial] = useState('P');
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email?.[0]) setInitial(email[0].toUpperCase());
  }, []);

  const handleLogout = () => {
    ['authToken', 'patientId', 'userEmail', 'wearableToken'].forEach(k => localStorage.removeItem(k));
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <span className="text-3xl">🤖</span>
          <div>
            <div className="font-bold text-gray-900 text-lg leading-tight">VanthAI</div>
            <div className="text-xs text-gray-400 capitalize">{section === 'cloudcare' ? 'CloudCare' : 'ITR Portal'}</div>
          </div>
        </div>

        {/* App switcher */}
        <div className="flex gap-1 mx-4 mt-4 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => navigate('/cloudcare')}
            className={clsx(
              'flex-1 py-2 rounded-lg text-xs font-semibold transition-colors',
              section === 'cloudcare' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            🏥 CloudCare
          </button>
          <button
            onClick={() => navigate('/itr')}
            className={clsx(
              'flex-1 py-2 rounded-lg text-xs font-semibold transition-colors',
              section === 'itr' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            📁 ITR
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                location.pathname === item.path
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Main Area ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 h-14 flex items-center px-4 gap-4">
          <button className="md:hidden text-gray-600" onClick={() => setMobileOpen(p => !p)}>☰</button>
          <div className="flex-1 font-semibold text-gray-800 text-sm">
            {navItems.find(n => n.path === location.pathname)?.label ?? 'VanthAI'}
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm cursor-pointer" onClick={handleLogout} title="Logout">
            {initial}
          </div>
        </header>

        {/* Page blur overlay (used by Driver.js) */}
        <div id="page-blur-overlay" className="vanthai-blur-overlay" />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* VanthAI Spotlight Guidance Overlay */}
      <SpotlightOverlay />

      {/* ── VanthAI Chat Widget (shared between both apps) ────────────────── */}
      <VanthAIChatWidget app={section} />
    </div>
  );
}
