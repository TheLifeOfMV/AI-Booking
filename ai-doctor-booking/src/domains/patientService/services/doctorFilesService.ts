import { DoctorAttachedFile } from '@/domains/patientService/components/DoctorAttachedFiles';
import { supabase } from '@/platform/lib/supabaseClient';

export const getDoctorAttachedFiles = async (appointmentId: string): Promise<DoctorAttachedFile[]> => {
  if (!appointmentId || appointmentId.trim() === '') {
    throw new Error('Appointment ID is required');
  }

  try {
    const { data: credentials } = await supabase
      .from('doctor_credentials')
      .select('document_urls')
      .limit(10);

    if (!credentials || credentials.length === 0) return [];

    const files: DoctorAttachedFile[] = [];
    for (const cred of credentials) {
      if (cred.document_urls && Array.isArray(cred.document_urls)) {
        for (const url of cred.document_urls) {
          const name = url.split('/').pop() || 'documento';
          files.push({
            id: url,
            name,
            size: 0,
            type: name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
            url,
            uploadedAt: new Date().toISOString(),
            category: 'medical_order',
          });
        }
      }
    }

    return files;
  } catch (error) {
    throw new Error(`Failed to fetch doctor's attached files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const downloadDoctorFile = async (file: DoctorAttachedFile): Promise<void> => {
  if (!file || !file.url) {
    throw new Error('Invalid file object or missing URL');
  }

  const { data } = await supabase.storage
    .from('doctor-documents')
    .createSignedUrl(file.url, 3600);

  const downloadUrl = data?.signedUrl || file.url;
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const hasAttachedFiles = async (appointmentId: string): Promise<boolean> => {
  try {
    const files = await getDoctorAttachedFiles(appointmentId);
    return files.length > 0;
  } catch {
    return false;
  }
};
