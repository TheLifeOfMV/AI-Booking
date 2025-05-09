# User Management Components

This directory contains components for the Admin User Management interface, as specified in Step 13 of the Architecture.txt interface steps.

## Components Overview

### UsersTable

The main component that displays a table of users with the following features:
- Sortable columns
- Pagination
- Status badges
- Search and filtering
- Error states and loading states
- Integration with the UserEditModal

**Props**: None - it's a self-contained component that manages its own state and data fetching.

**Example Usage**:
```jsx
<UsersTable />
```

### UserFilters

A component that provides filtering options for the UsersTable.

**Props**:
- `onFilterChange: (filters: UserFilter) => void` - Callback when filters change
- `initialFilters?: UserFilter` - Optional initial filter values

**Example Usage**:
```jsx
<UserFilters 
  onFilterChange={(filters) => console.log('Filters changed:', filters)} 
  initialFilters={{ status: 'active' }} 
/>
```

### UserEditModal

A modal dialog for editing user details.

**Props**:
- `isOpen: boolean` - Whether the modal is visible
- `onClose: () => void` - Callback when the modal is closed
- `user: User` - The user object to edit
- `onUserUpdate: (user: User) => void` - Callback when a user is updated

**Example Usage**:
```jsx
<UserEditModal
  isOpen={true}
  onClose={() => setIsModalOpen(false)}
  user={selectedUser}
  onUserUpdate={(updatedUser) => handleUserUpdate(updatedUser)}
/>
```

## API Usage

The components interact with the following API endpoints:

### User Service API

- `GET /api/users` - Get users with optional filtering and pagination
- `GET /api/users/:id` - Get a specific user by ID
- `PUT /api/users/:id` - Update a user
- `POST /api/users` - Create a new user

These are mocked in the current implementation but should be replaced with actual API calls when integrated with the backend.

## Error Handling

- The components handle network errors with appropriate error messages and retry options
- Client-side validation is implemented for the edit form
- Optimistic updates are used to provide better UX

## Performance Considerations

- Debounced search to prevent too many API requests
- Dynamic imports for better code splitting
- Skeleton loading states for better perceived performance
- Pagination to limit data transfer 