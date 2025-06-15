import { DoctorAttachedFile } from '@/components/patient/DoctorAttachedFiles';

/**
 * Service for managing doctor's attached files
 * Following MONOCODE principles with structured logging and explicit error handling
 */

// Observable Implementation: Structured logging for service operations
const logServiceOperation = (operation: string, data: any) => {
  console.log('DoctorFilesService operation', {
    operation,
    timestamp: new Date().toISOString(),
    ...data
  });
};

/**
 * Fetches doctor's attached files for a specific appointment
 * @param appointmentId - The appointment ID
 * @returns Promise<DoctorAttachedFile[]>
 */
export const getDoctorAttachedFiles = async (appointmentId: string): Promise<DoctorAttachedFile[]> => {
  logServiceOperation('getDoctorAttachedFiles', { appointmentId });

  try {
    // Explicit Error Handling: Validate input
    if (!appointmentId || appointmentId.trim() === '') {
      throw new Error('Appointment ID is required');
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock data - in real implementation, this would be an API call
    const mockFiles: DoctorAttachedFile[] = [
      {
        id: 'file_1',
        name: 'Orden_Laboratorio_Cardiologia.pdf',
        size: 245760,
        type: 'application/pdf',
        url: '/uploads/appointments/orden_laboratorio.pdf',
        uploadedAt: '2024-01-15T10:30:00.000Z',
        category: 'medical_order'
      },
      {
        id: 'file_2', 
        name: 'Receta_Medicamentos.pdf',
        size: 156432,
        type: 'application/pdf',
        url: '/uploads/appointments/receta_medicamentos.pdf',
        uploadedAt: '2024-01-15T10:35:00.000Z',
        category: 'prescription'
      },
      {
        id: 'file_3',
        name: 'Resultado_Electrocardiograma.jpg',
        size: 1024000,
        type: 'image/jpeg',
        url: '/uploads/appointments/electrocardiograma.jpg',
        uploadedAt: '2024-01-15T10:40:00.000Z',
        category: 'lab_result'
      }
    ];

    // Filter files based on appointment (in real app, this would be done by the API)
    const appointmentFiles = mockFiles.filter(file => 
      // Mock logic: show files for specific appointment IDs
      appointmentId === '1' || appointmentId === '2' || appointmentId === '3'
    );

    logServiceOperation('getDoctorAttachedFiles_success', { 
      appointmentId, 
      fileCount: appointmentFiles.length 
    });

    return appointmentFiles;

  } catch (error) {
    // Explicit Error Handling: Log and re-throw with context
    logServiceOperation('getDoctorAttachedFiles_error', { 
      appointmentId, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    throw new Error(`Failed to fetch doctor's attached files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Downloads a specific file
 * @param file - The file to download
 * @returns Promise<void>
 */
export const downloadDoctorFile = async (file: DoctorAttachedFile): Promise<void> => {
  logServiceOperation('downloadDoctorFile', { 
    fileId: file.id, 
    fileName: file.name,
    fileCategory: file.category 
  });

  try {
    // Explicit Error Handling: Validate file object
    if (!file || !file.url) {
      throw new Error('Invalid file object or missing URL');
    }

    // In a real implementation, this might involve:
    // - Authentication checks
    // - File access permissions
    // - Secure download URLs
    // - Download tracking/analytics

    // For now, we'll just trigger the browser download
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logServiceOperation('downloadDoctorFile_success', { 
      fileId: file.id, 
      fileName: file.name 
    });

  } catch (error) {
    // Explicit Error Handling: Log and re-throw with context
    logServiceOperation('downloadDoctorFile_error', { 
      fileId: file.id, 
      fileName: file.name,
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Checks if an appointment has attached files
 * @param appointmentId - The appointment ID
 * @returns Promise<boolean>
 */
export const hasAttachedFiles = async (appointmentId: string): Promise<boolean> => {
  try {
    const files = await getDoctorAttachedFiles(appointmentId);
    return files.length > 0;
  } catch (error) {
    // Graceful Fallbacks: Return false if we can't check
    logServiceOperation('hasAttachedFiles_error', { 
      appointmentId, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return false;
  }
}; 