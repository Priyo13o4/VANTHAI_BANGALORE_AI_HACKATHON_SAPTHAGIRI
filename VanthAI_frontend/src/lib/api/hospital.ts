/**
 * Hospital API Service
 * Handles all hospital-related API calls
 */

import { hospitalApiClient } from './client';
import {
  MOCK_HOSPITAL_SURVEILLANCE_UPLOADS,
  MOCK_SURVEILLANCE_WEEKLY_TRENDS,
  MOCK_SURVEILLANCE_OUTBREAK_ALERTS,
} from '@/constants/hospital';
import type {
  CreateHospitalSurveillanceUploadRequest,
  HospitalSurveillanceUploadRecord,
  PublicSurveillanceAnalytics,
  PublicSurveillanceFilters,
} from '@/types/hospital';

export interface Hospital {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface HospitalStats {
  hospitalName: string;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
  doctorCount: number;
  currentPatients: number;
  totalPatientsTreated: number;
  emergencyServices: boolean;
  specializations?: string[];
}

export interface Staff {
  id: number;
  name: string;
  role: string;
  department: string;
  contact: string;
  email: string;
  shift: string;
  status: 'active' | 'on-leave' | 'inactive';
}

export interface EmergencyCase {
  id: number;
  patientName: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  condition: string;
  admittedAt: string;
  status: 'active' | 'stable' | 'discharged';
}

export interface Department {
  id: number;
  name: string;
  headOfDepartment: string;
  staffCount: number;
  patientCount: number;
  specialization: string;
}

export interface Resource {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  status: 'available' | 'low-stock' | 'out-of-stock';
}

export interface HospitalLoginRequest {
  email: string;
  password: string;
}

export interface AddStaffRequest {
  name: string;
  role: string;
  department: string;
  contact: string;
  email: string;
  shift: string;
}

export interface UpdateResourceRequest {
  quantity?: number;
  reorderLevel?: number;
  status?: 'available' | 'low-stock' | 'out-of-stock';
}

let mockHospitalSurveillanceUploads: HospitalSurveillanceUploadRecord[] = [
  ...MOCK_HOSPITAL_SURVEILLANCE_UPLOADS,
];

const isWithinDateRange = (
  dateValue: string,
  startDate?: string,
  endDate?: string
) => {
  const date = new Date(dateValue).getTime();
  if (Number.isNaN(date)) return false;

  if (startDate) {
    const start = new Date(startDate).getTime();
    if (!Number.isNaN(start) && date < start) return false;
  }

  if (endDate) {
    const end = new Date(endDate).getTime();
    if (!Number.isNaN(end) && date > end) return false;
  }

  return true;
};

export const hospitalService = {
  // Hospital CRUD operations
  async getHospital(hospitalId: number): Promise<Hospital> {
    // Try to get by ID first, then fallback to name
    try {
      return hospitalApiClient.get<Hospital>(`/api/hospitals/${hospitalId}`);
    } catch {
      // Fallback: list hospitals and find by ID
      const hospitals = await this.listHospitals();
      const hospital = hospitals.find((h) => h.id === hospitalId);
      if (!hospital) throw new Error('Hospital not found');
      return hospital;
    }
  },

  async listHospitals(params?: {
    skip?: number;
    limit?: number;
    emergency_only?: boolean;
    specialization?: string;
  }): Promise<Hospital[]> {
    return hospitalApiClient.get<Hospital[]>('/api/hospitals', params);
  },

  async createHospital(data: { hospital_name: string }): Promise<Hospital> {
    return hospitalApiClient.post<Hospital>('/api/hospitals', data);
  },

  async updateHospital(
    hospitalId: number,
    data: Partial<Hospital>
  ): Promise<Hospital> {
    return hospitalApiClient.put<Hospital>(`/api/hospitals/${hospitalId}`, data);
  },

  async deleteHospital(hospitalId: number): Promise<{ success: boolean; message: string }> {
    return hospitalApiClient.delete(`/api/hospitals/${hospitalId}`);
  },

  // Statistics
  async getStats(hospitalId: number): Promise<HospitalStats> {
    // Get hospital details first
    const hospitals = await this.listHospitals();
    const hospital = hospitals.find((h) => h.id === hospitalId);
    if (!hospital) throw new Error('Hospital not found');

    return hospitalApiClient.get<HospitalStats>(
      `/api/hospitals/${hospital.name}/statistics`
    );
  },

  // Doctors
  async getDoctors(hospitalId: number): Promise<unknown[]> {
    const hospitals = await this.listHospitals();
    const hospital = hospitals.find((h) => h.id === hospitalId);
    if (!hospital) throw new Error('Hospital not found');

    return hospitalApiClient.get(`/api/hospitals/${hospital.name}/doctors`);
  },

  // Patients
  async getPatients(
    hospitalId: number,
    currentOnly: boolean = true
  ): Promise<unknown[]> {
    const hospitals = await this.listHospitals();
    const hospital = hospitals.find((h) => h.id === hospitalId);
    if (!hospital) throw new Error('Hospital not found');

    return hospitalApiClient.get(`/api/hospitals/${hospital.name}/patients`, {
      current_only: currentOnly,
    });
  },

  async admitPatient(
    hospitalId: number,
    patientId: number,
    admissionData: {
      treatment_type?: string;
      department?: string;
      reason?: string;
    }
  ): Promise<{ success: boolean; message: string }> {
    const hospitals = await this.listHospitals();
    const hospital = hospitals.find((h) => h.id === hospitalId);
    if (!hospital) throw new Error('Hospital not found');

    return hospitalApiClient.post(
      `/api/hospitals/${hospital.name}/patients/${patientId}/admit`,
      admissionData
    );
  },

  async dischargePatient(
    hospitalId: number,
    patientId: number,
    dischargeSummary?: string
  ): Promise<{ success: boolean; message: string }> {
    const hospitals = await this.listHospitals();
    const hospital = hospitals.find((h) => h.id === hospitalId);
    if (!hospital) throw new Error('Hospital not found');

    return hospitalApiClient.post(
      `/api/hospitals/${hospital.name}/patients/${patientId}/discharge`,
      { discharge_summary: dischargeSummary }
    );
  },

  // Bed Management
  async updateBedAvailability(
    hospitalId: number,
    availableBeds: number
  ): Promise<{ success: boolean; message: string }> {
    const hospitals = await this.listHospitals();
    const hospital = hospitals.find((h) => h.id === hospitalId);
    if (!hospital) throw new Error('Hospital not found');

    return hospitalApiClient.patch(`/api/hospitals/${hospital.name}/beds`, {
      available_beds: availableBeds,
    });
  },

  async getHospitalSurveillanceUploads(
    hospitalId: string
  ): Promise<HospitalSurveillanceUploadRecord[]> {
    return Promise.resolve(
      mockHospitalSurveillanceUploads
        .filter((record) => record.hospitalId === hospitalId)
        .sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        )
    );
  },

