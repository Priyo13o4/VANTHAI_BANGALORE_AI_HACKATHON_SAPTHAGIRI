import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import VanthAIChatWidget from '../../../components/chat/VanthAIChatWidget';

const navItems = [
  { label: 'Dashboard', path: '/itr' },
  { 
    label: 'e-File', 
    path: '/itr/personal', 
    dropdownItems: [
      { 
        label: 'Income Tax Returns', 
        path: '/itr/personal',
        subItems: [
          { label: 'File Income Tax Return', path: '/itr/file-return' },
          { label: 'View Filed Returns', path: '/itr/personal' },
          { label: 'e-Verify Return', path: '/itr/personal' },
          { label: 'View Form 26AS', path: '/itr/personal' },
          { label: 'Download Pre-Filled Data', path: '/itr/personal' },
          { label: 'View Annual Information Statement (AIS)', path: '/itr/personal' }
        ]
      },
      { 
        label: 'Income Tax Forms', 
        path: '/itr/personal',
        subItems: [
          { label: 'File Income Tax Forms', path: '/itr/personal' },
          { label: 'View Filed Forms', path: '/itr/personal' },
          { label: 'View Bulk Filed Forms Status (15CA/145)', path: '/itr/personal' }
        ]
      },
      { label: 'e-Pay Tax', path: '/itr/personal' },
      { label: 'Submit Tax Evasion Petition or Benami Property holding', path: '/itr/personal' }
    ]
  },
  { 
    label: 'Authorised Partners', 
    path: '/itr/salary',
    dropdownItems: [
      { label: 'My CA', path: '/itr/salary' },
      { label: 'Authorise My CA', path: '/itr/salary' }
    ]
  },
  { 
    label: 'Services', 
    path: '/itr/deductions',
    dropdownItems: [
      { label: 'e-Verify Return', path: '/itr/deductions' },
      { label: 'Know Your TAN', path: '/itr/deductions' },
      { label: 'Know Your AO', path: '/itr/deductions' }
    ]
  },
  { label: 'AIS', path: '/itr/tax-paid' },
  { 
    label: 'Pending Actions', 
    path: '/itr/deductions',
    dropdownItems: [
      { label: 'Worklist', path: '/itr/deductions' },
      { label: 'Response to Outstanding Demand', path: '/itr/deductions' }
    ]
  },
  { 
    label: 'Grievances', 
    path: '/itr/tax-paid',
    dropdownItems: [
      { label: 'Submit Grievance', path: '/itr/tax-paid' },
      { label: 'Grievance Status', path: '/itr/tax-paid' }
    ]
  },
  { label: 'Help', path: '/itr/tax-paid' },
];

