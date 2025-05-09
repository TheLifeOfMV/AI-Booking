// Mock implementations for user service functions
jest.mock('@/services/userService', () => ({
  getUsers: jest.fn().mockResolvedValue({
    users: [
      {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1 555-123-4567',
        status: 'active',
        role: 'patient',
        createdAt: '2023-01-01T00:00:00Z',
      }
    ],
    total: 1
  }),
  getUserById: jest.fn().mockResolvedValue({
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1 555-123-4567',
    status: 'active',
    role: 'patient',
    createdAt: '2023-01-01T00:00:00Z',
  }),
  updateUser: jest.fn().mockImplementation((id, userData) => {
    return Promise.resolve({
      id,
      name: userData.name || 'Test User',
      email: userData.email || 'test@example.com',
      phone: userData.phone || '+1 555-123-4567',
      status: userData.status || 'active',
      role: userData.role || 'patient',
      createdAt: '2023-01-01T00:00:00Z',
    });
  }),
  createUser: jest.fn().mockImplementation((userData) => {
    return Promise.resolve({
      id: '100',
      ...userData,
      createdAt: '2023-01-01T00:00:00Z',
    });
  }),
}));

// Global mocks
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}; 