  async createHospitalSurveillanceUpload(
    payload: CreateHospitalSurveillanceUploadRequest
  ): Promise<HospitalSurveillanceUploadRecord> {
    const newRecord: HospitalSurveillanceUploadRecord = {
      ...payload,
      id: `SUR-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };

    mockHospitalSurveillanceUploads = [newRecord, ...mockHospitalSurveillanceUploads];
    return Promise.resolve(newRecord);
  },

  async getPublicSurveillanceAnalytics(
    filters: PublicSurveillanceFilters = {}
  ): Promise<PublicSurveillanceAnalytics> {
    const filteredUploads = mockHospitalSurveillanceUploads.filter((record) => {
      const matchesDisease = filters.disease
        ? record.disease.toLowerCase() === filters.disease.toLowerCase()
        : true;
      const matchesDistrict = filters.district
        ? record.district.toLowerCase() === filters.district.toLowerCase()
        : true;
      const matchesDate = isWithinDateRange(
        record.weekStart,
        filters.startDate,
        filters.endDate
      );

      return matchesDisease && matchesDistrict && matchesDate;
    });

    const weeklyTrend = MOCK_SURVEILLANCE_WEEKLY_TRENDS.filter((point) => {
      const matchesDisease = filters.disease
        ? point.disease.toLowerCase() === filters.disease.toLowerCase()
        : true;
      const matchesDate = isWithinDateRange(
        point.week,
        filters.startDate,
        filters.endDate
      );
      return matchesDisease && matchesDate;
    });

    const districtAggregation = filteredUploads.reduce<
      Record<string, { district: string; state: string; suspectedCases: number; confirmedCases: number; lastUpdated: string }>
    >((acc, record) => {
      const key = `${record.district}-${record.state}`;
      const current = acc[key];

      if (!current) {
        acc[key] = {
          district: record.district,
          state: record.state,
          suspectedCases: record.suspectedCases,
          confirmedCases: record.confirmedCases,
          lastUpdated: record.weekEnd,
        };
      } else {
        current.suspectedCases += record.suspectedCases;
        current.confirmedCases += record.confirmedCases;
        if (new Date(record.weekEnd) > new Date(current.lastUpdated)) {
          current.lastUpdated = record.weekEnd;
        }
      }

      return acc;
    }, {});

    const districtStats = Object.values(districtAggregation).sort(
      (a, b) => b.suspectedCases - a.suspectedCases
    );

    const totalCases = filteredUploads.reduce(
      (sum, item) => sum + item.suspectedCases,
      0
    );
    const totalConfirmed = filteredUploads.reduce(
      (sum, item) => sum + item.confirmedCases,
      0
    );

    const outbreakAlerts = MOCK_SURVEILLANCE_OUTBREAK_ALERTS.filter((alert) => {
      const matchesDisease = filters.disease
        ? alert.disease.toLowerCase() === filters.disease.toLowerCase()
        : true;
      const matchesDistrict = filters.district
        ? alert.district.toLowerCase() === filters.district.toLowerCase()
        : true;
      const matchesDate = isWithinDateRange(
        alert.weekStart,
        filters.startDate,
        filters.endDate
      );

      return matchesDisease && matchesDistrict && matchesDate;
    });

    return Promise.resolve({
      totalCases,
      confirmedRate: totalCases > 0 ? (totalConfirmed / totalCases) * 100 : 0,
      affectedDistricts: new Set(filteredUploads.map((item) => item.district)).size,
      weeklyTrend,
      districtStats,
      outbreakAlerts,
    });
  },

  async getSurveillanceTemplateCsv(): Promise<string> {
    return Promise.resolve(
      'weekStart,weekEnd,district,state,disease,suspectedCases,confirmedCases,ageGroup0to17,ageGroup18to49,ageGroup50Plus,maleCases,femaleCases,otherGenderCases,notes\n2026-02-02,2026-02-08,Kolkata,West Bengal,Dengue,20,9,4,11,5,11,8,1,Weekly report notes'
    );
  },

  // Mock services (to be implemented when endpoints are available)
  async getEmergencyCases(hospitalId: number): Promise<EmergencyCase[]> {
    // TODO: Implement when emergency integration is available
    return Promise.resolve([]);
  },

  async getWeeklyEmergencyData(hospitalId: number): Promise<unknown[]> {
    // TODO: Implement
    return Promise.resolve([]);
  },

  async getPatientDistribution(hospitalId: number): Promise<unknown[]> {
    // TODO: Implement
    return Promise.resolve([]);
  },

  async getDepartments(hospitalId: number): Promise<Department[]> {
    // TODO: Implement when department endpoint is available
    return Promise.resolve([]);
  },

  async getDepartmentAnalytics(hospitalId: number): Promise<Record<string, unknown>> {
    // TODO: Implement
    return Promise.resolve({});
  },
};

// Staff Management Service
export const staffService = {
  async getStaff(hospitalId: number): Promise<Staff[]> {
    // TODO: Implement when staff endpoint is available
    return Promise.resolve([]);
  },

  async addStaff(hospitalId: number, data: AddStaffRequest): Promise<Staff> {
    // TODO: Implement
    return Promise.resolve({} as Staff);
  },

  async updateStaff(staffId: number, data: Partial<Staff>): Promise<Staff> {
    // TODO: Implement
    return Promise.resolve({} as Staff);
  },

  async deleteStaff(staffId: number): Promise<{ success: boolean }> {
    // TODO: Implement
    return Promise.resolve({ success: true });
  },
};

// Resource Management Service
export const resourceService = {
  async getResources(hospitalId: number): Promise<Resource[]> {
    // TODO: Implement when resource endpoint is available
    return Promise.resolve([]);
  },

  async updateResource(
    resourceId: number,
    data: UpdateResourceRequest
  ): Promise<Resource> {
    // TODO: Implement
    return Promise.resolve({} as Resource);
  },

  async getResourceDistribution(hospitalId: number): Promise<unknown[]> {
    // TODO: Implement
    return Promise.resolve([]);
  },

  async getLowStockResources(hospitalId: number): Promise<Resource[]> {
    // TODO: Implement
    return Promise.resolve([]);
  },
};

// Hospital Authentication Service
export const hospitalAuthService = {
  async login(credentials: HospitalLoginRequest): Promise<{ token: string; hospital: Hospital }> {
    // TODO: Implement when authentication endpoint is available
    return Promise.resolve({
      token: 'mock-token',
      hospital: {} as Hospital,
    });
  },

  async logout(): Promise<void> {
    // TODO: Implement
    return Promise.resolve();
  },
};
