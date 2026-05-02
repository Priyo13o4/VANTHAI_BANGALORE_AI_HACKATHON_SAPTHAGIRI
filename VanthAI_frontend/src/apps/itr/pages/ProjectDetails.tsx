import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function ProjectDetails() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('form18_project_details');
    return saved ? JSON.parse(saved) : {
      country: 'India',
      flat: '',
      road: '',
      pin: '',
      postOffice: '',
      area: '',
      district: '',
      state: '',
      totalUnits: '',
      rentableArea: 0,
      earmarkedArea: 0
    };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    localStorage.setItem('form18_project_details', JSON.stringify(formData));
    navigate(-1);
  };

  const isFormValid = formData.flat && formData.pin && formData.totalUnits;

  return (
    <div className="space-y-6" data-vanthai-id="project-details-root">
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
          <h1 className="text-[22px] font-bold text-[#1a202c]">Details of proposed project</h1>
          <p className="text-[12px] text-[#4a5568]">Includes Location, Rentable area of various units etc.</p>
        </div>

        <div className="bg-white border border-[#e2e8f0] shadow-sm p-8 rounded-sm relative max-w-[1000px] mx-auto">
          <div className="absolute top-4 right-6 text-[11px] text-[#ef4444]">
            * Indicates mandatory fields
          </div>

          <div className="space-y-10 mt-4">
            {/* 11(a). Location */}
            <div className="space-y-6">
              <h3 className="text-[11px] font-bold text-[#718096]">11(a) Location</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2 max-w-[400px]">
                  <label className="block text-[11px] text-[#718096]">Country/Region *</label>
                  <select disabled className="w-full h-10 px-3 bg-[#f3f4f6] border border-[#d1d5db] rounded-sm text-[13px]"><option>India</option></select>
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
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:col-span-2">
                  <div className="space-y-2 max-w-[400px]">
                    <label className="block text-[11px] text-[#718096]">District *</label>
                    <select name="district" className="w-full h-10 px-3 border border-[#d1d5db] rounded-sm text-[13px]"><option>Select</option><option>Bengaluru Urban</option></select>
                  </div>
                  <div className="space-y-2 max-w-[400px]">
                    <label className="block text-[11px] text-[#718096]">State *</label>
                    <select name="state" className="w-full h-10 px-3 border border-[#d1d5db] rounded-sm text-[13px]"><option>Select</option><option>Karnataka</option></select>
                  </div>
                </div>
              </div>
            </div>

            {/* 11(b). Units */}
            <div className="space-y-2 max-w-[400px]">
              <label className="block text-[11px] text-[#718096]">11(b) Total number of units in the project *</label>
              <input 
                type="text"
                name="totalUnits"
                value={formData.totalUnits}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-[#d1d5db] rounded-sm text-[13px]"
              />
            </div>

            {/* 11(c). Rentable Area */}
            <div className="space-y-3">
              <label className="block text-[11px] text-[#718096]">11(c) Rentable area of various units in the project (indicate in sq. metres)</label>
              <button className="flex items-center gap-2 px-3 py-1 border border-[#1d4ed8] text-[#1d4ed8] text-[11px] font-bold rounded-sm hover:bg-[#eff6ff]">
                <span className="text-[14px]">+</span> Add Details
              </button>
              <div className="space-y-1">
                <p className="text-[11px] text-[#718096]">Total rentable area (col. 6)</p>
                <p className="text-[13px] font-bold text-[#1a202c]">0</p>
              </div>
            </div>

            {/* 11(d). Common Facilities */}
            <div className="space-y-3">
              <label className="block text-[11px] text-[#718096]">11(d) Out of the total rentable area, area earmarked for the common facilities & services *</label>
              <button className="flex items-center gap-2 px-3 py-1 border border-[#1d4ed8] text-[#1d4ed8] text-[11px] font-bold rounded-sm hover:bg-[#eff6ff]">
                <span className="text-[14px]">+</span> Add Details
              </button>
              <div className="space-y-1">
                <p className="text-[11px] text-[#718096]">Total area earmarked for the common facilities & services</p>
                <p className="text-[13px] font-bold text-[#1a202c]">0</p>
              </div>
            </div>

            {/* 11(e). Allocable Area */}
            <div className="space-y-1">
              <p className="text-[11px] text-[#718096]">11(e) Total allocable rentable area [11(c)- 11(d)]</p>
              <p className="text-[13px] font-bold text-[#1a202c]">0</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 max-w-[1000px] mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="px-8 py-2 border border-[#1d4ed8] text-[#1d4ed8] text-[14px] font-bold rounded-sm hover:bg-[#eff6ff] transition-colors"
          >
            Back
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