export default function ITRLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [initial, setInitial] = useState('T');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email?.[0]) setInitial('T');
  }, []);

  const handleLogout = () => {
    ['authToken', 'patientId', 'userEmail', 'wearableToken'].forEach(k => localStorage.removeItem(k));
    navigate('/');
  };

  const showChatWidget = location.pathname !== '/itr';

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#1f2937] font-sans flex flex-col">
      <header className="bg-white border-b border-[#e5e7eb] sticky top-0 z-50">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
          <div className="h-[98px] flex items-center gap-4 xl:gap-6">
            <div className="flex items-center gap-4 shrink-0">
              <button type="button" onClick={() => navigate('/itr')} className="flex items-center gap-3 text-left shrink-0">
                <div className="w-[70px] h-[70px] rounded-full border border-[#cfd8e3] bg-[#f7fafc] flex items-center justify-center shadow-[0_1px_4px_rgba(15,23,42,0.12)]">
                  <div className="w-11 h-11 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center font-bold text-[11px] leading-none text-center px-1">
                    e-<br />Filing
                  </div>
                </div>
                <div className="leading-tight hidden sm:block">
                  <div className="text-[15px] font-semibold text-[#1d4ed8] whitespace-nowrap">e-Filing <span className="text-[#6b7280] font-normal">(Anywhere Anytime)</span></div>
                  <div className="text-[11px] text-[#6b7280] max-w-[220px] leading-[1.1]">Income Tax Department, Government of India</div>
                </div>
              </button>
            </div>

            <div className="hidden lg:flex flex-1" />

            <div className="hidden xl:flex items-center gap-4 text-[11px] text-[#475569] whitespace-nowrap">
              <span className="flex items-center gap-1.5">Call Us <span className="text-[10px] leading-none">▼</span></span>
              <span>English</span>
              <span className="font-semibold text-[#1d4ed8]">A</span>
              <span className="text-[#1d4ed8]">A</span>
              <span className="text-[#1d4ed8]">A+</span>
            </div>

            <div className="flex items-center gap-4 shrink-0 ml-4">
              <div className="text-right leading-tight hidden sm:block">
                <div className="font-medium text-[#111827] whitespace-nowrap">Taxpayer</div>
                <div className="text-[10px] text-[#6b7280]">Individual</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#e5e7eb] flex items-center justify-center text-sm font-semibold text-[#334155]">{initial}</div>
            </div>

            <button
              className="flex items-center gap-2 lg:hidden text-[#1f2937] hover:text-[#1d4ed8] focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
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

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#e5e7eb] bg-white px-4 py-3 space-y-1 text-sm text-[#1f3a6d]">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  'block px-3 py-2 rounded-md',
                  location.pathname === item.path ? 'bg-[#eff6ff] font-semibold' : 'hover:bg-[#f8fafc]'
                )}
              >
                {item.label}
              </Link>
            ))}
            <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="block w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50">
              Logout
            </button>
          </div>
        )}

        <div className="bg-[#173f8a] text-white hidden lg:block">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-6 h-11 flex items-center text-[13px] font-semibold">
            <div className="flex items-center gap-7 h-full">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <div key={item.label} className="relative h-full flex items-center group">
                    <Link 
                      to={item.path} 
                      className={clsx(
                        'relative h-full flex items-center pt-0.5 gap-1.5 transition-colors hover:text-white', 
                        isActive ? 'text-white' : 'text-white/80'
                      )}
                    >
                      {item.label}
                      {item.dropdownItems && (
                        <span className="text-[9px] opacity-70 mt-0.5 group-hover:rotate-180 transition-transform duration-200">▼</span>
                      )}
                      {isActive && <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-white rounded-t-sm" />}
                    </Link>
                    
                    {item.dropdownItems && (
                      <div className="absolute top-full left-0 hidden group-hover:block bg-white text-[#1f2937] shadow-xl border border-[#e5e7eb] py-2 min-w-[240px] z-[60] rounded-b-md animate-in fade-in slide-in-from-top-2 duration-200">
                        {item.dropdownItems.map((subItem, idx) => (
                          <div key={idx} className="relative group/sub">
                            <Link 
                              to={subItem.path}
                              className="flex items-center justify-between px-4 py-2.5 hover:bg-[#eff6ff] hover:text-[#1d4ed8] text-[13px] font-medium border-b border-gray-50 last:border-0 transition-colors"
                            >
                              <span>{subItem.label}</span>
                              {subItem.subItems && <span className="text-[10px] opacity-40">›</span>}
                            </Link>
                            
                            {subItem.subItems && (
                              <div className="absolute top-0 left-full hidden group-hover/sub:block bg-white text-[#1f2937] shadow-xl border border-[#e5e7eb] py-2 min-w-[260px] z-[70] rounded-md -ml-px animate-in fade-in slide-in-from-left-2 duration-200">
                                {subItem.subItems.map((thirdLevelItem, idx2) => (
                                  <Link 
                                    key={idx2}
                                    to={thirdLevelItem.path}
                                    className="block px-4 py-2.5 hover:bg-[#eff6ff] hover:text-[#1d4ed8] text-[13px] font-medium border-b border-gray-50 last:border-0 transition-colors"
                                  >
                                    {thirdLevelItem.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="ml-auto flex items-center h-full">
              <span className="text-white/90 font-normal whitespace-nowrap text-[12px]">Session Time <span className="tracking-[0.3em] font-semibold ml-1">1 4 : 5 3</span></span>
            </div>
          </div>
        </div>
      </header>

      <div id="page-blur-overlay" className="vanthai-blur-overlay" />

      <main className="flex-1 w-full max-w-[1180px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-[#e5e7eb] text-[#4b5563]">
        <div className="max-w-[1180px] mx-auto px-4 py-4 text-[11px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-[9px] font-bold">gov</div>
            <span>india.gov.in</span>
            <span className="hidden sm:inline text-[#94a3b8]">national portal of india</span>
          </div>
          <div className="flex flex-wrap gap-3 sm:justify-end">
            <span>Feedback</span>
            <span>(Website Policies)</span>
            <span>Accessibility Statement</span>
            <span>Site Map</span>
            <span>Browser Support</span>
            <span>Coll/Browser Help</span>
          </div>
          <div className="sm:text-right text-[#6b7280]">Last reviewed and updated on : 2-May-2026</div>
        </div>
      </footer>

      {showChatWidget && <VanthAIChatWidget app="itr" />}
    </div>
  );
}
