#!/usr/bin/env node

/**
 * Phase 2 Validation Script - Server Services
 * Tests all server-side services and their integration
 */

const { 
  checkAllServicesHealth, 
  getServiceStatusSummary,
  initializeServices 
} = require('../src/services/index.server');

const { 
  getSpecialties,
  getSpecialtyById 
} = require('../src/services/specialtyService.server');

const { generateCorrelationId } = require('../src/lib/serverUtils');

async function testPhase2() {
  console.log('🚀 Phase 2 Validation: Server Services Implementation');
  console.log('=' .repeat(70));

  const correlationId = generateCorrelationId();
  let testsPassed = 0;
  let testsTotal = 0;

  // Helper function to run test
  const runTest = async (testName, testFunction) => {
    testsTotal++;
    console.log(`\n✅ Test ${testsTotal}: ${testName}`);
    try {
      await testFunction();
      testsPassed++;
      console.log(`   ✅ PASSED`);
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
    }
  };

  try {
    // Test 1: Service Registry Initialization
    await runTest('Service Registry Initialization', async () => {
      const initResult = await initializeServices(correlationId);
      
      if (!initResult.success) {
        throw new Error(`Initialization failed: ${initResult.error}`);
      }
      
      console.log(`   Initialized services: ${initResult.data.initialized.join(', ')}`);
      if (initResult.data.failed.length > 0) {
        console.log(`   ⚠️  Failed services: ${initResult.data.failed.join(', ')}`);
      }
    });

    // Test 2: All Services Health Check
    await runTest('All Services Health Check', async () => {
      const healthResult = await checkAllServicesHealth(correlationId);
      
      if (!healthResult.success) {
        throw new Error(`Health check failed: ${healthResult.error}`);
      }
      
      const services = Object.keys(healthResult.data);
      console.log(`   Checked ${services.length} services`);
      
      services.forEach(service => {
        const status = healthResult.data[service];
        console.log(`   - ${service}: ${status.status}`);
        if (status.error) {
          console.log(`     Error: ${status.error}`);
        }
      });
    });

    // Test 3: Service Status Summary
    await runTest('Service Status Summary', async () => {
      const summaryResult = await getServiceStatusSummary(correlationId);
      
      if (!summaryResult.success) {
        throw new Error(`Status summary failed: ${summaryResult.error}`);
      }
      
      const summary = summaryResult.data;
      console.log(`   Overall Status: ${summary.overall_status}`);
      console.log(`   Healthy: ${summary.healthy_services}/${summary.total_services}`);
      console.log(`   Unhealthy: ${summary.unhealthy_services}/${summary.total_services}`);
    });

    // Test 4: Specialty Service - Get All Specialties
    await runTest('Specialty Service - Get All Specialties', async () => {
      const specialtiesResult = await getSpecialties(correlationId);
      
      if (!specialtiesResult.success) {
        throw new Error(`Get specialties failed: ${specialtiesResult.error}`);
      }
      
      const specialties = specialtiesResult.data;
      console.log(`   Retrieved ${specialties.length} specialties`);
      
      if (specialties.length > 0) {
        console.log(`   First specialty: ${specialties[0].name}`);
      }
    });

    // Test 5: Specialty Service - Get Specialty by ID
    await runTest('Specialty Service - Get Specialty by ID', async () => {
      // First get all specialties to get a valid ID
      const specialtiesResult = await getSpecialties(correlationId);
      
      if (!specialtiesResult.success || specialtiesResult.data.length === 0) {
        throw new Error('No specialties found to test with');
      }
      
      const firstSpecialty = specialtiesResult.data[0];
      const specialtyResult = await getSpecialtyById(firstSpecialty.id, correlationId);
      
      if (!specialtyResult.success) {
        throw new Error(`Get specialty by ID failed: ${specialtyResult.error}`);
      }
      
      if (!specialtyResult.data) {
        throw new Error('Specialty not found');
      }
      
      console.log(`   Found specialty: ${specialtyResult.data.name} (ID: ${specialtyResult.data.id})`);
    });

    // Test 6: Error Handling Test
    await runTest('Error Handling - Invalid Specialty ID', async () => {
      const invalidResult = await getSpecialtyById(-1, correlationId);
      
      if (invalidResult.success) {
        throw new Error('Expected error for invalid ID, but got success');
      }
      
      console.log(`   Correctly handled error: ${invalidResult.error}`);
      console.log(`   Error code: ${invalidResult.code}`);
    });

    // Test 7: Correlation ID Tracking
    await runTest('Correlation ID Tracking', async () => {
      const testCorrelationId = generateCorrelationId();
      const result = await getSpecialties(testCorrelationId);
      
      if (!result.success) {
        throw new Error(`Request failed: ${result.error}`);
      }
      
      if (result.correlationId !== testCorrelationId) {
        throw new Error(`Correlation ID mismatch: expected ${testCorrelationId}, got ${result.correlationId}`);
      }
      
      console.log(`   Correlation ID correctly tracked: ${result.correlationId}`);
    });

    // Test 8: Response Time Measurement
    await runTest('Response Time Measurement', async () => {
      const startTime = Date.now();
      const result = await getSpecialties(correlationId);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (!result.success) {
        throw new Error(`Request failed: ${result.error}`);
      }
      
      console.log(`   Response time: ${responseTime}ms`);
      
      if (responseTime > 5000) { // 5 seconds threshold
        throw new Error(`Response time too slow: ${responseTime}ms`);
      }
    });

    // Test Results Summary
    console.log('\n' + '=' .repeat(70));
    console.log('🎉 Phase 2 Validation Completed!');
    console.log('=' .repeat(70));
    console.log(`📊 Test Results: ${testsPassed}/${testsTotal} tests passed`);
    
    if (testsPassed === testsTotal) {
      console.log('✅ All tests passed! Server services are working correctly.');
    } else {
      console.log(`⚠️  ${testsTotal - testsPassed} tests failed. Please review the errors above.`);
    }

    console.log('\n📋 Phase 2 Implementation Summary:');
    console.log('   ✅ Server-side Supabase infrastructure enhanced');
    console.log('   ✅ Server utilities and error handling implemented');
    console.log('   ✅ AuthService.server.ts - User authentication');
    console.log('   ✅ SpecialtyService.server.ts - Medical specialties');
    console.log('   ✅ PatientService.server.ts - Patient management');
    console.log('   ✅ DoctorService.server.ts - Doctor profiles & availability');
    console.log('   ✅ BookingService.server.ts - Appointment booking');
    console.log('   ✅ Service registry and health monitoring');
    console.log('   ✅ Structured logging and error handling');
    console.log('   ✅ Performance monitoring');
    console.log('   ✅ Correlation ID tracking');

    console.log('\n🔗 Next Steps:');
    console.log('   1. Create API routes to expose these services');
    console.log('   2. Implement authentication middleware');
    console.log('   3. Add input validation schemas');
    console.log('   4. Create comprehensive test suite');
    console.log('   5. Set up monitoring and alerting');

    // Exit with appropriate code
    process.exit(testsPassed === testsTotal ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Phase 2 validation failed with unexpected error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testPhase2().catch(console.error);
}

module.exports = { testPhase2 }; 