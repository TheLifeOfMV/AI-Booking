import { PropsWithChildren } from 'react';
import ToastProvider from '@/components/ToastProvider';

export default function AdminLoginLayout({ children }: PropsWithChildren) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
} 