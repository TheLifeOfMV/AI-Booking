import { supabase } from './supabaseClient';

export async function testRLSPolicies() {
  console.log('🔒 Testing RLS policies...');
  
  const results = {
    publicSpecialtiesAccess: false,
    publicDoctorsAccess: false,
    unauthenticatedBookingsBlocked: false,
    unauthenticatedProfilesBlocked: false
  };

  try {
    // 1. Test public access to specialties (should work)
    console.log('🌐 Testing public specialties access...');
    const { data: specialties, error: specialtiesError } = await supabase
      .from('specialties')
      .select('id, name')
      .limit(5);

    if (!specialtiesError && specialties && specialties.length > 0) {
      console.log('✅ Public can access specialties');
      results.publicSpecialtiesAccess = true;
    } else {
      console.log('❌ Public specialties access failed:', specialtiesError);
    }

    // 2. Test public access to approved doctors (should work)
    console.log('👨‍⚕️ Testing public approved doctors access...');
    const { data: doctors, error: doctorsError } = await supabase
      .from('doctors')
      .select('user_id, approval_status')
      .eq('approval_status', true)
      .limit(5);

    if (!doctorsError) {
      console.log('✅ Public can access approved doctors');
      results.publicDoctorsAccess = true;
    } else {
      console.log('❌ Public doctors access failed:', doctorsError);
    }

    // 3. Test unauthenticated access to bookings (should be blocked)
    console.log('📅 Testing unauthenticated bookings access...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .limit(1);

    if (bookingsError && bookingsError.code === 'PGRST301') {
      console.log('✅ Unauthenticated bookings access properly blocked');
      results.unauthenticatedBookingsBlocked = true;
    } else {
      console.log('❌ Bookings should be blocked for unauthenticated users');
    }

    // 4. Test unauthenticated access to profiles (should be blocked)
    console.log('👤 Testing unauthenticated profiles access...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id')
      .limit(1);

    if (profilesError && profilesError.code === 'PGRST301') {
      console.log('✅ Unauthenticated profiles access properly blocked');
      results.unauthenticatedProfilesBlocked = true;
    } else {
      console.log('❌ Profiles should be blocked for unauthenticated users');
    }

    console.log('\n🔒 RLS Testing Results:');
    console.log('Public Specialties:', results.publicSpecialtiesAccess ? '✅' : '❌');
    console.log('Public Doctors:', results.publicDoctorsAccess ? '✅' : '❌');
    console.log('Bookings Blocked:', results.unauthenticatedBookingsBlocked ? '✅' : '❌');
    console.log('Profiles Blocked:', results.unauthenticatedProfilesBlocked ? '✅' : '❌');

    return results;

  } catch (error) {
    console.error('❌ RLS testing failed:', error);
    return results;
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testRLSPolicies();
} 