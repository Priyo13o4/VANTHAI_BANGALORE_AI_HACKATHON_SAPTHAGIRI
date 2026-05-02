import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function OtherDetails() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('form18_other_details');
    return saved ? JSON.parse(saved) : {
      investment: '',
      expectedDate: '',
      actualDate: '',
      hasAdjacentLand: '',
      isSeparateArea: '',
      projectStatus: '',
      landTitle: '',
      hasAgreement: ''
    };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    localStorage.setItem('form18_other_details', JSON.stringify(formData));
    navigate(-1);
  };

  const isFormValid = formData.investment && formData.expectedDate && formData.actualDate && formData.landTitle && formData.projectStatus;

  return (
    <div className="space-y-6" data-vanthai-id="other-details-root">
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
          <h1 className="text-[22px] font-bold text-[#1a202c]">Other details</h1>
          <p className="text-[12px] text-[#4a5568]">Includes Proposed Investment, Expected & Actual date of commencement etc.</p>
        </div>

        <div className="bg-white border border-[#e2e8f0] shadow-sm p-8 rounded-sm relative">
          <div className="absolute top-4 right-6 text-[11px] text-[#ef4444]">
            * Indicates mandatory fields
          </div>

          <div className="space-y-10 mt-6">
            {/* 13. Proposed Investment */}
            <div className="space-y-2 max-w-[300px]">
              <label className="block text-[11px] text-[#718096]">13. Proposed investment *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-[13px]">₹</span>
                <input 
                  type="text" 
                  name="investment"
                  value={formData.investment}
                  onChange={handleChange}
                  className="w-full h-10 pl-8 pr-3 border border-[#d1d5db] rounded-sm text-[13px]"
                />
              </div>
            </div>

            {/* 14. Dates */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2 max-w-[300px]">
                <label className="block text-[11px] text-[#718096]">14(a). Expected date of commencement of the project *</label>
                <div className="relative">
                  <input 
                    type="date" 
                    name="expectedDate"
                    value={formData.expectedDate}
                    onChange={handleChange}
                    className="w-full h-10 px-3 border border-[#d1d5db] rounded-sm text-[13px]"
                  />
                </div>
              </div>
              <div className="space-y-2 max-w-[300px]">
                <label className="block text-[11px] text-[#718096]">14(b). Actual date of commencement of the project *</label>
                <div className="relative">
                  <input 
                    type="date" 
                    name="actualDate"
                    value={formData.actualDate}
                    onChange={handleChange}
                    className="w-full h-10 px-3 border border-[#d1d5db] rounded-sm text-[13px]"
                  />
                </div>
              </div>
            </div>

            {/* 15 & 16. Yes/No Questions */}
            {[
              { id: '15', name: 'hasAdjacentLand', text: 'Whether the assessee has any land or project adjacent or in the vicinity of the proposed project? *' },
              { id: '16', name: 'isSeparateArea', text: 'Whether the proposed project is located or developed as a separate identifiable area? *' }
            ].map(q => (
              <div key={q.id} className="space-y-3">
                <p className="text-[12px] text-[#4a5568] font-bold">{q.id}. {q.text}</p>
                <div className="flex items-center gap-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name={q.name}
                      value="Yes"
                      checked={formData[q.name as keyof typeof formData] === 'Yes'}
                      onChange={() => handleRadioChange(q.name, 'Yes')}
                      className="w-4 h-4 text-[#1d4ed8]"
                    />
                    <span className="text-[12px] text-[#4a5568]">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name={q.name}
                      value="No"
                      checked={formData[q.name as keyof typeof formData] === 'No'}
                      onChange={() => handleRadioChange(q.name, 'No')}
                      className="w-4 h-4 text-[#1d4ed8]"
                    />
                    <span className="text-[12px] text-[#4a5568]">No</span>
                  </label>
                </div>
              </div>
            ))}

            {/* 17. Project Status */}
            <div className="space-y-3">
              <p className="text-[12px] text-[#4a5568] font-bold">17. Please state Whether: *</p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="projectStatus"
                    value="Independent"
                    checked={formData.projectStatus === 'Independent'}
                    onChange={() => handleRadioChange('projectStatus', 'Independent')}
                    className="w-4 h-4 text-[#1d4ed8]"
                  />
                  <span className="text-[12px] text-[#4a5568]">The project is independent of other projects</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="projectStatus"
                    value="Extension"
                    checked={formData.projectStatus === 'Extension'}
                    onChange={() => handleRadioChange('projectStatus', 'Extension')}
                    className="w-4 h-4 text-[#1d4ed8]"
                  />
                  <span className="text-[12px] text-[#4a5568]">The project is an extension or part of any other project</span>
                </label>
              </div>
            </div>

            {/* 18. Nature of Title */}
            <div className="space-y-2">
              <label className="block text-[12px] text-[#4a5568] font-bold">18. Nature of title the assessee holds on the land on which the project is situated *</label>
              <textarea 
                name="landTitle"
                value={formData.landTitle}
                onChange={handleChange}
                maxLength={400}
                rows={4}
                className="w-full px-3 py-2 border border-[#d1d5db] rounded-sm text-[13px] focus:outline-none focus:border-[#1d4ed8]"
              />
              <p className="text-[10px] text-right text-[#718096]">Remaining Characters :: {400 - formData.landTitle.length}</p>
            </div>

            {/* 19. Agreement */}
            <div className="space-y-3">
              <p className="text-[12px] text-[#4a5568] font-bold flex items-center gap-2">
                19. Whether the project is developed under any agreement and if yes, the details of other parties (other than applicant) to such an agreement? *
                <span className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center text-[10px] text-gray-500 cursor-help">i</span>
              </p>
              <div className="flex items-center gap-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="hasAgreement" value="Yes" checked={formData.hasAgreement === 'Yes'} onChange={() => handleRadioChange('hasAgreement', 'Yes')} className="w-4 h-4 text-[#1d4ed8]" /><span className="text-[12px] text-[#4a5568]">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="hasAgreement" value="No" checked={formData.hasAgreement === 'No'} onChange={() => handleRadioChange('hasAgreement', 'No')} className="w-4 h-4 text-[#1d4ed8]" /><span className="text-[12px] text-[#4a5568]">No</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6">
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
