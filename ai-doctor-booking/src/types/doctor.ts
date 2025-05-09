import { User } from './user';

export type CredentialStatus = 'pending' | 'verified' | 'rejected';

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
  isVirtual: boolean;
  location?: string;
  consultationFee: number;
}

export interface DoctorFilter {
  search?: string;
  specialtyId?: string;
  credentialStatus?: CredentialStatus;
  approvalStatus?: boolean;
}

export interface DoctorTableColumn {
  key: keyof Doctor | 'credentials.status' | 'actions';
  title: string;
  sortable?: boolean;
  width?: string;
} 