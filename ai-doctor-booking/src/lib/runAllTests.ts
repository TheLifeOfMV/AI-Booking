import { testSupabaseConnection } from './testConnection';
import { validateDatabaseSchema } from './validateSchema';
import { testRLSPolicies } from './testRLS';

export async function runAllDatabaseTests() {
  console.log('🚀 Running comprehensive database tests...\n');
  
  const testResults = {
    connection: false,
    schema: false,
    rls: false,
    overall: false
  };

  try {
    // 1. Test connection
    console.log('='.repeat(50));
    console.log('1. CONNECTION TEST');
    console.log('='.repeat(50));
    testResults.connection = await testSupabaseConnection();
    
    if (!testResults.connection) {
      console.log('❌ Connection failed - stopping tests');
      return testResults;
    }

    // 2. Validate schema
    console.log('\n' + '='.repeat(50));
    console.log('2. SCHEMA VALIDATION');
    console.log('='.repeat(50));
    const schemaResults = await validateDatabaseSchema();
    testResults.schema = Object.values(schemaResults).every(result => result === true);

    // 3. Test RLS policies
    console.log('\n' + '='.repeat(50));
    console.log('3. RLS POLICY TESTING');
    console.log('='.repeat(50));
    const rlsResults = await testRLSPolicies();
    testResults.rls = Object.values(rlsResults).every(result => result === true);

    // 4. Overall results
    testResults.overall = testResults.connection && testResults.schema && testResults.rls;

    console.log('\n' + '='.repeat(50));
    console.log('FINAL TEST RESULTS');
    console.log('='.repeat(50));
    console.log('Connection:', testResults.connection ? '✅ PASS' : '❌ FAIL');
    console.log('Schema:', testResults.schema ? '✅ PASS' : '❌ FAIL');
    console.log('RLS Policies:', testResults.rls ? '✅ PASS' : '❌ FAIL');
    console.log('Overall:', testResults.overall ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');

    if (testResults.overall) {
      console.log('\n🎉 Database implementation is ready for development!');
    } else {
      console.log('\n⚠️ Some issues need to be addressed before proceeding.');
    }

    return testResults;

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    return testResults;
  }
}

// Run all tests if this file is executed directly
if (require.main === module) {
  runAllDatabaseTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test suite crashed:', error);
    process.exit(1);
  });
} 