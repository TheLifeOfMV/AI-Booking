import { PropsWithChildren } from 'react';
import ToastProvider from '@/domains/shared/components/ToastProvider';

export default function AdminLoginLayout({ children }: PropsWithChildren) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
} 