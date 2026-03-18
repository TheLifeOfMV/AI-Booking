import { Patient, PatientFormData } from '@/domains/patientService/types/patient';

export const getPatientProfile = async (id: string): Promise<Patient | null> => {
  const res = await fetch(`/api/patients/${id}`);
  const json = await res.json();
  if (!json.success || !json.data) return null;

  const p = json.data;
  return {
    id: p.user_id,
    name: p.full_name,
    email: '',
    phone: p.phone_number || '',
    status: 'active',
    role: 'patient',
    createdAt: p.created_at,
    avatar: p.avatar_url || undefined,
  };
};

export const updatePatientProfile = async (id: string, data: PatientFormData): Promise<Patient> => {
  const res = await fetch(`/api/patients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: data.name,
      phone_number: data.phone,
    }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Error al actualizar perfil');

  const p = json.data;
  return {
    id: p.user_id,
    name: p.full_name,
    email: data.email || '',
    phone: p.phone_number || '',
    status: 'active',
    role: 'patient',
    createdAt: p.created_at,
    avatar: p.avatar_url || undefined,
  };
};

export const getPatientDocuments = async (patientId: string) => {
  return [];
};

export const getPatientAppointments = async (patientId: string) => {
  const res = await fetch(`/api/bookings?patientId=${patientId}`);
  const json = await res.json();
  if (!json.success) return [];
  return json.data || [];
};
