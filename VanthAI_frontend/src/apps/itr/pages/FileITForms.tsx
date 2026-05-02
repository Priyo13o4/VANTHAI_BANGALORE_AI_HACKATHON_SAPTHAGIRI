import { Link } from 'react-router-dom';

export default function FileITForms() {
  return (
    <div className="space-y-6" data-vanthai-id="file-it-forms-root">
      {/* Breadcrumbs */}
      <nav className="flex text-[10px] text-[#4b5563] gap-1 px-1">
        <Link to="/itr" className="hover:text-[#1d4ed8]">Dashboard</Link>
        <span>›</span>
        <span>Income-tax Forms</span>
      </nav>

      <div className="space-y-8">
        <h1 className="text-[24px] font-bold text-[#1a202c]">File Income Tax Forms</h1>

        {/* Help Box */}
        <div className="bg-[#f0f7ff] border border-[#e2e8f0] p-5 rounded-md">
          <h2 className="text-[13px] text-[#4a5568] mb-3">Need Help?</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#1d4ed8] rounded-full" />
            <span className="text-[13px] text-[#1d4ed8] font-bold hover:underline cursor-pointer">
              Navigator of Forms as per Income Tax Act 2025/1961
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-end items-center gap-4">
          <button className="text-gray-400 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <div className="flex border border-[#e2e8f0] rounded-sm overflow-hidden">
            <button className="p-1.5 bg-[#1d4ed8] text-white">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
              </svg>
            </button>
            <button className="p-1.5 bg-white text-gray-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* In-Progress Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-[#1a202c] flex items-center gap-2">
              In-Progress Forms <span className="bg-[#ef4444] text-white text-[10px] px-1.5 py-0.5 rounded-[3px] font-bold">1</span>
            </h3>
            <button className="text-[12px] text-[#1d4ed8] hover:underline font-bold">Show All</button>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-[4px] overflow-hidden">
            <div className="flex border-b border-[#edf2f7]">
              <button className="px-8 py-3 text-[12px] font-bold text-[#1d4ed8] border-b-2 border-[#1d4ed8]">
                Forms as per Income Tax Act 2025
              </button>
              <button className="px-8 py-3 text-[12px] font-bold text-[#718096] hover:text-[#4a5568]">
                Forms as per Income Tax Act 1961
              </button>
              <button className="px-8 py-3 text-[12px] font-bold text-[#718096] hover:text-[#4a5568]">
                Forms as per other Acts
              </button>
            </div>
            
            <div className="p-6 bg-white">
              <div className="border border-[#e2e8f0] p-6 rounded-[4px] flex items-start justify-between">
                <div className="space-y-2">
                  <h4 className="text-[14px] font-bold text-[#1a202c]">
                    Computation of Total Income <span className="text-[#a0aec0] font-normal">(Form 18)</span>
                  </h4>
                  <div className="text-[11px] text-[#718096] space-y-1">
                    <p>T.Y. 2027-28</p>
                    <p>PAN: HVGPM1142B</p>
                    <p>Last Modified: 13:19:19 - 02 May 2026</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 text-[12px] font-bold">
                  <button className="text-[#1d4ed8] hover:underline">Delete Draft</button>
                  <button className="text-[#1d4ed8] hover:underline">Resume</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Available Forms Section */}
        <section className="bg-white border border-[#e2e8f0] rounded-[4px] overflow-hidden mt-10">
          <div className="flex border-b border-[#edf2f7] bg-white">
            <button className="px-8 py-3 text-[12px] font-bold text-[#1d4ed8] border-b-2 border-[#1d4ed8]">
              Forms as per Income Tax Act 2025
            </button>
            <button className="px-8 py-3 text-[12px] font-bold text-[#718096] hover:text-[#4a5568]">
              Forms as per Income Tax Act 1961
            </button>
            <button className="px-8 py-3 text-[12px] font-bold text-[#718096] hover:text-[#4a5568]">
              Forms as per other Acts
            </button>
          </div>

          <div className="divide-y divide-[#edf2f7]">
            {[
              { id: '19', title: 'Profits and gains of business or profession', desc: 'Application for notification of a semiconductor wafer fabrication manufacturing unit as specified business under section 46 of the Act' },
              { id: '146', title: 'Deduction and collection at source', desc: 'Certificate of an accountant' },
              { id: '18', title: 'Computation of Total Income', desc: 'Application for notification of affordable housing project as specified business under section 46 of the Act' },
              { id: '187', title: 'Recognised Provident Funds, Approved Superannuation Funds and Gratuity Funds', desc: 'Appeal against refusal to recognize or withdrawal of recognition from a provident fund/ refusal to approve or withdrawal of approval from a superannuation fund or from a gratuity fund' },
              { id: '20', title: 'Rebates And Reliefs', desc: 'Application for approval of agricultural extension project under section 47(1)(a) of the act' },
              { id: '41', title: 'Double Taxation Relief', desc: 'Information to be provided under section 159(8)' },
              { id: '42', title: 'Rebates And Reliefs', desc: 'Application for Certificate of residence for the purposes of an agreement under section 159(1) and 159(2)' },
              { id: '50', title: 'Special provisions relating to avoidance of tax', desc: 'Application for a pre-filing consultation' },
              { id: '51', title: 'Special provisions relating to avoidance of tax', desc: 'Application for an Advance Pricing Agreement' },
              { id: '54', title: 'Special provisions relating to avoidance of tax', desc: 'Application for Renewal of an Advance Pricing Agreement (APA)' }
            ].map((form) => (
              <div key={form.id} className="p-6 flex items-start justify-between hover:bg-[#f7fafc] transition-colors">
                <div className="space-y-1.5 pr-12">
                  <h4 className="text-[14px] font-bold text-[#1a202c]">
                    {form.title} <span className="text-[#a0aec0] font-normal ml-0.5">(Form {form.id})</span>
                  </h4>
                  <p className="text-[12px] text-[#718096] leading-relaxed">
                    {form.desc}
                  </p>
                </div>
                <button className="text-[12px] font-bold text-[#1d4ed8] hover:underline shrink-0 pt-0.5">
                  File Now
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
