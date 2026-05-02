import { useNavigate, Link } from 'react-router-dom';

export default function Form18Sections() {
  const navigate = useNavigate();

  const sections = [
    { title: 'Particulars of the assessee', desc: 'Includes Name, Address, PAN, Status etc.' },
    { title: 'Particulars of the specified business', desc: 'Includes Name, Address of the specified business' },
    { title: 'Details of proposed project', desc: 'Includes Location, Rentable area of various units etc.' },
    { title: 'Fulfilment of conditions', desc: 'Includes conditions of the project' },
    { title: 'Other details', desc: 'Includes Proposed Investment, Expected & Actual date of commencement etc.' },
    { title: 'Attachments', desc: 'Please attach Letter of sanction of project, letter of approval of layout of the project, etc.' },
    { title: 'Declaration', desc: 'Declaration Details' },
  ];

  return (
    <div className="space-y-6" data-vanthai-id="form-18-sections-root">
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
          <h1 className="text-[22px] font-bold text-[#1a202c] leading-tight">
            Application for notification of affordable housing project as specified business under section 46 of the Act <span className="text-[#718096] font-normal">[Form No. 18]</span>
          </h1>
          <p className="text-[12px] text-[#4a5568]">
            Application for notification of affordable housing project as specified business under section 46 of the Act. This form is in compliance with Rule 36.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-[14px] font-bold text-[#1a202c]">Provide details for each section</h2>
          
          <div className="bg-white border border-[#e2e8f0] rounded-sm divide-y divide-[#edf2f7]">
            {sections.map((section, idx) => {
              const isAssesseeSection = section.title === 'Particulars of the assessee';
              const isBusinessSection = section.title === 'Particulars of the specified business';
              const isProjectSection = section.title === 'Details of proposed project';
              
              let isCompleted = false;
              let path = '';
              
              if (isAssesseeSection) {
                isCompleted = !!localStorage.getItem('form18_assessee_details');
                path = '/itr/assessee-details';
              } else if (isBusinessSection) {
                isCompleted = !!localStorage.getItem('form18_business_details');
                path = '/itr/business-details';
              } else if (isProjectSection) {
                isCompleted = !!localStorage.getItem('form18_project_details');
                path = '/itr/project-details';
              }

              return (
                <div 
                  key={idx} 
                  onClick={() => path && navigate(path)}
                  className="p-5 flex items-center justify-between hover:bg-[#f8fafc] transition-colors group cursor-pointer"
                >
                  <div className="space-y-1">
                    <h3 className="text-[14px] font-bold text-[#1a202c] group-hover:text-[#1d4ed8] flex items-center gap-2">
                      {section.title}
                      {isCompleted && (
                        <span className="text-green-600 text-[16px]">✓</span>
                      )}
                    </h3>
                    <p className="text-[11px] text-[#718096]">
                      {section.desc}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 text-[11px] font-bold ${isCompleted ? 'text-green-600' : 'text-[#1d4ed8]'}`}>
                    <span>{isCompleted ? 'Completed' : 'Provide details'}</span>
                    <span className="text-[14px]">›</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-6">
          <button 
            onClick={() => navigate(-1)}
            className="px-10 py-2 border border-[#1d4ed8] text-[#1d4ed8] text-[14px] font-bold rounded-sm hover:bg-[#eff6ff] transition-colors"
          >
            Back
          </button>
          <button 
            disabled
            className="px-10 py-2 bg-[#e5e7eb] text-[#9ca3af] text-[14px] font-bold rounded-sm cursor-not-allowed"
          >
            Preview
          </button>
        </div>
      </div>
    </div>
  );
}
