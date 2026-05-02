import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import VanthAIChatWidget from '../../../components/chat/VanthAIChatWidget';

const navItems = [
  { label: 'Dashboard', path: '/itr' },
  { label: 'e-File', path: '/itr/personal' },
  { label: 'Services', path: '/itr/salary' },
  { label: 'Pending Actions', path: '/itr/deductions' },
  { label: 'Help', path: '/itr/tax-paid' },
];

export default function ITRLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [initial, setInitial] = useState('P');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email?.[0]) setInitial(email[0].toUpperCase());
  }, []);

  const handleLogout = () => {
    ['authToken', 'patientId', 'userEmail', 'wearableToken'].forEach(k => localStorage.removeItem(k));
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
      {/* ── Top Bar (Gov Branding Style) ─────────────────────────────────── */}
      <div className="bg-[#1a365d] text-white px-4 py-1.5 text-xs flex justify-between items-center hidden sm:flex">
        <div className="flex gap-4">
          <span>Government of Bharat</span>
          <span>Department of Revenue</span>
        </div>
        <div className="flex gap-4 items-center">
          <span>A-</span>
          <span>A</span>
          <span>A+</span>
          <span>Language: English</span>
        </div>
      </div>

      {/* ── Main Header ─────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/itr')}>
              <div className="w-10 h-10 bg-[#e6f0fa] rounded-full flex items-center justify-center text-xl shadow-inner border border-[#cce0f5]">
                🏛️
              </div>
              <div className="hidden sm:block">
                <div className="text-[#1a365d] font-bold text-xl leading-none">Tax e-Portal</div>
                <div className="text-[#e67e22] text-xs font-semibold tracking-wide">Filing Anywhere Anytime</div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={clsx(
                      'px-4 py-2 rounded-md text-sm font-medium transition-colors relative group',
                      isActive ? 'text-[#1a365d]' : 'text-gray-600 hover:text-[#1a365d]'
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-1 bg-[#e67e22] rounded-t-md" />
                    )}
                    <span className="absolute bottom-0 left-0 w-0 h-1 bg-[#1a365d] rounded-t-md transition-all duration-300 group-hover:w-full opacity-50" />
                  </Link>
                );
              })}
            </nav>

            {/* User Profile & Mobile Toggle */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-800">Welcome</div>
                  <div className="text-xs text-gray-500">TAXPAYER</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#1a365d] text-white flex items-center justify-center font-bold text-sm shadow-md cursor-pointer border-2 border-white ring-2 ring-gray-100 relative group">
                  {initial}
                  <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-md shadow-lg w-48 py-1 hidden group-hover:block z-50">
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                      <span className="text-red-500">🚪</span> Logout
                    </button>
                  </div>
                </div>
              </div>
              <button
                className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-2 pt-2 pb-3 space-y-1 shadow-inner">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  'block px-3 py-2 rounded-md text-base font-medium',
                  location.pathname === item.path
                    ? 'bg-[#f0f4f8] text-[#1a365d] border-l-4 border-[#e67e22]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-gray-200 mt-2 pt-2">
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Page Content ─────────────────────────────────────────────────── */}
      <div id="page-blur-overlay" className="vanthai-blur-overlay" />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#1a365d] text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4 text-[#e67e22]">About Portal</h3>
              <p className="text-sm text-gray-300">
                This is a secure tax filing portal designed for ease of use.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4 text-[#e67e22]">Help & Support</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white underline">Contact Us</a></li>
                <li><a href="#" className="hover:text-white underline">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4 text-[#e67e22]">Important Links</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white underline">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-white underline">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#2a4365] mt-6 pt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Tax e-Portal. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ── VanthAI Chat Widget (specific for ITR) ────────────────────── */}
      <VanthAIChatWidget app="itr" />
    </div>
  );
}
