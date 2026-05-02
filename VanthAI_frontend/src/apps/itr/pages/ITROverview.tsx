import { Link } from 'react-router-dom';

export default function ITROverview() {
  return (
    <div className="space-y-4" data-vanthai-id="itr-overview-root">
      <div className="text-[12px] text-[#64748b] pl-1">Dashboard</div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-5 items-start">
        <div className="space-y-5">
          <section className="bg-white border border-[#e5e7eb] shadow-sm p-5 min-h-[255px]">
            <h1 className="text-[19px] font-semibold text-[#1f2937] mb-4">Welcome Back, Taxpayer</h1>
            <div className="space-y-2 text-[12px] text-[#111827] leading-5">
              <div className="font-semibold">HVGPM1142B</div>
              <div>XXXXXXXXX6964</div>
              <div>+91 9592550219</div>
              <div>taxpayer1304@gmail.com</div>
            </div>

            <div className="mt-4 space-y-2 text-[12px] text-[#111827]">
              <div className="flex items-center justify-between gap-3">
                <span>Contact Details</span>
                <a href="#" className="text-[#1d4ed8] font-medium">Update</a>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Bank Account</span>
                <a href="#" className="text-[#1d4ed8] font-medium">Update</a>
              </div>
            </div>

            <div className="mt-4 flex items-start justify-between gap-4 text-[12px]">
              <div className="max-w-[180px] text-[#374151] leading-4">Your account is not secure with e-vault</div>
              <a href="#" className="text-[#1d4ed8] font-medium whitespace-nowrap">Secure Account</a>
            </div>
          </section>

          <section className="bg-white border border-[#e5e7eb] shadow-sm px-4 py-3 flex items-center justify-between min-h-[46px]">
            <span className="text-[13px] font-medium text-[#1f2937]">Income &amp; Tax Estimator</span>
            <span className="text-[#94a3b8]">▦</span>
          </section>

          <section className="bg-white border border-[#e5e7eb] shadow-sm px-4 py-3 flex items-center justify-between min-h-[46px]">
            <span className="text-[13px] font-medium text-[#1f2937]">Tax Calendar</span>
            <span className="text-[#94a3b8]">▦</span>
          </section>

          <section className="bg-white border border-[#e5e7eb] shadow-sm px-4 py-3 min-h-[106px]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-medium text-[#1f2937]">Activity Log</span>
              <a href="#" className="text-[12px] text-[#1d4ed8] font-medium">View All</a>
            </div>
            <div className="space-y-3 text-[12px] text-[#111827]">
              <div className="flex justify-between gap-4">
                <span>Last log in</span>
                <span className="text-[#374151]">02-May-2026, 03:02 PM</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Last log out</span>
                <span className="text-[#374151]">19-Jul-2025, 06:00 PM</span>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="bg-white border border-[#e5e7eb] shadow-sm p-5 min-h-[124px]">
            <div className="text-[18px] leading-7 font-medium text-[#1f2937] max-w-[460px]">File your return for the year ended on 31-Mar-2026</div>
            <div className="mt-3 text-[13px] text-[#374151]">For Assessment Year 2026-27</div>
            <div className="mt-4 text-[13px] text-[#374151]">e-Filing for the same will be enabled soon!</div>
          </section>

          {[
            'Tax Deposit',
            'Recent Filed Returns',
            'Recent Forms Filed',
          ].map((title) => (
            <section key={title} className="bg-white border border-[#e5e7eb] shadow-sm px-5 py-4 min-h-[60px] flex items-center">
              <div className="flex items-center gap-3 text-[14px] font-semibold text-[#1f2937]">
                <span className="text-[#64748b] text-[16px]">›</span>
                {title}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
