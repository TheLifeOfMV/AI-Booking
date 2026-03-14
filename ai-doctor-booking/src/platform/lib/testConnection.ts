import { supabase } from './supabaseClient';

export async function testSupabaseConnection() {
  try {
    console.log('🔄 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('_supabase_migrations').select('*').limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "table not found" which is expected
      console.error('❌ Connection failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testSupabaseConnection();
} 