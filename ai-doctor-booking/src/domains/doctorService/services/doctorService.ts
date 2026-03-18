import { Doctor, DoctorFilter, CredentialStatus } from '@/domains/doctorService/types/doctor';

export const getDoctors = async (
  filters?: DoctorFilter,
  page: number = 1,
  limit: number = 10
): Promise<{ doctors: Doctor[]; total: number }> => {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('offset', String((page - 1) * limit));

  if (filters?.specialtyId) params.set('specialtyId', filters.specialtyId);
  if (filters?.search) params.set('search', filters.search);

  const isAdmin = filters?.credentialStatus !== undefined || filters?.approvalStatus !== undefined;
  const url = isAdmin ? `/api/admin/doctors?${params}` : `/api/doctors?${params}`;

  const res = await fetch(url);
  const json = await res.json();

  if (!json.success) throw new Error(json.message || 'Failed to fetch doctors');

  const rawDoctors = json.data?.doctors || json.data || [];

  const doctors: Doctor[] = rawDoctors.map((doc: any) => ({
    id: doc.user_id,
    name: doc.profile?.full_name || doc.profiles?.full_name || '',
    email: '',
    phone: doc.profile?.phone_number || doc.profiles?.phone_number || '',
    status: doc.approval_status ? 'active' : 'inactive',
    specialtyId: String(doc.specialty_id || ''),
    specialtyName: doc.specialty?.name || doc.specialties?.name || '',
    experience: doc.experience_years ? `${doc.experience_years}+ años` : '',
    rating: parseFloat(doc.rating) || 0,
    credentials: {
      licenseNumber: '',
      expiryDate: '',
      status: 'pending' as CredentialStatus,
      documentUrls: [],
    },
    education: [],
    approvalStatus: doc.approval_status ?? false,
    availableTimes: [],
    location: doc.location || '',
    createdAt: doc.created_at,
    subscription: {
      id: '',
      planType: 'gratuito',
      monthlyFee: 0,
      status: 'active',
      paymentStatus: 'pending',
      startDate: '',
      endDate: '',
      nextPaymentDate: '',
      failedPaymentAttempts: 0,
    },
  }));

  let filtered = doctors;
  if (filters?.credentialStatus) {
    filtered = filtered.filter(d => d.credentials.status === filters.credentialStatus);
  }
  if (filters?.approvalStatus !== undefined) {
    filtered = filtered.filter(d => d.approvalStatus === filters.approvalStatus);
  }

  return { doctors: filtered, total: json.data?.total ?? filtered.length };
};

export const getDoctorById = async (doctorId: string): Promise<Doctor | null> => {
  const res = await fetch(`/api/doctors/${doctorId}`);
  const json = await res.json();
  if (!json.success || !json.data) return null;

  const doc = json.data;
  return {
    id: doc.user_id,
    name: doc.profile?.full_name || '',
    email: '',
    phone: doc.profile?.phone_number || '',
    status: doc.approval_status ? 'active' : 'inactive',
    specialtyId: String(doc.specialty_id || ''),
    specialtyName: doc.specialty?.name || '',
    experience: doc.experience_years ? `${doc.experience_years}+ años` : '',
    rating: parseFloat(doc.rating) || 0,
    credentials: {
      licenseNumber: '',
      expiryDate: '',
      status: 'pending' as CredentialStatus,
      documentUrls: [],
    },
    education: [],
    approvalStatus: doc.approval_status ?? false,
    availableTimes: [],
    location: doc.location || '',
    createdAt: doc.created_at,
    subscription: {
      id: '',
      planType: 'gratuito',
      monthlyFee: 0,
      status: 'active',
      paymentStatus: 'pending',
      startDate: '',
      endDate: '',
      nextPaymentDate: '',
      failedPaymentAttempts: 0,
    },
  };
};

export const updateDoctor = async (doctorId: string, doctorData: Partial<Doctor>): Promise<Doctor> => {
  const res = await fetch(`/api/admin/doctors/${doctorId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doctorData),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update doctor');
  const doc = json.data;
  return {
    id: doc.user_id,
    name: doc.profile?.full_name || '',
    email: '',
    phone: doc.profile?.phone_number || '',
    status: doc.approval_status ? 'active' : 'inactive',
    specialtyId: String(doc.specialty_id || ''),
    specialtyName: doc.specialty?.name || '',
    experience: doc.experience_years ? `${doc.experience_years}+ años` : '',
    rating: parseFloat(doc.rating) || 0,
    credentials: { licenseNumber: '', expiryDate: '', status: 'pending' as CredentialStatus, documentUrls: [] },
    education: [],
    approvalStatus: doc.approval_status ?? false,
    availableTimes: [],
    location: doc.location || '',
    createdAt: doc.created_at,
    subscription: { id: '', planType: 'gratuito', monthlyFee: 0, status: 'active', paymentStatus: 'pending', startDate: '', endDate: '', nextPaymentDate: '', failedPaymentAttempts: 0 },
  };
};

export const toggleDoctorApproval = async (doctorId: string, approve: boolean): Promise<Doctor> => {
  const res = await fetch(`/api/admin/doctors/${doctorId}/approval`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approved: approve }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to toggle approval');
  const doc = json.data;
  return {
    id: doc.user_id,
    name: doc.profile?.full_name || '',
    email: '',
    phone: doc.profile?.phone_number || '',
    status: doc.approval_status ? 'active' : 'inactive',
    specialtyId: String(doc.specialty_id || ''),
    specialtyName: doc.specialty?.name || '',
    experience: doc.experience_years ? `${doc.experience_years}+ años` : '',
    rating: parseFloat(doc.rating) || 0,
    credentials: { licenseNumber: '', expiryDate: '', status: 'pending' as CredentialStatus, documentUrls: [] },
    education: [],
    approvalStatus: doc.approval_status ?? false,
    availableTimes: [],
    location: doc.location || '',
    createdAt: doc.created_at,
    subscription: { id: '', planType: 'gratuito', monthlyFee: 0, status: 'active', paymentStatus: 'pending', startDate: '', endDate: '', nextPaymentDate: '', failedPaymentAttempts: 0 },
  };
};

export const updateCredentialStatus = async (
  doctorId: string,
  status: CredentialStatus,
): Promise<Doctor> => {
  const res = await fetch(`/api/admin/doctors/${doctorId}/credentials`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update credentials');
  const doc = json.data;
  return {
    id: doc.user_id || doctorId,
    name: doc.profile?.full_name || '',
    email: '',
    phone: doc.profile?.phone_number || '',
    status: 'active',
    specialtyId: String(doc.specialty_id || ''),
    specialtyName: doc.specialty?.name || '',
    experience: doc.experience_years ? `${doc.experience_years}+ años` : '',
    rating: parseFloat(doc.rating) || 0,
    credentials: { licenseNumber: '', expiryDate: '', status, documentUrls: [] },
    education: [],
    approvalStatus: doc.approval_status ?? false,
    availableTimes: [],
    location: doc.location || '',
    createdAt: doc.created_at,
    subscription: { id: '', planType: 'gratuito', monthlyFee: 0, status: 'active', paymentStatus: 'pending', startDate: '', endDate: '', nextPaymentDate: '', failedPaymentAttempts: 0 },
  };
};

export const getSpecialties = async () => {
  const res = await fetch('/api/specialties');
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch specialties');
  return (json.data || []).map((s: any) => ({ id: String(s.id), name: s.name }));
};
