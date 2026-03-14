'use client';

import { ReactNode } from 'react';
import RouteGuard from './RouteGuard';

interface RouteGuardProviderProps {
  children: ReactNode;
}

export default function RouteGuardProvider({ children }: RouteGuardProviderProps) {
  return <RouteGuard>{children}</RouteGuard>;
}