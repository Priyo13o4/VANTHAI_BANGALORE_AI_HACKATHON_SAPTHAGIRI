export default function PersonalInfo() {
  return (
    <div className="space-y-6" data-vanthai-id="itr-personal-root">
      
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-[#1a365d] mb-1">Personal Information</h1>
        <p className="text-sm text-gray-500">Please verify your personal details before proceeding with your return filing.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Section Title */}
        <div className="bg-[#f8fafc] border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1a365d] flex items-center gap-2">
            <span className="text-[#e67e22]">👤</span> Profile Details
          </h2>
        </div>

        {/* Form Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* PAN Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN</label>
              <input 
                data-vanthai-id="itr-personal-pan" 
                name="pan" 
                defaultValue="XXXXX1234X"
                disabled
                className="w-full border border-gray-300 rounded-md p-2.5 bg-gray-50 text-gray-500 cursor-not-allowed" 
              />
            </div>

            {/* Aadhaar Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
              <div className="relative">
                <input 
                  defaultValue="XXXX XXXX 1234"
                  disabled
                  className="w-full border border-gray-300 rounded-md p-2.5 bg-gray-50 text-gray-500 cursor-not-allowed" 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  Linked
                </span>
              </div>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input 
                data-vanthai-id="itr-personal-fname" 
                name="first_name" 
                defaultValue="RAJESH"
                className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input 
                data-vanthai-id="itr-personal-lname" 
                name="last_name" 
                defaultValue="KUMAR"
                className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input 
                data-vanthai-id="itr-personal-dob" 
                name="dob" 
                type="date" 
                defaultValue="1980-05-15"
                className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Section Title */}
        <div className="bg-[#f8fafc] border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1a365d] flex items-center gap-2">
            <span className="text-[#e67e22]">📞</span> Contact Details
          </h2>
        </div>

        {/* Form Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +91
                </span>
                <input 
                  type="tel"
                  defaultValue="9876543210"
                  className="flex-1 min-w-0 block w-full px-3 py-2.5 rounded-none rounded-r-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
                />
              </div>
            </div>

            {/* Email ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
              <input 
                type="email"
                defaultValue="rajesh.kumar@example.com"
                className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Communication Address</label>
              <textarea 
                rows={3}
                defaultValue="Flat 402, Block B, Green Valley Apartments, Sector 45, New Delhi - 110045"
                className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
              />
            </div>
            
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors">
          Reset
        </button>
        <button className="px-6 py-2.5 bg-[#1a365d] text-white rounded-md font-medium hover:bg-[#122544] transition-colors shadow-sm">
          Save & Continue
        </button>
      </div>

    </div>
  );
}
