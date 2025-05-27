import { User } from './user';

export type CredentialStatus = 'pending' | 'verified' | 'rejected';
export type SubscriptionStatus = 'active' | 'pending' | 'expired' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export interface DoctorSubscription {
  id: string;
  planType: 'basic' | 'premium' | 'enterprise';
  monthlyFee: number; // in Colombian pesos
  status: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  startDate: string;
  endDate: string;
  lastPaymentDate?: string;
  nextPaymentDate: string;
  failedPaymentAttempts: number;
}

export interface Doctor extends Omit<User, 'role'> {
  specialtyId: string;
  specialtyName: string;
  experience: string;
  rating: number;
  credentials: {
    licenseNumber: string;
    expiryDate: string;
    status: CredentialStatus;
    verifiedAt?: string;
    documentUrls: string[];
  };
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  approvalStatus: boolean;
  availableTimes: {
    dayOfWeek: number;
    slots: {
      start: string;
      end: string;
    }[];
  }[];

  location?: string;
  subscription: DoctorSubscription;
}

export interface DoctorFilter {
  search?: string;
  specialtyId?: string;
  credentialStatus?: CredentialStatus;
  approvalStatus?: boolean;
  subscriptionStatus?: SubscriptionStatus;
  paymentStatus?: PaymentStatus;
}

export interface DoctorTableColumn {
  key: keyof Doctor | 'credentials.status' | 'subscription.monthlyFee' | 'subscription.paymentStatus' | 'actions';
  title: string;
  sortable?: boolean;
  width?: string;
} 