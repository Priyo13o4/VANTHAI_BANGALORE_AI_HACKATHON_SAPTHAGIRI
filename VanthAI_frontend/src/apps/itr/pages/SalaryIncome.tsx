export default function SalaryIncome() {
  return (
    <div className="space-y-6" data-vanthai-id="itr-salary-root">
      
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#1a365d] mb-1">Income from Salary</h1>
          <p className="text-sm text-gray-500">Provide details of your salary, allowances, and deductions as per Form 16.</p>
        </div>
        <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors hidden sm:block">
          Pre-fill from Form 16
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Section Title */}
        <div className="bg-[#f8fafc] border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-base font-semibold text-[#1a365d] flex items-center gap-2">
            <span className="text-[#e67e22]">🏢</span> Gross Salary Details
          </h2>
        </div>

        {/* Form Grid */}
        <div className="p-6">
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-800">1(a) Salary as per section 17(1)</label>
                <p className="text-xs text-gray-500 mt-1">Basic salary, DA, HRA, etc.</p>
              </div>
              <div className="w-full sm:w-64 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input 
                  type="text" 
                  defaultValue="12,50,000"
                  className="w-full border border-gray-300 rounded-md p-2.5 pl-8 text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-800">1(b) Value of perquisites as per section 17(2)</label>
                <p className="text-xs text-gray-500 mt-1">Rent-free accommodation, motor car, etc.</p>
              </div>
              <div className="w-full sm:w-64 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input 
                  type="text" 
                  defaultValue="50,000"
                  className="w-full border border-gray-300 rounded-md p-2.5 pl-8 text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-800">1(c) Profit in lieu of salary as per section 17(3)</label>
              </div>
              <div className="w-full sm:w-64 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input 
                  type="text" 
                  defaultValue="0"
                  className="w-full border border-gray-300 rounded-md p-2.5 pl-8 text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
              <div className="flex-1">
                <label className="block text-base font-bold text-[#1a365d]">Gross Salary (1a + 1b + 1c)</label>
              </div>
              <div className="w-full sm:w-64">
                <div className="bg-gray-100 border border-gray-200 rounded-md p-2.5 text-right font-bold text-gray-800">
                  ₹ 13,00,000
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
            <span className="text-[#e67e22]">➖</span> Exempt Allowances
          </h2>
        </div>

        {/* Form Grid */}
        <div className="p-6">
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-800">House Rent Allowance (HRA)</label>
                <p className="text-xs text-gray-500 mt-1">Exempt under section 10(13A)</p>
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
                <label className="block text-sm font-semibold text-gray-800">Leave Travel Allowance (LTA)</label>
                <p className="text-xs text-gray-500 mt-1">Exempt under section 10(5)</p>
              </div>
              <div className="w-full sm:w-64 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input 
                  type="text" 
                  defaultValue="0"
                  className="w-full border border-gray-300 rounded-md p-2.5 pl-8 text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
              <div className="flex-1">
                <label className="block text-base font-bold text-[#1a365d]">Net Salary</label>
                <p className="text-xs text-gray-500 mt-1">Gross Salary - Exempt Allowances</p>
              </div>
              <div className="w-full sm:w-64">
                <div className="bg-gray-100 border border-gray-200 rounded-md p-2.5 text-right font-bold text-green-700">
                  ₹ 11,80,000
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
