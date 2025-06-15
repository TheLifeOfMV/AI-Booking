import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// File upload configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'appointments');

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Validate file
function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `El archivo es demasiado grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido: ${file.type}`
    };
  }

  return { valid: true };
}

// Generate safe filename
function generateSafeFilename(originalName: string, appointmentId: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop() || '';
  const safeName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 50);
  
  return `${appointmentId}_${timestamp}_${randomId}_${safeName}`;
}

// Determine file category
function determineFileCategory(file: File): string {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  if (fileType.startsWith('image/')) return 'image';
  if (fileType === 'application/pdf') {
    if (fileName.includes('orden') || fileName.includes('order')) return 'medical_order';
    if (fileName.includes('receta') || fileName.includes('prescription')) return 'prescription';
    if (fileName.includes('laboratorio') || fileName.includes('lab')) return 'lab_result';
    return 'document';
  }
  if (fileName.includes('orden') || fileName.includes('order')) return 'medical_order';
  if (fileName.includes('receta') || fileName.includes('prescription')) return 'prescription';
  if (fileName.includes('laboratorio') || fileName.includes('lab')) return 'lab_result';
  
  return 'document';
}

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const appointmentId = formData.get('appointmentId') as string;
    const category = formData.get('category') as string;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'ID de cita requerido' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    await ensureUploadDir();

    // Generate safe filename
    const safeFilename = generateSafeFilename(file.name, appointmentId);
    const filePath = join(UPLOAD_DIR, safeFilename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create file record (in a real app, this would be saved to database)
    const uploadedFile = {
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: `/uploads/appointments/${safeFilename}`,
      uploadedAt: new Date().toISOString(),
      category: category || determineFileCategory(file),
      appointmentId: appointmentId,
      originalName: file.name,
      filename: safeFilename
    };

    // Log successful upload
    console.log(`File uploaded successfully: ${safeFilename} for appointment ${appointmentId}`);

    return NextResponse.json({
      success: true,
      file: uploadedFile,
      message: 'Archivo subido exitosamente'
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor al subir el archivo',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
} 