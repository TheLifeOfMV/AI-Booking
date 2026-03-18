import { User, UserFilter } from '@/domains/shared/types/user';

export const getUsers = async (
  filters?: UserFilter,
  page: number = 1,
  limit: number = 10
): Promise<{ users: User[]; total: number }> => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (filters?.search) params.set('search', filters.search);
  if (filters?.role) params.set('role', filters.role);

  const res = await fetch(`/api/admin/users?${params}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch users');

  const rawUsers = json.data?.users || [];
  const users: User[] = rawUsers.map((u: any) => ({
    id: u.user_id,
    name: u.full_name,
    email: '',
    phone: u.phone_number || '',
    status: 'active' as const,
    role: u.role || 'patient',
    createdAt: u.created_at,
    avatar: u.avatar_url || undefined,
  }));

  if (filters?.status) {
    return {
      users: users.filter(u => u.status === filters.status),
      total: json.data?.total || 0,
    };
  }

  return { users, total: json.data?.total || 0 };
};

export const getUserById = async (userId: string): Promise<User | null> => {
  const res = await fetch(`/api/admin/users/${userId}`);
  const json = await res.json();
  if (!json.success || !json.data) return null;

  const u = json.data;
  return {
    id: u.user_id,
    name: u.full_name,
    email: '',
    phone: u.phone_number || '',
    status: 'active',
    role: u.role || 'patient',
    createdAt: u.created_at,
    avatar: u.avatar_url || undefined,
  };
};

export const updateUser = async (userId: string, data: Partial<User>): Promise<User> => {
  const body: any = {};
  if (data.name) body.full_name = data.name;
  if (data.phone) body.phone_number = data.phone;
  if (data.role) body.role = data.role;

  const res = await fetch(`/api/admin/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to update user');

  const u = json.data;
  return {
    id: u.user_id,
    name: u.full_name,
    email: '',
    phone: u.phone_number || '',
    status: 'active',
    role: u.role || 'patient',
    createdAt: u.created_at,
    avatar: u.avatar_url || undefined,
  };
};
