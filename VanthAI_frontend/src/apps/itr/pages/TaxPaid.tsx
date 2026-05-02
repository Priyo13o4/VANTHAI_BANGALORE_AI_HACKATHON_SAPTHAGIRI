export default function TaxPaid() {
  return (
    <div className="space-y-6" data-vanthai-id="itr-tax-paid-root">
      
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#1a365d] mb-1">Taxes Paid & Verification</h1>
          <p className="text-sm text-gray-500">Review your TDS, Advance Tax, and compute your final tax liability.</p>
        </div>
        <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors hidden sm:block">
          View Form 26AS
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Section Title */}
        <div className="bg-[#f8fafc] border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1a365d] flex items-center gap-2">
            <span className="text-[#e67e22]">📊</span> Tax Computation Summary
          </h2>
        </div>

        {/* Computation Box */}
        <div className="p-6 bg-gradient-to-br from-white to-gray-50">
          <div className="max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
            
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-gray-700 font-medium">Gross Total Income</span>
              <span className="text-gray-900 font-semibold">₹ 13,00,000</span>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-gray-700 font-medium">Total Deductions</span>
              <span className="text-gray-900 font-semibold">₹ 1,83,500</span>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-[#1a365d] font-bold">Total Taxable Income</span>
              <span className="text-[#1a365d] font-bold text-lg">₹ 11,16,500</span>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-700 font-medium">Tax on Total Income</span>
              <span className="text-gray-900 font-semibold">₹ 1,47,450</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-100 text-sm">
              <span className="text-gray-500 pl-4">Add: Health & Education Cess (4%)</span>
              <span className="text-gray-600">₹ 5,898</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-[#1a365d] font-bold">Total Tax Liability</span>
              <span className="text-[#1a365d] font-bold">₹ 1,53,348</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-green-700 font-medium">Less: Taxes Paid (TDS + Advance Tax)</span>
              <span className="text-green-700 font-semibold">- ₹ 1,40,000</span>
            </div>

            <div className="flex justify-between items-center pt-4 bg-red-50 p-4 rounded-lg border border-red-100">
              <span className="text-red-800 font-bold text-lg">Tax Payable</span>
              <span className="text-red-800 font-bold text-xl">₹ 13,348</span>
            </div>

            <button className="w-full mt-4 py-3 bg-[#e67e22] text-white rounded-md font-bold hover:bg-[#d67118] transition-colors shadow-sm">
              Pay Tax Now
            </button>
            
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Section Title */}
        <div className="bg-[#f8fafc] border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1a365d] flex items-center gap-2">
            <span className="text-[#e67e22]">✅</span> Verification
          </h2>
        </div>

        {/* Verification Content */}
        <div className="p-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-sm text-blue-800">
              I, <strong>RAJESH KUMAR</strong>, son/daughter of <strong>SURESH KUMAR</strong>, solemnly declare that to the best of my knowledge and belief, the information given in the return is correct and complete and is in accordance with the provisions of the Income-tax Act, 1961.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="verify" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <label htmlFor="verify" className="text-sm text-gray-700 font-medium">
                I agree to the terms and verify the return
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Place</label>
                <input 
                  type="text" 
                  defaultValue="New Delhi"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="text" 
                  disabled
                  defaultValue={new Date().toLocaleDateString('en-GB')}
                  className="w-full border border-gray-300 rounded-md p-2 bg-gray-50 text-gray-500 cursor-not-allowed" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors">
          Back
        </button>
        <button className="px-6 py-2.5 bg-[#1a365d] text-white rounded-md font-medium hover:bg-[#122544] transition-colors shadow-sm flex items-center gap-2">
          Preview & Submit <span>→</span>
        </button>
      </div>

    </div>
  );
}
