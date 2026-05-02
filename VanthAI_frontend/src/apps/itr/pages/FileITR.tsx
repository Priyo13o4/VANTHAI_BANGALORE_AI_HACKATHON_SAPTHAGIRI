import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function FileITR() {
  const navigate = useNavigate();
  const [assessmentYear, setAssessmentYear] = useState('');
  const [filingType, setFilingType] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [auditQuestion, setAuditQuestion] = useState('no');
  const [itrType, setItrType] = useState('');
  const [itrDropdownOpen, setItrDropdownOpen] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleContinue = () => {
    if (!assessmentYear || !filingType || !itrType) {
      setShowError(true);
      return;
    }
    
    // Pass selection state to the next page
    navigate('/itr/upload-itr', { 
      state: { 
        ay: assessmentYear, 
        filingType: filingType === '92CD' ? 'u/s 92CD' : 
                    filingType === '139-9A' ? 'u/s 139(9A)' : 
                    filingType === '139-8A' ? 'u/s 139(8A)' : filingType,
        itrType: itrType 
      } 
    });
  };

  return (
    <div className="space-y-6" data-vanthai-id="file-itr-root">
      {/* Breadcrumbs */}
      <nav className="flex text-[11px] text-[#1d4ed8] gap-1 px-1">
        <Link to="/itr" className="hover:underline">Dashboard</Link>
        <span>›</span>
        <span className="hover:underline cursor-pointer">e-file</span>
        <span>›</span>
        <span className="hover:underline cursor-pointer">Income Tax Return</span>
        <span>›</span>
        <span className="text-[#64748b]">File Income Tax Return</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 w-full space-y-6">
          <h1 className="text-[22px] font-semibold text-[#1f2937]">Income Tax Return (ITR)</h1>
          
          <div className="bg-white border border-[#e5e7eb] shadow-sm p-6 rounded-sm relative">
            <div className="absolute top-4 right-6 text-[11px] text-[#ef4444]">
              * Indicates mandatory fields
            </div>

            <div className="space-y-8 mt-4">
              {/* Assessment Year Select */}
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-[#374151]">
                  Select Assessment year <span className="text-[#ef4444]">*</span>
                </label>
                <div className="relative max-w-[340px]">
                  <select 
                    value={assessmentYear}
                    onChange={(e) => {
                      setAssessmentYear(e.target.value);
                      if (e.target.value) setShowError(false);
                    }}
                    className={`w-full h-10 px-3 bg-white border rounded-sm text-[14px] text-[#1f2937] appearance-none focus:outline-none focus:ring-1 transition-colors ${
                      showError && !assessmentYear
                      ? 'border-[#ef4444] focus:ring-[#ef4444]' 
                      : 'border-[#1d4ed8] focus:ring-[#1d4ed8]'
                    }`}
                  >
                    <option value="">Select</option>
                    <option value="2026-27">2026-27</option>
                    <option value="2025-26">2025-26</option>
                  </select>
                  <div className={`absolute inset-y-0 right-3 flex items-center pointer-events-none text-[10px] ${
                    showError && !assessmentYear ? 'text-[#ef4444]' : 'text-[#1d4ed8]'
                  }`}>
                    ▼
                  </div>
                  {showError && !assessmentYear && (
                    <div className="text-[11px] text-[#ef4444] mt-1.5 ml-1">
                      Please select Assessment Year
                    </div>
                  )}
                </div>
              </div>

              {/* Filing Type Select */}
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-[#374151]">
                  Select Filing Type <span className="text-[#ef4444]">*</span>
                </label>
                <div className="relative max-w-[340px]">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`w-full h-auto min-h-[40px] px-3 py-2 bg-white border rounded-sm text-[14px] text-left flex items-center justify-between transition-colors ${
                      showError && !filingType
                      ? 'border-[#ef4444] focus:ring-1 focus:ring-[#ef4444]' 
                      : 'border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]'
                    }`}
                  >
                    <span className={filingType ? 'text-[#1f2937]' : 'text-[#6b7280]'}>
                      {filingType ? (
                        filingType === '92CD' ? 'u/s 92CD - Modified Return' :
                        filingType === '139-9A' ? 'u/s 139(9A) - After condonation of delay u/s 119(2)(b) / Court Order or Sanction Order of Business re-organisation of the Competent authority issued prior to 01.04.2022' :
                        '139(8A) - Updated Return'
                      ) : 'Select'}
                    </span>
                    <span className={`text-[10px] shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''} ${
                      showError && !filingType ? 'text-[#ef4444]' : 'text-[#1d4ed8]'
                    }`}>
                      ▼
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#d1d5db] shadow-lg z-[100] rounded-sm py-1">
                      {[
                        { value: '92CD', label: 'u/s 92CD - Modified Return' },
                        { 
                          value: '139-9A', 
                          label: 'u/s 139(9A) - After condonation of delay u/s 119(2)(b) / Court Order or Sanction Order of Business re-organisation of the Competent authority issued prior to 01.04.2022' 
                        },
                        { value: '139-8A', label: '139(8A) - Updated Return' }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setFilingType(opt.value);
                            setDropdownOpen(false);
                            setShowError(false);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-[#eff6ff] hover:text-[#1d4ed8] text-[13px] leading-snug border-b border-gray-50 last:border-0"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {showError && !filingType && (
                    <div className="text-[11px] text-[#ef4444] mt-1.5 ml-1">
                      Please select Filing Type
                    </div>
                  )}
                </div>
              </div>

              {/* Audit Question */}
              <div className="space-y-3">
                <label className="block text-[13px] font-medium text-[#374151]">
                  Are you audited u/s 44AB or political party as per section 13A? <span className="text-[#ef4444]">*</span>
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="auditQuestion" 
                      value="yes"
                      checked={auditQuestion === 'yes'}
                      onChange={() => setAuditQuestion('yes')}
                      className="w-4 h-4 text-[#1d4ed8] focus:ring-[#1d4ed8]"
                    />
                    <span className="text-[13px] text-[#374151]">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="auditQuestion" 
                      value="no"
                      checked={auditQuestion === 'no'}
                      onChange={() => setAuditQuestion('no')}
                      className="w-4 h-4 text-[#1d4ed8] focus:ring-[#1d4ed8]"
                    />
                    <span className="text-[13px] text-[#374151]">No</span>
                  </label>
                </div>
              </div>

              {/* ITR Type Select */}
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-[#374151]">
                  Select ITR Type <span className="text-[#ef4444]">*</span>
                </label>
                <div className="relative max-w-[140px]">
                  <button
                    type="button"
                    onClick={() => setItrDropdownOpen(!itrDropdownOpen)}
                    className={`w-full h-10 px-3 bg-white border rounded-sm text-[14px] text-left flex items-center justify-between transition-colors ${
                      showError && !itrType
                      ? 'border-[#ef4444] focus:ring-1 focus:ring-[#ef4444]' 
                      : 'border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]'
                    }`}
                  >
                    <span className={itrType ? 'text-[#1f2937]' : 'text-[#6b7280]'}>
                      {itrType || 'Select'}
                    </span>
                    <span className={`text-[10px] transition-transform duration-200 ${itrDropdownOpen ? 'rotate-180' : ''} ${
                      showError && !itrType ? 'text-[#ef4444]' : 'text-[#1d4ed8]'
                    }`}>
                      ▼
                    </span>
                  </button>

                  {itrDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#d1d5db] shadow-lg z-[100] rounded-sm py-1">
                      {['ITR-1', 'ITR-2', 'ITR-3', 'ITR-4'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setItrType(type);
                            setItrDropdownOpen(false);
                            setShowError(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-[#eff6ff] hover:text-[#1d4ed8] text-[13px]"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {showError && !itrType && (
                    <div className="text-[11px] text-[#ef4444] mt-1.5 ml-1 whitespace-nowrap">
                      Please select ITR Type
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button 
              onClick={() => navigate(-1)}
              className="px-8 py-2 border border-[#1d4ed8] text-[#1d4ed8] text-[14px] font-medium rounded-sm hover:bg-[#eff6ff] transition-colors"
            >
              Back
            </button>
            <button 
              onClick={handleContinue}
              className={`px-8 py-2 text-[14px] font-medium rounded-sm transition-colors ${
                assessmentYear && filingType && itrType
                ? 'bg-[#173f8a] text-white hover:bg-[#1e40af]' 
                : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'
              }`}
            >
              Continue ›
            </button>
          </div>
        </div>

        {/* Information Sidebar */}
        <aside className="w-full lg:w-[320px] bg-[#f0f7ff] border border-[#dbeafe] p-5 rounded-sm">
          <h2 className="text-[14px] font-semibold text-[#1f2937] mb-3">Information</h2>
          <div className="space-y-4 text-[12px] text-[#374151] leading-relaxed">
            <p>
              You've been directed to the "File Income Tax Return" page right after login to make it easier to file your return.
            </p>
            <p>
              If you select offline mode, you will need to upload the ITR form prepared using offline utility in the next step
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
