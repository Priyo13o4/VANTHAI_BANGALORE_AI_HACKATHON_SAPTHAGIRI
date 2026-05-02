import { Link } from 'react-router-dom';

export default function ITROverview() {
  return (
    <div className="space-y-6" data-vanthai-id="itr-overview-root">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-blue-50 to-transparent pointer-events-none" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1a365d] mb-2">Welcome, TAXPAYER</h1>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-700">PAN:</span> XXXXX1234X
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-700">Aadhaar:</span> 
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Linked
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Link
                to="/itr/personal"
                className="flex-1 sm:flex-none text-center px-6 py-2.5 bg-[#1a365d] text-white rounded-lg font-medium hover:bg-[#122544] transition-colors shadow-sm"
              >
                File Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (Main Content) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { title: 'e-File', icon: '📄', color: 'bg-blue-50 text-blue-600', path: '/itr/personal' },
              { title: 'View Returns', icon: '🔍', color: 'bg-indigo-50 text-indigo-600', path: '/itr' },
              { title: 'e-Pay Tax', icon: '💳', color: 'bg-green-50 text-green-600', path: '/itr/tax-paid' },
              { title: 'Services', icon: '⚙️', color: 'bg-orange-50 text-orange-600', path: '/itr' },
            ].map((action, i) => (
              <Link
                key={i}
                to={action.path}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col items-center justify-center gap-3 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 text-center">{action.title}</span>
              </Link>
            ))}
          </div>

          {/* Filing Status Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-[#1a365d] mb-6 flex items-center gap-2">
              <span className="text-[#e67e22]">📅</span> Assessment Year 2024-25
            </h2>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-gray-200" />
              
              <div className="space-y-8 relative">
                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-full bg-green-100 border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0 z-10 text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  <div className="pt-2">
                    <div className="font-semibold text-gray-900">Return Filed</div>
                    <div className="text-sm text-gray-500">Successfully filed on 15 Jul 2024</div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-full bg-green-100 border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0 z-10 text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  <div className="pt-2">
                    <div className="font-semibold text-gray-900">Return Verified</div>
                    <div className="text-sm text-gray-500">e-Verified successfully on 15 Jul 2024</div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0 z-10 text-blue-600 animate-pulse">
                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                  </div>
                  <div className="pt-2">
                    <div className="font-semibold text-[#1a365d]">Processing</div>
                    <div className="text-sm text-gray-500">Your return is under processing</div>
                    <button className="mt-2 text-xs font-medium text-blue-600 hover:underline">View Details</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Side Widgets) */}
        <div className="space-y-6">
          {/* Pending Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-base font-bold text-[#1a365d] mb-4 flex items-center justify-between">
              Pending Actions
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-md font-medium">1 Item</span>
            </h2>
            <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
              <div className="text-sm font-semibold text-orange-800 mb-1">Advance Tax Due</div>
              <div className="text-xs text-orange-700 mb-3">Please pay your 2nd installment of Advance Tax before 15 Sep.</div>
              <button className="text-xs font-medium bg-orange-100 text-orange-800 px-3 py-1.5 rounded hover:bg-orange-200 transition-colors w-full">
                Pay Now
              </button>
            </div>
          </div>

          {/* Recent Updates */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-base font-bold text-[#1a365d] mb-4">Recent Updates</h2>
            <div className="space-y-4">
              {[
                { date: '10 Aug 2024', text: 'Important: CBDT extends due date for filing Form 10B/10BB.' },
                { date: '01 Aug 2024', text: 'New e-Pay Tax functionality is now live for all users.' },
                { date: '15 Jul 2024', text: 'AIS (Annual Information Statement) has been updated for AY 2024-25.' },
              ].map((update, i) => (
                <div key={i} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="text-xs text-gray-400 mb-1">{update.date}</div>
                  <div className="text-sm text-gray-700 leading-snug">{update.text}</div>
                </div>
              ))}
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-4 w-full text-center">
              View All Updates
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
