import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function FileForm18() {
  const navigate = useNavigate();
  const [taxYear, setTaxYear] = useState('');
  const [showError, setShowError] = useState(false);

  return (
    <div className="space-y-6" data-vanthai-id="file-form-18-root">
      {/* Breadcrumbs */}
      <nav className="flex text-[10px] text-[#4b5563] gap-1 px-1">
        <Link to="/itr" className="hover:text-[#1d4ed8]">Dashboard</Link>
        <span>›</span>
        <Link to="/itr/file-forms" className="hover:text-[#1d4ed8]">Income-tax Forms</Link>
        <span>›</span>
        <span>Form 18</span>
      </nav>

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-[22px] font-bold text-[#1a202c] leading-tight">
            Application for notification of affordable housing project as specified business under section 46 of the Act <span className="text-[#718096] font-normal">[Form No. 18]</span>
          </h1>
          <p className="text-[12px] text-[#4a5568]">
            Application for notification of affordable housing project as specified business under section 46 of the Act. This form is in compliance with Rule 36.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-[#e2e8f0] shadow-sm p-8 rounded-sm relative">
              <div className="absolute top-4 right-6 text-[11px] text-[#ef4444]">
                * Indicates mandatory fields
              </div>

              <div className="grid grid-cols-2 gap-y-8 mt-4">
                <div className="space-y-1">
                  <p className="text-[11px] text-[#718096]">PAN</p>
                  <p className="text-[13px] font-bold text-[#1a202c]">HVGPM1142B</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-[#718096]">Submission Mode</p>
                  <p className="text-[13px] font-bold text-[#1a202c]">Online</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-[#718096]">Filing Type</p>
                  <p className="text-[13px] font-bold text-[#1a202c]">Original</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] text-[#718096]">
                    Tax Year (T.Y) <span className="text-[#ef4444]">*</span>
                  </label>
                  <div className="relative max-w-[140px]">
                    <select 
                      value={taxYear}
                      onChange={(e) => {
                        setTaxYear(e.target.value);
                        if (e.target.value) setShowError(false);
                      }}
                      className={`w-full h-10 px-3 bg-white border rounded-sm text-[13px] text-[#1a202c] appearance-none focus:outline-none focus:ring-1 transition-colors ${
                        showError && !taxYear
                        ? 'border-[#ef4444] focus:ring-[#ef4444]' 
                        : 'border-[#d1d5db] focus:border-[#1d4ed8] focus:ring-[#1d4ed8]'
                      }`}
                    >
                      <option value="">Select T.Y.</option>
                      <option value="2027-28">2027-28</option>
                      <option value="2026-27">2026-27</option>
                    </select>
                    <div className={`absolute inset-y-0 right-3 flex items-center pointer-events-none text-[10px] ${
                      showError && !taxYear ? 'text-[#ef4444]' : 'text-[#718096]'
                    }`}>
                      ▼
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button 
                onClick={() => navigate(-1)}
                className="px-8 py-2 border border-[#1d4ed8] text-[#1d4ed8] text-[14px] font-bold rounded-sm hover:bg-[#eff6ff] transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => navigate('/itr/form-18-sections')}
                disabled={!taxYear}
                className={`px-8 py-2 text-[14px] font-bold rounded-sm transition-colors ${
                  taxYear 
                  ? 'bg-[#173f8a] text-white hover:bg-[#1e40af]' 
                  : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'
                }`}
              >
                Continue ›
              </button>
            </div>
          </div>

          {/* Information Sidebar */}
          <aside className="lg:col-span-4 bg-white border border-[#e2e8f0] p-6 rounded-sm space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center text-[11px] text-gray-500 shrink-0">i</div>
              <h2 className="text-[14px] font-bold text-[#1a202c]">Relevant Section/Schedule and Rule</h2>
            </div>
            
            <div className="space-y-6 text-[12px] leading-relaxed">
              <div className="flex gap-4">
                <span className="text-[#1d4ed8] font-bold shrink-0 min-w-[70px]">Section 46 -</span>
                <span className="text-[#4a5568]">Capital expenditure of specified business</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#1d4ed8] font-bold shrink-0 min-w-[70px]">Rule 36 -</span>
                <span className="text-[#4a5568]">
                  Guidelines for notification of an affordable housing project as a specified business under section 46(11)(d)(vii) and a semiconductor wafer fabrication manufacturing unit as a specified business under section 46(11)(d)(xiii) of the Act
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
