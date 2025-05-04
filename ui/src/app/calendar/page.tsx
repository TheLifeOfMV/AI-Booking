import { Metadata } from 'next';
import CalendarPageContent from '@/components/CalendarPageContent';

export const metadata: Metadata = {
  title: 'Calendar - Medical Booking Platform',
  description: 'View and manage your medical appointments',
};

export default function CalendarPage() {
  return <CalendarPageContent />;
} 