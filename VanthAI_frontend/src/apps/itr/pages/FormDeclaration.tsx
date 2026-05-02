import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function FormDeclaration() {
  const navigate = useNavigate();
  
  const [assesseeName, setAssesseeName] = useState('Assessee');
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('form18_declaration_details');
    return saved ? JSON.parse(saved) : {
      fatherName: '',
      capacity: 'Self',
      place: '',
      date: new Date().toISOString().split('T')[0],
      isAgreed: false
    };
  });

  useEffect(() => {
    const savedAssessee = localStorage.getItem('form18_assessee_details');
    if (savedAssessee) {
      const parsed = JSON.parse(savedAssessee);
      if (parsed.name) setAssesseeName(parsed.name);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData({ ...formData, [name]: val });
  };

  const handleSave = () => {
    localStorage.setItem('form18_declaration_details', JSON.stringify(formData));
    navigate(-1);
  };

  const isFormValid = formData.fatherName && formData.place && formData.isAgreed;

  return (
    <div className="space-y-6" data-vanthai-id="form-declaration-root">
      {/* Breadcrumbs */}
      <nav className="flex text-[10px] text-[#4b5563] gap-1 px-1">
        <Link to="/itr" className="hover:text-[#1d4ed8]">Dashboard</Link>
        <span>›</span>
        <Link to="/itr/file-forms" className="hover:text-[#1d4ed8]">Income-tax Forms</Link>
        <span>›</span>
        <span>Form 18</span>
      </nav>

      <div className="space-y-6 max-w-[1000px] mx-auto">
        <div className="space-y-2">
          <h1 className="text-[22px] font-bold text-[#1a202c]">Declaration</h1>
          <p className="text-[12px] text-[#4a5568]">Declaration Details</p>
        </div>

        <div className="bg-white border border-[#e2e8f0] shadow-sm p-8 rounded-sm relative">
          <div className="absolute top-4 right-6 text-[11px] text-[#ef4444]">
            * Indicates mandatory fields
          </div>

          <div className="space-y-8 mt-6">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-4 text-[13px] text-[#4a5568] leading-relaxed">
                I, <span className="font-bold text-[#1a202c] border-b border-gray-300 px-2 min-w-[150px] inline-block">{assesseeName}</span> 
                son/daughter of <input 
                  type="text" 
                  name="fatherName"
                  placeholder="Enter Father's Name"
                  value={formData.fatherName}
                  onChange={handleChange}
                  className="border-b border-gray-300 focus:border-[#1d4ed8] focus:outline-none px-2 font-bold text-[#1a202c] w-[200px]"
                /> *
                solemnly declare that to the best of my knowledge and belief, the information given in the application and the annexures and statements accompanying it is correct and complete and that the other conditions of section 46 of the Act and Rule 36 of the Rules have been complied with.
              </div>

              <div className="flex items-center gap-4 text-[13px] text-[#4a5568]">
                I further declare that I am filing this application in my capacity as 
                <select 
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="h-10 px-3 bg-white border border-[#d1d5db] rounded-sm text-[13px] text-[#1a202c] focus:outline-none focus:border-[#1d4ed8]"
                >
                  <option value="Self">Self</option>
                  <option value="Representative">Representative</option>
                </select>
                and I am also competent to file this application and verify it.
              </div>
            </div>

            <div className="pt-6 border-t border-[#edf2f7] space-y-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  name="isAgreed"
                  checked={formData.isAgreed}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-[#1d4ed8] border-gray-300 rounded focus:ring-[#1d4ed8]"
                />
                <span className="text-[12px] text-[#4a5568] font-medium leading-relaxed">
                  I agree that all the information provided in this form is true to the best of my knowledge and I understand the legal implications of providing false information. *
                </span>
              </label>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[11px] text-[#718096]">Place *</label>
                  <input 
                    type="text" 
                    name="place"
                    value={formData.place}
                    onChange={handleChange}
                    placeholder="Enter Place"
                    className="w-full h-10 px-3 border border-[#d1d5db] rounded-sm text-[13px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] text-[#718096]">Date</label>
                  <input 
                    type="date" 
                    name="date"
                    value={formData.date}
                    disabled
                    className="w-full h-10 px-3 bg-[#f8fafc] border border-[#d1d5db] rounded-sm text-[13px] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6">
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
