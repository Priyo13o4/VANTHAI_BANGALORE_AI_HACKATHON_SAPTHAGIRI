import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function AssesseeDetails() {
  const navigate = useNavigate();
  
  // Load data from localStorage or use empty defaults
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('form18_assessee_details');
    return saved ? JSON.parse(saved) : {
      name: '',
      address: '',
      pan: '',
      status: '',
      email: '',
      contact: '',
      residentialStatus: ''
    };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    localStorage.setItem('form18_assessee_details', JSON.stringify(formData));
    navigate(-1);
  };

  return (
    <div className="space-y-6" data-vanthai-id="assessee-details-root">
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
          <h1 className="text-[22px] font-bold text-[#1a202c]">Particulars of the assessee</h1>
          <p className="text-[12px] text-[#4a5568]">Includes Name, Address, PAN, Status etc.</p>
        </div>

        <div className="bg-white border border-[#e2e8f0] shadow-sm p-8 rounded-sm relative max-w-[1000px] mx-auto">
          <div className="absolute top-4 right-6 text-[11px] text-[#ef4444]">
            * Indicates mandatory fields
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 mt-4">
            {/* 1. Name */}
            <div className="space-y-2">
              <label className="block text-[11px] text-[#718096]">1. Name</label>
              <input 
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-white border border-[#d1d5db] rounded-sm text-[13px] text-[#1a202c] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8] transition-colors"
              />
            </div>

            {/* 2. Address */}
            <div className="space-y-2">
              <label className="block text-[11px] text-[#718096]">2. Address</label>
              <textarea 
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-[#d1d5db] rounded-sm text-[13px] text-[#1a202c] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8] transition-colors resize-none"
              />
            </div>

            {/* Profile Note */}
            <div className="lg:col-span-2">
              <p className="text-[11px] text-[#4a5568]">
                <span className="font-bold">Note:</span> To update contact details, go to <span className="text-[#1d4ed8] hover:underline cursor-pointer">'My Profile'</span>. After updating, delete any existing draft, log out, then log in again to file a new form
              </p>
            </div>

            {/* 3. PAN */}
            <div className="space-y-2">
              <label className="block text-[11px] text-[#718096]">3. Permanent Account Number</label>
              <input 
                type="text"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-white border border-[#d1d5db] rounded-sm text-[13px] text-[#1a202c] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8] transition-colors"
              />
            </div>

            {/* 4. Status */}
            <div className="space-y-2">
              <label className="block text-[11px] text-[#718096]">4. Status</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-white border border-[#d1d5db] rounded-sm text-[13px] text-[#1a202c] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8] transition-colors"
              >
                <option value="Individual">Individual</option>
                <option value="HUF">HUF</option>
                <option value="Company">Company</option>
                <option value="Firm">Firm</option>
              </select>
            </div>

            {/* 5. Residential Status */}
            <div className="space-y-2">
              <label className="block text-[11px] text-[#718096]">
                5. Residential Status <span className="text-[#ef4444]">*</span>
              </label>
              <div className="relative">
                <select 
                  name="residentialStatus"
                  value={formData.residentialStatus}
                  onChange={handleChange}
                  className="w-full h-10 px-3 bg-white border border-[#d1d5db] rounded-sm text-[13px] text-[#1a202c] appearance-none focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8] transition-colors"
                >
                  <option value="">Select</option>
                  <option value="Resident">Resident</option>
                  <option value="Non-Resident">Non-Resident</option>
                  <option value="Not Ordinarily Resident">Resident but Not Ordinarily Resident</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[10px] text-[#718096]">
                  ▼
                </div>
              </div>
            </div>

            {/* 6. Email id */}
            <div className="space-y-2">
              <label className="block text-[11px] text-[#718096]">6. Email id</label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-white border border-[#d1d5db] rounded-sm text-[13px] text-[#1a202c] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8] transition-colors"
              />
            </div>

            {/* 7. Contact Number */}
            <div className="space-y-2">
              <label className="block text-[11px] text-[#718096]">7. Contact Number</label>
              <input 
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-white border border-[#d1d5db] rounded-sm text-[13px] text-[#1a202c] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8] transition-colors"
              />
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
            disabled={!formData.residentialStatus}
            className={`px-10 py-2 text-[14px] font-bold rounded-sm transition-colors ${
              formData.residentialStatus 
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
