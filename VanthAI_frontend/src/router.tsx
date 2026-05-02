/**
 * src/router.tsx
 * Ported from ERP-SIH router.tsx — extended with CloudCare + ITR route trees.
 * data-vanthai-id convention used throughout (renamed from data-chatbot-id).
 *
 * Migration checklist applied to all ported Next.js pages:
 *  ✅ Removed 'use client' / 'use server'
 *  ✅ next/navigation useRouter → react-router-dom useNavigate
 *  ✅ next/link Link → react-router-dom Link
 *  ✅ next/image Image → <img>
 *  ✅ All data-chatbot-id → data-vanthai-id
 *  ✅ API calls, chart rendering, auth logic preserved
 *  ✅ Wrapped in Vite Layout via router (not Next.js DashboardLayout)
 */
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import MuiDashboardLayout from './apps/cloudcare/layout/MuiDashboardLayout';
import ITRLayout from './apps/itr/layout/ITRLayout';

// CloudCare Auth
import PatientLogin from './apps/cloudcare/auth/PatientLogin';
import DoctorLogin from './apps/cloudcare/auth/DoctorLogin';
import HospitalLogin from './apps/cloudcare/auth/HospitalLogin';

// CloudCare pages (migrated from Next.js, functionally preserved)
import PatientDashboard from './apps/cloudcare/patient/PatientDashboard';
import PatientRecords from './apps/cloudcare/patient/PatientRecords';
import PatientAppointments from './apps/cloudcare/patient/PatientAppointments';
import PatientVitals from './apps/cloudcare/patient/PatientVitals';
import PatientPrescriptions from './apps/cloudcare/patient/PatientPrescriptions';

import DoctorDashboard from './apps/cloudcare/doctor/DoctorDashboard';
import DoctorPatients from './apps/cloudcare/doctor/DoctorPatients';
import DoctorSchedule from './apps/cloudcare/doctor/DoctorSchedule';
import DoctorProfile from './apps/cloudcare/doctor/DoctorProfile';

import HospitalDashboard from './apps/cloudcare/hospital/HospitalDashboard';
import HospitalResources from './apps/cloudcare/hospital/HospitalResources';
import HospitalStaff from './apps/cloudcare/hospital/HospitalStaff';
import HospitalSurveillance from './apps/cloudcare/hospital/HospitalSurveillance';

// ITR pages (Phase 5 complete)
import ITROverview from './apps/itr/pages/ITROverview';
import PersonalInfo from './apps/itr/pages/PersonalInfo';
import SalaryIncome from './apps/itr/pages/SalaryIncome';
import Deductions from './apps/itr/pages/Deductions';
import TaxPaid from './apps/itr/pages/TaxPaid';
import FileITR from './apps/itr/pages/FileITR';
import UploadITR from './apps/itr/pages/UploadITR';
import FileITForms from './apps/itr/pages/FileITForms';
import FileForm18 from './apps/itr/pages/FileForm18';
import Form18Sections from './apps/itr/pages/Form18Sections';
import AssesseeDetails from './apps/itr/pages/AssesseeDetails';
import BusinessDetails from './apps/itr/pages/BusinessDetails';
import ProjectDetails from './apps/itr/pages/ProjectDetails';
import ConditionsFulfillment from './apps/itr/pages/ConditionsFulfillment';
import FormAttachments from './apps/itr/pages/FormAttachments';
import FormDeclaration from './apps/itr/pages/FormDeclaration';

const router = createBrowserRouter([
  // Redirect root to cloudcare login
  { path: '/', element: <Navigate to="/cloudcare/login" replace /> },

  // ── CloudCare Auth Routes ───────────────────────────────────────
  { path: '/cloudcare/login', element: <PatientLogin /> },
  { path: '/cloudcare/doctor-login', element: <DoctorLogin /> },
  { path: '/cloudcare/hospital-login', element: <HospitalLogin /> },

  // ── CloudCare routes (MUI Exact Replica) ─────────────────────────
  {
    path: '/cloudcare',
    element: <MuiDashboardLayout />,
    children: [
      { index: true, element: <PatientDashboard /> },
      { path: 'patient', element: <PatientDashboard /> },
      { path: 'patient/records', element: <PatientRecords /> },
      { path: 'patient/appointments', element: <PatientAppointments /> },
      { path: 'patient/vitals', element: <PatientVitals /> },
      { path: 'patient/wearables', element: <PatientVitals /> }, // alias
      { path: 'patient/prescriptions', element: <PatientPrescriptions /> },

      { path: 'doctor', element: <DoctorDashboard /> },
      { path: 'doctor/patients', element: <DoctorPatients /> },
      { path: 'doctor/schedule', element: <DoctorSchedule /> },
      { path: 'doctor/profile', element: <DoctorProfile /> },

      { path: 'hospital', element: <HospitalDashboard /> },
      { path: 'hospital/resources', element: <HospitalResources /> },
      { path: 'hospital/staff', element: <HospitalStaff /> },
      { path: 'hospital/surveillance', element: <HospitalSurveillance /> },
    ],
  },

  // ── ITR routes (Vanilla / Tailwind) ──────────────────────────────
  {
    path: '/itr',
    element: <ITRLayout />,
    children: [
      { index: true, element: <ITROverview /> },
      { path: 'personal', element: <PersonalInfo /> },
      { path: 'file-return', element: <FileITR /> },
      { path: 'upload-itr', element: <UploadITR /> },
      { path: 'file-forms', element: <FileITForms /> },
      { path: 'file-form-18', element: <FileForm18 /> },
      { path: 'form-18-sections', element: <Form18Sections /> },
      { path: 'assessee-details', element: <AssesseeDetails /> },
      { path: 'business-details', element: <BusinessDetails /> },
      { path: 'project-details', element: <ProjectDetails /> },
      { path: 'conditions-fulfillment', element: <ConditionsFulfillment /> },
      { path: 'attachments', element: <FormAttachments /> },
      { path: 'declaration', element: <FormDeclaration /> },
      { path: 'salary', element: <SalaryIncome /> },
      { path: 'deductions', element: <Deductions /> },
      { path: 'tax-paid', element: <TaxPaid /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
