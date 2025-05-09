import { NextResponse } from 'next/server';

// Handler for GET requests to /api/admin/metrics
export async function GET(request: Request) {
  try {
    // Get the date range from query parameters
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);

    // In a real app, this data would come from a database
    // and would be filtered based on the date range specified
    
    // Generate dates for the requested period
    const dates = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1) + i);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    });
    
    // Generate mock booking data
    const bookingsByDay = dates.map(date => ({
      date,
      // Generate a random number between 3 and 20 for bookings count
      count: Math.floor(Math.random() * 18) + 3
    }));
    
    // Calculate total slots and booked slots for utilization
    const totalSlots = days * 80; // 80 slots per day (example)
    const bookedSlots = bookingsByDay.reduce((sum, day) => sum + day.count, 0);
    
    return NextResponse.json({
      bookingsByDay,
      utilization: {
        bookedSlots,
        totalSlots
      }
    });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch admin metrics' },
      { status: 500 }
    );
  }
}

// Using Response to demonstrate role-based authorization
export async function OPTIONS(request: Request) {
  // A real implementation would:
  // 1. Check the authentication token from cookies/headers
  // 2. Verify the user has admin privileges
  // 3. Return appropriate response
  
  return new Response(null, {
    headers: {
      'Allow': 'GET, OPTIONS',
    }
  });
} 