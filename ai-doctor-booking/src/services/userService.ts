import { User, UserFilter } from '@/types/user';

// Mock data for users
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 555-123-4567',
    status: 'active',
    role: 'patient',
    createdAt: new Date('2023-05-12').toISOString(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 555-987-6543',
    status: 'active',
    role: 'patient',
    createdAt: new Date('2023-06-24').toISOString(),
  },
  {
    id: '3',
    name: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    phone: '+1 555-456-7890',
    status: 'inactive',
    role: 'patient',
    createdAt: new Date('2023-04-18').toISOString(),
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '+1 555-789-0123',
    status: 'active',
    role: 'patient',
    createdAt: new Date('2023-07-30').toISOString(),
  },
  {
    id: '5',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    phone: '+1 555-234-5678',
    status: 'pending',
    role: 'patient',
    createdAt: new Date('2023-08-15').toISOString(),
  },
  {
    id: '6',
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+1 555-789-0123',
    status: 'active',
    role: 'admin',
    createdAt: new Date('2023-03-10').toISOString(),
  },
];

/**
 * Fetch users with optional filtering and pagination
 */
export const getUsers = async (
  filters?: UserFilter,
  page: number = 1,
  limit: number = 10
): Promise<{ users: User[]; total: number }> => {
  try {
    // This will be replaced with actual API call in production
    // const response = await fetch(`/api/users?page=${page}&limit=${limit}`, { ... });
    
    // For now, we'll use mock data with simulated filtering
    let filteredUsers = [...MOCK_USERS];
    
    // Apply filters if provided
    if (filters) {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(
          user => 
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters.status) {
        filteredUsers = filteredUsers.filter(user => user.status === filters.status);
      }
      
      if (filters.role) {
        filteredUsers = filteredUsers.filter(user => user.role === filters.role);
      }
    }
    
    // Calculate pagination
    const total = filteredUsers.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedUsers = filteredUsers.slice(start, end);
    
    // Simulate network delay for realistic testing
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      users: paginatedUsers,
      total
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users. Please try again later.');
  }
};

/**
 * Get a single user by ID
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    // This will be replaced with actual API call in production
    // const response = await fetch(`/api/users/${userId}`, { ... });
    
    // For now, we'll use mock data
    const user = MOCK_USERS.find(u => u.id === userId) || null;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return user;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw new Error('Failed to fetch user details. Please try again later.');
  }
};

/**
 * Update a user
 */
export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
  try {
    // This will be replaced with actual API call in production
    // const response = await fetch(`/api/users/${userId}`, { 
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(userData)
    // });
    
    // For now, we'll update mock data
    const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Update user data
    const updatedUser = {
      ...MOCK_USERS[userIndex],
      ...userData,
    };
    
    MOCK_USERS[userIndex] = updatedUser;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return updatedUser;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw new Error('Failed to update user. Please try again later.');
  }
};

/**
 * Create a new user
 */
export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
  try {
    // This will be replaced with actual API call in production
    // const response = await fetch('/api/users', { 
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(userData)
    // });
    
    // For now, we'll add to mock data
    const newUser: User = {
      id: `${MOCK_USERS.length + 1}`,
      createdAt: new Date().toISOString(),
      ...userData,
    };
    
    MOCK_USERS.push(newUser);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user. Please try again later.');
  }
}; 