export default function Deductions() {
  return (
    <div className="space-y-6" data-vanthai-id="itr-deductions-root">
      
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-[#1a365d] mb-1">Deductions (Chapter VI-A)</h1>
        <p className="text-sm text-gray-500">Claim deductions for your investments, medical insurance, and other eligible expenditures.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Section Title */}
        <div className="bg-[#f8fafc] border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-base font-semibold text-[#1a365d] flex items-center gap-2">
            <span className="text-[#e67e22]">🛡️</span> Section 80C Deductions
          </h2>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">Max Limit: ₹ 1,50,000</span>
        </div>

        {/* Form Grid */}
        <div className="p-6">
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-800">Life Insurance Premium (LIC), PF, PPF</label>
                <p className="text-xs text-gray-500 mt-1">Investments under 80C</p>
              </div>
              <div className="w-full sm:w-64 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input 
                  type="text" 
                  defaultValue="1,20,000"
                  className="w-full border border-gray-300 rounded-md p-2.5 pl-8 text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-800">Tuition Fees</label>
                <p className="text-xs text-gray-500 mt-1">Fees paid for children's education</p>
              </div>
              <div className="w-full sm:w-64 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input 
                  type="text" 
                  defaultValue="30,000"
                  className="w-full border border-gray-300 rounded-md p-2.5 pl-8 text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
              <div className="flex-1">
                <label className="block text-base font-bold text-[#1a365d]">Total 80C Deductions</label>
              </div>
              <div className="w-full sm:w-64">
                <div className="bg-gray-100 border border-gray-200 rounded-md p-2.5 text-right font-bold text-gray-800">
                  ₹ 1,50,000
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Section Title */}
        <div className="bg-[#f8fafc] border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1a365d] flex items-center gap-2">
            <span className="text-[#e67e22]">🏥</span> Medical & Other Deductions
          </h2>
        </div>

        {/* Form Grid */}
        <div className="p-6">
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-800">80D - Medical Insurance Premium</label>
                <p className="text-xs text-gray-500 mt-1">Health insurance for self and parents</p>
              </div>
              <div className="w-full sm:w-64 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input 
                  type="text" 
                  defaultValue="25,000"
                  className="w-full border border-gray-300 rounded-md p-2.5 pl-8 text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-800">80TTA/80TTB - Interest on Savings Account</label>
                <p className="text-xs text-gray-500 mt-1">Deduction on savings bank interest</p>
              </div>
              <div className="w-full sm:w-64 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input 
                  type="text" 
                  defaultValue="8,500"
                  className="w-full border border-gray-300 rounded-md p-2.5 pl-8 text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
              <div className="flex-1">
                <label className="block text-lg font-bold text-[#1a365d]">Total Deductions (Chapter VI-A)</label>
              </div>
              <div className="w-full sm:w-64">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-right font-bold text-blue-800 text-lg">
                  ₹ 1,83,500
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors">
          Back
        </button>
        <button className="px-6 py-2.5 bg-[#1a365d] text-white rounded-md font-medium hover:bg-[#122544] transition-colors shadow-sm">
          Save & Continue
        </button>
      </div>

    </div>
  );
}
