import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function BusinessDetails() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('form18_business_details');
    return saved ? JSON.parse(saved) : {
      businessName: '',
      country: 'India',
      flat: '',
      road: '',
      pin: '',
      postOffice: '',
      area: '',
      district: '',
      state: '',
      projectName: '',
      projCountry: 'India',
      projFlat: '',
      projRoad: '',
      projPin: ''
    };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    localStorage.setItem('form18_business_details', JSON.stringify(formData));
    navigate(-1);
  };

  const isFormValid = formData.businessName && formData.flat && formData.pin;

  return (
    <div className="space-y-6" data-vanthai-id="business-details-root">
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
          <h1 className="text-[22px] font-bold text-[#1a202c]">Particulars of the specified business</h1>
          <p className="text-[12px] text-[#4a5568]">Includes Name, Address of the specified business</p>
        </div>

        <div className="bg-white border border-[#e2e8f0] shadow-sm p-8 rounded-sm relative max-w-[1000px] mx-auto">
          <div className="absolute top-4 right-6 text-[11px] text-[#ef4444]">
            * Indicates mandatory fields
          </div>

          <div className="space-y-10 mt-4">
            {/* 8. Name */}
            <div className="space-y-2 max-w-[400px]">
              <label className="block text-[11px] text-[#718096]">8. Name *</label>
              <input 
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-white border border-[#d1d5db] rounded-sm text-[13px] text-[#1a202c] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]"
              />
            </div>

            {/* 9. Address */}
            <div className="space-y-6">
              <h3 className="text-[11px] font-bold text-[#718096]">9. Address *</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2 max-w-[400px]">
                  <label className="block text-[11px] text-[#718096]">Country/Region *</label>
                  <select 
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full h-10 px-3 bg-[#f3f4f6] border border-[#d1d5db] rounded-sm text-[13px] text-[#1a202c] cursor-not-allowed"
                    disabled
                  >
                    <option value="India">India</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:col-span-2">
                  <div className="space-y-2 max-w-[400px]">
                    <label className="block text-[11px] text-[#718096]">Flat / Door / Building *</label>
                    <input 
                      type="text"
                      name="flat"
                      value={formData.flat}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-[#d1d5db] rounded-sm text-[13px]"
                    />
                  </div>
                  <div className="space-y-2 max-w-[400px]">
                    <label className="block text-[11px] text-[#718096]">Road / Street / Block / Sector</label>
                    <input 
                      type="text"
                      name="road"
                      value={formData.road}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-[#d1d5db] rounded-sm text-[13px]"
                    />
                  </div>
                </div>

                <div className="space-y-2 max-w-[200px]">
                  <label className="block text-[11px] text-[#718096]">PIN Code *</label>
                  <input 
                    type="text"
                    name="pin"
                    value={formData.pin}
                    onChange={handleChange}
                    className="w-full h-10 px-3 border border-[#d1d5db] rounded-sm text-[13px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 lg:col-span-2">
                  <div className="space-y-2 max-w-[400px]">
                    <label className="block text-[11px] text-[#718096]">Post Office *</label>
                    <select 
                      name="postOffice" 
                      value={formData.postOffice}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-[#d1d5db] rounded-sm text-[13px]"
                    >
                      <option value="">Select</option>
                      <option value="Yelahanka S.O">Yelahanka S.O</option>
                      <option value="Whitefield S.O">Whitefield S.O</option>
                      <option value="Indiranagar S.O">Indiranagar S.O</option>
                    </select>
                  </div>
                  <div className="space-y-2 max-w-[400px]">
                    <label className="block text-[11px] text-[#718096]">Area / Locality *</label>
                    <select 
                      name="area" 
                      value={formData.area}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-[#d1d5db] rounded-sm text-[13px]"
                    >
                      <option value="">Select</option>
                      <option value="Yelahanka">Yelahanka</option>
                      <option value="Whitefield">Whitefield</option>
                      <option value="Indiranagar">Indiranagar</option>
                      <option value="Electronic City">Electronic City</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:col-span-2">
                  <div className="space-y-2 max-w-[400px]">
                    <label className="block text-[11px] text-[#718096]">District *</label>
                    <select 
                      name="district" 
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-[#d1d5db] rounded-sm text-[13px]"
                    >
                      <option value="">Select</option>
                      <option value="Bengaluru Urban">Bengaluru Urban</option>
                      <option value="Bengaluru Rural">Bengaluru Rural</option>
                      <option value="Mysuru">Mysuru</option>
                    </select>
                  </div>
                  <div className="space-y-2 max-w-[400px]">
                    <label className="block text-[11px] text-[#718096]">State *</label>
                    <select 
                      name="state" 
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-[#d1d5db] rounded-sm text-[13px]"
                    >
                      <option value="">Select</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Delhi">Delhi</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 10(a). Project Name */}
            <div className="space-y-2 max-w-[400px]">
              <label className="block text-[11px] text-[#718096]">10(a) Name of the project (if any)</label>
              <input 
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-[#d1d5db] rounded-sm text-[13px]"
              />
            </div>

            {/* 10(b). Project Address */}
            <div className="space-y-6">
              <h3 className="text-[11px] font-bold text-[#718096]">10(b) Complete address of project</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2 max-w-[400px]">
                  <label className="block text-[11px] text-[#718096]">Country/Region *</label>
                  <select disabled className="w-full h-10 px-3 bg-[#f3f4f6] border border-[#d1d5db] rounded-sm text-[13px]"><option>India</option></select>
                </div>
                <div className="grid grid-cols-2 gap-4 lg:col-span-2">
                  <div className="space-y-2 max-w-[400px]">
                    <label className="block text-[11px] text-[#718096]">Flat / Door / Building *</label>
                    <input type="text" className="w-full h-10 px-3 border border-[#d1d5db] rounded-sm text-[13px]" />
                  </div>
                  <div className="space-y-2 max-w-[400px]">
                    <label className="block text-[11px] text-[#718096]">Read / Street / Block / Sector</label>
                    <input type="text" className="w-full h-10 px-3 border border-[#d1d5db] rounded-sm text-[13px]" />
                  </div>
                </div>
                <div className="space-y-2 max-w-[200px]">
                  <label className="block text-[11px] text-[#718096]">PIN Code *</label>
                  <input type="text" className="w-full h-10 px-3 border border-[#d1d5db] rounded-sm text-[13px]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 max-w-[1000px] mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="px-8 py-2 border border-[#1d4ed8] text-[#1d4ed8] text-[14px] font-bold rounded-sm hover:bg-[#eff6ff] transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!isFormValid}
            className={`px-10 py-2 text-[14px] font-bold rounded-sm transition-colors ${
              isFormValid 
              ? 'bg-[#173f8a] text-white hover:bg-[#1e40af]' 
              : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
