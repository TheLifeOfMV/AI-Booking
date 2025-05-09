# Admin Doctors View

This directory contains the components for implementing the Admin Doctors View, which allows administrators to:

1. View a searchable and filterable table of doctors
2. Edit doctor information through a multi-step modal
3. Update credential verification status
4. Toggle doctor approval status (to show/hide in the booking system)

## Components

- **DoctorsTable.tsx** - Main component that displays the doctors table with sorting, filtering, and pagination
- **DoctorFilters.tsx** - Search and filter controls for the doctors table
- **DoctorEditModal.tsx** - Multi-step modal for editing doctor details
- **CredentialStatusBadge.tsx** - Badge component for displaying credential status with appropriate styling
- **ApprovalToggle.tsx** - Toggle switch component for doctor approval status

## Implementation Notes

### Data Flow

1. The main DoctorsTable component fetches data from `/api/admin/doctors` with query parameters for pagination and filtering
2. Filtering is handled through the DoctorFilters component, which emits filter changes to the parent
3. Clicking a row opens the DoctorEditModal for detailed editing
4. ApprovalToggle sends PATCH requests to `/api/admin/doctors/[id]/approval` with optimistic UI updates

### Error Handling

- Network errors are displayed with retry options
- Validation errors are shown inline
- Optimistic updates include rollback on error
- Loading states are shown for all async operations

### Performance Considerations

- The table includes built-in optimizations:
  - Client-side sorting to reduce server load
  - Pagination to limit data transfer
  - Optimistic UI updates to reduce perceived latency
  - Load time metrics for monitoring

## Usage

```tsx
// In a page component
import DoctorsTable from '@/components/admin/Doctors/DoctorsTable';

export default function DoctorsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Doctors</h1>
      <DoctorsTable />
    </div>
  );
}
```

## Testing

Tests are included for each component to verify:
- Rendering with different data states
- User interactions (filtering, sorting, editing)
- Error handling
- Accessibility

Run tests with:
```
npm test -- --testPathPattern=components/admin/Doctors
``` 