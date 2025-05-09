'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, UserFilter, UserTableColumn, UserStatus } from '@/types/user';
import { getUsers } from '@/services/userService';
import { formatDate, getInitials } from '@/utils/helpers';
import UserEditModal from './UserEditModal';
import UserFilters from './UserFilters';

const columns: UserTableColumn[] = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'email', title: 'Email', sortable: true },
  { key: 'role', title: 'Role', sortable: true },
  { key: 'status', title: 'Status', sortable: true },
  { key: 'createdAt', title: 'Joined', sortable: true },
  { key: 'actions', title: 'Actions', width: '120px' }
];

export default function UsersTable() {
  // State for users and pagination
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  // State for sorting
  const [sortColumn, setSortColumn] = useState<keyof User>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // State for filters
  const [filters, setFilters] = useState<UserFilter>({});
  
  // State for selected user and modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getUsers(filters, page, limit);
      
      // Apply client-side sorting
      const sortedUsers = [...result.users].sort((a, b) => {
        if (sortColumn === 'createdAt') {
          return sortDirection === 'asc' 
            ? new Date(a[sortColumn]).getTime() - new Date(b[sortColumn]).getTime()
            : new Date(b[sortColumn]).getTime() - new Date(a[sortColumn]).getTime();
        }
        
        const aValue = String(a[sortColumn]).toLowerCase();
        const bValue = String(b[sortColumn]).toLowerCase();
        
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
      
      setUsers(sortedUsers);
      setTotal(result.total);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit, sortColumn, sortDirection]);
  
  // Load users when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // Handle sorting
  const handleSort = (column: keyof User) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters: UserFilter) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  };
  
  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  // Open edit modal for a user
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  
  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };
  
  // Update user after edit
  const handleUserUpdate = (updatedUser: User) => {
    setUsers(users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
    setIsModalOpen(false);
    setSelectedUser(null);
  };
  
  // Render status badge
  const renderStatusBadge = (status: UserStatus) => {
    const badgeClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(total / limit);
  const showPagination = totalPages > 1;
  
  return (
    <div>
      {/* Filters component */}
      <div className="mb-4">
        <UserFilters onFilterChange={handleFilterChange} initialFilters={filters} />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-light-grey">
            <thead className="bg-light-grey">
              <tr>
                {columns.map(column => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider ${column.width ? `w-${column.width}` : ''}`}
                  >
                    {column.sortable ? (
                      <button
                        className="flex items-center focus:outline-none"
                        onClick={() => handleSort(column.key as keyof User)}
                      >
                        {column.title}
                        {sortColumn === column.key && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    ) : (
                      column.title
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-light-grey">
              {loading ? (
                // Loading state
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    {columns.map(column => (
                      <td key={`skeleton-${index}-${column.key}`} className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-light-grey rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                // Error state
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center text-medium-grey">
                    <div className="flex flex-col items-center justify-center py-6">
                      <svg className="w-12 h-12 text-medium-grey mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>{error}</p>
                      <button 
                        onClick={() => fetchUsers()}
                        className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center text-medium-grey">
                    <div className="flex flex-col items-center justify-center py-6">
                      <svg className="w-12 h-12 text-medium-grey mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p>No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Data rows
                users.map(user => (
                  <tr key={user.id} className="hover:bg-light-grey/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.name} 
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            getInitials(user.name)
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-dark-grey">{user.name}</div>
                          <div className="text-sm text-medium-grey">{user.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-dark-grey">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-dark-grey capitalize">{user.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-grey">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {showPagination && !loading && !error && users.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-light-grey">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-light-grey text-sm font-medium rounded-md ${
                  page === 1
                    ? 'bg-light-grey text-medium-grey cursor-not-allowed'
                    : 'bg-white text-dark-grey hover:bg-light-grey'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`relative inline-flex items-center px-4 py-2 border border-light-grey text-sm font-medium rounded-md ${
                  page === totalPages
                    ? 'bg-light-grey text-medium-grey cursor-not-allowed'
                    : 'bg-white text-dark-grey hover:bg-light-grey'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-medium-grey">
                  Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(page * limit, total)}
                  </span>{' '}
                  of <span className="font-medium">{total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-light-grey text-sm font-medium ${
                      page === 1
                        ? 'bg-light-grey text-medium-grey cursor-not-allowed'
                        : 'bg-white text-dark-grey hover:bg-light-grey'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNumber = index + 1;
                    const isCurrentPage = pageNumber === page;
                    
                    // Only show a subset of pages if there are many
                    if (
                      totalPages <= 7 ||
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= page - 1 && pageNumber <= page + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border border-light-grey text-sm font-medium ${
                            isCurrentPage
                              ? 'bg-primary text-white'
                              : 'bg-white text-dark-grey hover:bg-light-grey'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    
                    // Show ellipsis for skipped pages
                    if (
                      (pageNumber === 2 && page > 3) ||
                      (pageNumber === totalPages - 1 && page < totalPages - 2)
                    ) {
                      return (
                        <span
                          key={pageNumber}
                          className="relative inline-flex items-center px-4 py-2 border border-light-grey bg-white text-sm font-medium text-dark-grey"
                        >
                          ...
                        </span>
                      );
                    }
                    
                    return null;
                  })}
                  
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-light-grey text-sm font-medium ${
                      page === totalPages
                        ? 'bg-light-grey text-medium-grey cursor-not-allowed'
                        : 'bg-white text-dark-grey hover:bg-light-grey'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* User Edit Modal */}
      {selectedUser && (
        <UserEditModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          user={selectedUser}
          onUserUpdate={handleUserUpdate}
        />
      )}
    </div>
  );
} 