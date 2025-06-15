import React from 'react';
import { Metadata } from 'next';
import FileUploadDemo from '@/components/doctor/FileUploadDemo';

export const metadata: Metadata = {
  title: 'Demo: File Upload | AI Doctor Booking',
  description: 'Demo de funcionalidad de subida de archivos para notas médicas',
};

/**
 * Demo page for testing file upload functionality
 * This page showcases the FileUpload component in action
 */
export default function FileUploadDemoPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E6F0FA' }}>
      <div className="container mx-auto py-8">
        <FileUploadDemo />
      </div>
    </div>
  );
} 