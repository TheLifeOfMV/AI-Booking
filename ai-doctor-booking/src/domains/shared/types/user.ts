export type UserStatus = 'active' | 'inactive' | 'pending';
export type UserRole = 'admin' | 'patient' | 'doctor';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: UserStatus;
  role: UserRole;
  createdAt: string;
  avatar?: string;
}

export interface UserFilter {
  search?: string;
  status?: UserStatus;
  role?: UserRole;
}

export interface UserTableColumn {
  key: keyof User | 'actions';
  title: string;
  sortable?: boolean;
  width?: string;
} 