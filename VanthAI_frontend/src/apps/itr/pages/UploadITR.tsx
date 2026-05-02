import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function UploadITR() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ay = '2025-26', filingType = 'u/s 139(9A)' } = location.state || {};
  const [file, setFile] = useState<File | null>(null);

  // Helper to format filing type for title
  const formattedFilingType = filingType.includes('139(9A)') ? 'u/s 139(9A)' : 
                              filingType.includes('92CD') ? 'u/s 92CD' : 
                              filingType.includes('139(8A)') ? 'u/s 139(8A)' : filingType;

  return (
    <div className="space-y-6" data-vanthai-id="upload-itr-root">
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

      <div className="space-y-6">
        <h1 className="text-[22px] font-semibold text-[#1f2937]">
          File Income Tax Return {formattedFilingType} for A.Y. {ay}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Upload Card */}
          <div className="bg-white border border-[#e5e7eb] shadow-sm p-8 rounded-sm flex flex-col justify-center min-h-[260px]">
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-[15px] font-semibold text-[#1f2937]">Upload</h2>
                <p className="text-[12px] text-[#6b7280]">Upload your filled ITR from Here</p>
              </div>

              <div className="space-y-4">
                <div className="relative inline-block">
                  <input 
                    type="file" 
                    id="itr-upload" 
                    className="hidden" 
                    accept=".json"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <label 
                    htmlFor="itr-upload"
                    className="flex items-center gap-2 px-4 py-2 border border-[#1d4ed8] text-[#1d4ed8] text-[13px] font-medium rounded-sm hover:bg-[#eff6ff] cursor-pointer transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    Attach File
                  </label>
                </div>
                
                <p className="text-[12px] text-[#6b7280]">
                  Only .json files are allowed
                </p>

                {file && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-sm flex items-center justify-between">
                    <span className="text-[12px] text-green-700 font-medium truncate">{file.name}</span>
                    <button onClick={() => setFile(null)} className="text-green-700 hover:text-green-900">✕</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Information Sidebar */}
          <aside className="bg-[#f0f7ff] border border-[#dbeafe] p-8 rounded-sm flex flex-col justify-center">
            <h2 className="text-[14px] font-semibold text-[#1f2937] mb-4">Information</h2>
            <ul className="space-y-4 text-[12px] text-[#374151] leading-relaxed list-disc ml-4">
              <li>
                Upload your filled ITR form prepared using the offline utility.
              </li>
              <li>
                If you want to download offline utility for filing Income-tax Returns. Please <span className="text-[#1d4ed8] hover:underline cursor-pointer">click here</span> and you will be redirected to download page.
              </li>
              <li>
                If you have not downloaded your pre-filled data, please <span className="text-[#1d4ed8] hover:underline cursor-pointer">click here</span> to be redirected to Download pre-filled data page.
              </li>
            </ul>
          </aside>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between pt-4">
          <button 
            onClick={() => navigate(-1)}
            className="px-8 py-2 border border-[#1d4ed8] text-[#1d4ed8] text-[14px] font-medium rounded-sm hover:bg-[#eff6ff] transition-colors"
          >
            Back
          </button>
          <button 
            disabled={!file}
            className={`px-8 py-2 text-[14px] font-medium rounded-sm transition-colors ${
              file 
              ? 'bg-[#173f8a] text-white hover:bg-[#1e40af]' 
              : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'
            }`}
          >
            Proceed To Verification ›
          </button>
        </div>
      </div>
    </div>
  );
}
