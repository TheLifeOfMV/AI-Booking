'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, UserFilter, UserTableColumn, UserStatus } from '@/types/user';
import { getUsers } from '@/services/userService';
import { formatDate, getInitials } from '@/utils/helpers';
import UserEditModal from './UserEditModal';
import { userFiltersState } from './UserFilters';

const columns: UserTableColumn[] = [
  { key: 'name', title: 'Nombre', sortable: true },
  { key: 'email', title: 'Email', sortable: true },
  { key: 'role', title: 'Rol', sortable: true },
  { key: 'status', title: 'Estado', sortable: true },
  { key: 'createdAt', title: 'Registrado', sortable: true },
  { key: 'actions', title: 'Acciones', width: '120px' }
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
  const [filters, setFilters] = useState<UserFilter>(userFiltersState.filters);
  
  // State for selected user and modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Subscribe to filter changes from the global state
  useEffect(() => {
    const unsubscribe = userFiltersState.subscribe(newFilters => {
      setFilters(newFilters);
      setPage(1); // Reset to first page on filter change
    });
    
    return unsubscribe;
  }, []);
  
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
      setError('Error al cargar usuarios. Por favor, inténtalo de nuevo.');
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
    const statusLabels = {
      active: 'Activo',
      inactive: 'Inactivo',
      pending: 'Pendiente'
    };
    
    const badgeClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClasses[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(total / limit);
  const showPagination = totalPages > 1;
  
  return (
    <div>
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
                        Intentar de nuevo
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      <p>No se encontraron usuarios</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Data rows
                users.map(user => (
                  <tr key={user.id} className="hover:bg-light-grey/30 transition-colors">
                    {/* Name column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                          {getInitials(user.name)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-dark-grey">{user.name}</div>
                          <div className="text-sm text-medium-grey">{user.phone}</div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Email column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-dark-grey">{user.email}</div>
                    </td>
                    
                    {/* Role column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-dark-grey">
                        {user.role === 'admin' ? 'Administrador' : 
                         user.role === 'doctor' ? 'Doctor' : 
                         user.role === 'patient' ? 'Paciente' : user.role}
                      </div>
                    </td>
                    
                    {/* Status column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(user.status)}
                    </td>
                    
                    {/* Joined column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-grey">
                      {formatDate(user.createdAt)}
                    </td>
                    
                    {/* Actions column */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-primary hover:text-primary/80"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {showPagination && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-light-grey">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-light-grey text-sm font-medium rounded-md ${
                  page === 1 ? 'text-medium-grey bg-gray-50 cursor-not-allowed' : 'text-primary hover:bg-light-grey'
                }`}
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`relative inline-flex items-center px-4 py-2 border border-light-grey text-sm font-medium rounded-md ${
                  page === totalPages ? 'text-medium-grey bg-gray-50 cursor-not-allowed' : 'text-primary hover:bg-light-grey'
                }`}
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-medium-grey">
                  Mostrando <span className="font-medium">{(page - 1) * limit + 1}</span> a <span className="font-medium">{Math.min(page * limit, total)}</span> de <span className="font-medium">{total}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-light-grey bg-white text-sm font-medium ${
                      page === 1 ? 'text-medium-grey cursor-not-allowed' : 'text-primary hover:bg-light-grey'
                    }`}
                  >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border border-light-grey text-sm font-medium ${
                        page === i + 1
                          ? 'z-10 bg-primary/10 border-primary text-primary'
                          : 'bg-white text-medium-grey hover:bg-light-grey'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-light-grey bg-white text-sm font-medium ${
                      page === totalPages ? 'text-medium-grey cursor-not-allowed' : 'text-primary hover:bg-light-grey'
                    }`}
                  >
                    <span className="sr-only">Siguiente</span>
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
      
      {/* Edit Modal */}
      {isModalOpen && selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={handleCloseModal}
          onSave={handleUserUpdate}
        />
      )}
    </div>
  );
} 