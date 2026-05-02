import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function ConditionsFulfillment() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('form18_conditions_details');
    return saved ? JSON.parse(saved) : {
      c12a: '',
      c12b: '',
      c12c: '',
      c12d: '',
      c12e: '',
      c12f: '',
      c12g: ''
    };
  });

  const handleRadioChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    localStorage.setItem('form18_conditions_details', JSON.stringify(formData));
    navigate(-1);
  };

  const isFormValid = Object.values(formData).every(v => v !== '');

  const questions = [
    { id: '12a', name: 'c12a', text: 'the project has the prior sanction of the competent authority empowered under the Scheme of Affordable Housing in Partnership framed by the Ministry of Housing and Urban Affairs, Government of India *' },
    { id: '12b', name: 'c12b', text: 'the date of commencement of operations of the project is on or after the 1st day of April, 2011 *' },
    { id: '12c', name: 'c12c', text: 'the project is on a plot of land which has a minimum area of one acre *' },
    { id: '12d', name: 'c12d', text: 'at least thirty per cent of the total allocable rentable area of the project comprises of affordable housing units of EWS category *' },
    { id: '12e', name: 'c12e', text: 'at least sixty per cent of the total allocable rentable area of the project comprises of affordable housing units of EWS and LIG categories *' },
    { id: '12f', name: 'c12f', text: 'at least ninety per cent of the total allocable rentable area of the project comprises of affordable housing units of EWS, LIG and MIG categories *' },
    { id: '12g', name: 'c12g', text: 'the layout and specifications including design of the project to be developed and built have been approved by the State or Union territory Government or its designated implementing agency *', hasInfo: true },
  ];

  return (
    <div className="space-y-6" data-vanthai-id="conditions-fulfillment-root">
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
          <h1 className="text-[22px] font-bold text-[#1a202c]">Fulfilment of conditions</h1>
          <p className="text-[12px] text-[#4a5568]">Includes conditions of the project</p>
        </div>

        <div className="bg-white border border-[#e2e8f0] shadow-sm p-8 rounded-sm relative">
          <div className="absolute top-4 right-6 text-[11px] text-[#ef4444]">
            * Indicates mandatory fields
          </div>

          <div className="space-y-8 mt-6">
            <div className="flex items-start gap-2">
              <span className="text-[13px] font-bold text-[#1a202c]">12.</span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-bold text-[#1a202c]">Whether each of the following conditions mentioned in rule 36 (5) is fulfilled</h3>
                  <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center text-[10px] text-gray-500 cursor-help">i</div>
                </div>
                
                <div className="space-y-10 mt-8">
                  {questions.map((q) => (
                    <div key={q.id} className="space-y-3">
                      <div className="flex items-start gap-4">
                        <span className="text-[12px] font-medium text-[#4a5568] shrink-0 min-w-[35px]">{q.id}({q.id.slice(-1)})</span>
                        <div className="space-y-3">
                          <p className="text-[12px] text-[#4a5568] leading-relaxed max-w-[800px]">
                            {q.text} {q.hasInfo && <span className="inline-flex w-3.5 h-3.5 rounded-full border border-gray-400 items-center justify-center text-[9px] text-gray-500 cursor-help ml-1">i</span>}
                          </p>
                          <div className="flex items-center gap-8">
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <div className="relative flex items-center justify-center">
                                <input 
                                  type="radio" 
                                  name={q.name}
                                  value="Yes"
                                  checked={formData[q.name as keyof typeof formData] === 'Yes'}
                                  onChange={() => handleRadioChange(q.name, 'Yes')}
                                  className="peer appearance-none w-4 h-4 border border-gray-300 rounded-full checked:border-[#1d4ed8] transition-all"
                                />
                                <div className="absolute w-2 h-2 bg-[#1d4ed8] rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                              </div>
                              <span className="text-[12px] text-[#4a5568]">Yes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <div className="relative flex items-center justify-center">
                                <input 
                                  type="radio" 
                                  name={q.name}
                                  value="No"
                                  checked={formData[q.name as keyof typeof formData] === 'No'}
                                  onChange={() => handleRadioChange(q.name, 'No')}
                                  className="peer appearance-none w-4 h-4 border border-gray-300 rounded-full checked:border-[#1d4ed8] transition-all"
                                />
                                <div className="absolute w-2 h-2 bg-[#1d4ed8] rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                              </div>
                              <span className="text-[12px] text-[#4a5568]">No</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
