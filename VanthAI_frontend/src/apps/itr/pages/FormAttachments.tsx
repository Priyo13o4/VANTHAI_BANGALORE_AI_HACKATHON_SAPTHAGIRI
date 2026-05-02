import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function FormAttachments() {
  const navigate = useNavigate();
  
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem('form18_attachments_details');
    return saved ? JSON.parse(saved) : {
      a1: null,
      a2: null,
      a3: null,
      a4: null,
      description: ''
    };
  });

  const handleFileAttach = (id: string) => {
    // Simulate file attachment for demo
    setFiles({ ...files, [id]: 'attached_file.pdf' });
  };

  const handleSave = () => {
    localStorage.setItem('form18_attachments_details', JSON.stringify(files));
    navigate(-1);
  };

  const isFormValid = files.a2 && files.a3; // A2 and A3 are mandatory

  const attachmentSections = [
    { id: 'a1', label: 'A-1. attach copy of agreement' },
    { id: 'a2', label: 'A-2. letter of sanction of the project by competent authority empowered under the Scheme of Affordable Housing in Partnership framed by the Ministry of Housing and Urban Poverty Alleviation. *' },
    { id: 'a3', label: 'A-3. Letter of approval of the layout and specifications including design of the project to be developed and built by the State or Union territory Government or its designated implementing agency. *' },
    { id: 'a4', label: 'A-4. Any other attachment', hasDesc: true },
  ];

  return (
    <div className="space-y-6" data-vanthai-id="form-attachments-root">
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
          <h1 className="text-[22px] font-bold text-[#1a202c]">Attachments</h1>
          <p className="text-[12px] text-[#4a5568]">Please attach Letter of sanction of project, letter of approval of layout of the project, etc.</p>
        </div>

        <div className="bg-white border border-[#e2e8f0] shadow-sm p-8 rounded-sm relative">
          <div className="absolute top-4 right-6 text-[11px] text-[#ef4444]">
            * Indicates mandatory fields
          </div>

          <div className="space-y-10 mt-6">
            <div className="space-y-4">
              <h3 className="text-[13px] font-bold text-[#1a202c]">21. Any other details</h3>
              
              <div className="bg-[#eff6ff] border border-[#bfdbfe] p-4 rounded-sm space-y-2">
                <p className="text-[12px] font-bold text-[#1e40af]">Note:</p>
                <ol className="text-[11px] text-[#1e40af] list-decimal list-inside space-y-1">
                  <li>Size of each attachment should not exceed 5MB.</li>
                  <li>All the attachments together should not exceed 50MB.</li>
                  <li>All attachments should be in PDF or ZIP (can contain only pdf) formats only.</li>
                </ol>
              </div>
            </div>

            <div className="space-y-8">
              {attachmentSections.map((section) => (
                <div key={section.id} className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="space-y-3 flex-1">
                      <p className="text-[12px] text-[#4a5568] leading-relaxed max-w-[800px]">
                        {section.label}
                      </p>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleFileAttach(section.id)}
                            className="flex items-center gap-2 text-[#1d4ed8] text-[12px] font-bold hover:underline"
                          >
                            <span className="text-[16px] italic">👁</span> Attach File
                          </button>
                          {files[section.id as keyof typeof files] && (
                            <span className="text-[11px] text-green-600 font-bold">✓ attached_file.pdf</span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#718096]">Only .pdf and .zip files. 5MB max file size.</p>
                      </div>
                    </div>

                    {section.hasDesc && (
                      <div className="w-[300px] space-y-2">
                        <label className="block text-[11px] text-[#718096]">Document description in brief</label>
                        <input 
                          type="text"
                          value={files.description}
                          onChange={(e) => setFiles({...files, description: e.target.value})}
                          className="w-full h-10 px-3 bg-[#f8fafc] border border-[#d1d5db] rounded-sm text-[13px]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
