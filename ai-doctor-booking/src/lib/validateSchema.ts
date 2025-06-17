import { supabase } from './supabaseClient';

export async function validateDatabaseSchema() {
  console.log('🔍 Validating database schema...');
  
  const results = {
    tables: false,
    relationships: false,
    enums: false,
    indexes: false,
    rls: false
  };

  try {
    // 1. Verify all tables exist
    console.log('📋 Checking tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['profiles', 'specialties', 'doctors', 'doctor_schedules', 'bookings']);

    if (tablesError) throw tablesError;
    
    const expectedTables = ['profiles', 'specialties', 'doctors', 'doctor_schedules', 'bookings'];
    const foundTables = tables?.map(t => t.table_name) || [];
    const missingTables = expectedTables.filter(t => !foundTables.includes(t));
    
    if (missingTables.length === 0) {
      console.log('✅ All tables exist');
      results.tables = true;
    } else {
      console.log('❌ Missing tables:', missingTables);
    }

    // 2. Verify enums exist
    console.log('🏷️ Checking enums...');
    const { data: enums, error: enumsError } = await supabase
      .from('pg_type')
      .select('typname')
      .eq('typtype', 'e')
      .in('typname', ['user_role_enum', 'booking_status_enum', 'booking_channel_enum']);

    if (!enumsError && enums && enums.length === 3) {
      console.log('✅ All enums exist');
      results.enums = true;
    } else {
      console.log('❌ Missing enums');
    }

    // 3. Test basic queries
    console.log('🔍 Testing basic queries...');
    const { data: specialtiesData, error: specialtiesError } = await supabase
      .from('specialties')
      .select('count')
      .single();

    if (!specialtiesError) {
      console.log('✅ Basic queries working');
      results.relationships = true;
    }

    // 4. Check RLS is enabled
    console.log('🔒 Checking RLS...');
    const { data: rlsData, error: rlsError } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public')
      .in('tablename', expectedTables);

    if (!rlsError && rlsData) {
      const rlsEnabled = rlsData.every(table => table.rowsecurity);
      if (rlsEnabled) {
        console.log('✅ RLS enabled on all tables');
        results.rls = true;
      } else {
        console.log('❌ RLS not enabled on all tables');
      }
    }

    console.log('\n📊 Schema Validation Results:');
    console.log('Tables:', results.tables ? '✅' : '❌');
    console.log('Enums:', results.enums ? '✅' : '❌');
    console.log('Queries:', results.relationships ? '✅' : '❌');
    console.log('RLS:', results.rls ? '✅' : '❌');

    return results;

  } catch (error) {
    console.error('❌ Schema validation failed:', error);
    return results;
  }
}

// Run validation if this file is executed directly
if (require.main === module) {
  validateDatabaseSchema();
} 