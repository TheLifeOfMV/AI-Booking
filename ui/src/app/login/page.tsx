import { Metadata } from 'next';
import LoginContent from '@/components/LoginContent';

export const metadata: Metadata = {
  title: 'Sign In - Medical Booking Platform',
  description: 'Sign in to access your account',
};

export default function Login() {
  return <LoginContent />;
} 