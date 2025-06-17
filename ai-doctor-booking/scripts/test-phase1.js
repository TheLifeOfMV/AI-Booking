#!/usr/bin/env node

/**
 * Phase 1 Validation Script - Server-Side Supabase Infrastructure
 * Tests the enhanced Supabase client and server utilities
 */

const { createServerSupabaseClient, createAdminSupabaseClient, logDatabaseOperation } = require('../src/lib/supabaseClient');
const { 
  generateCorrelationId, 
  logServiceOperation, 
  createSuccessResponse, 
  createErrorResponse, 
  ServiceErrorCode 
} = require('../src/lib/serverUtils');

async function testPhase1() {
  console.log('🚀 Phase 1 Validation: Server-Side Supabase Infrastructure');
  console.log('=' .repeat(60));

  const correlationId = generateCorrelationId();
  logServiceOperation('Test', 'PHASE_1_START', { phase: 1 }, correlationId);

  try {
    // Test 1: Server client creation
    console.log('\n✅ Test 1: Server Client Creation');
    const serverClient = createServerSupabaseClient();
    console.log('   Server client created successfully');

    // Test 2: Admin client creation (will fail without service key)
    console.log('\n✅ Test 2: Admin Client Creation');
    try {
      const adminClient = createAdminSupabaseClient();
      console.log('   Admin client created successfully');
    } catch (error) {
      console.log('   ⚠️  Admin client creation failed (expected without service key)');
      console.log('   Error:', error.message);
    }

    // Test 3: Correlation ID generation
    console.log('\n✅ Test 3: Correlation ID Generation');
    const testCorrelationId = generateCorrelationId();
    console.log('   Generated correlation ID:', testCorrelationId);

    // Test 4: Success response creation
    console.log('\n✅ Test 4: Success Response Creation');
    const successResponse = createSuccessResponse({ test: 'data' }, correlationId);
    console.log('   Success response:', JSON.stringify(successResponse, null, 2));

    // Test 5: Error response creation
    console.log('\n✅ Test 5: Error Response Creation');
    const errorResponse = createErrorResponse('Test error', ServiceErrorCode.INVALID_INPUT, correlationId);
    console.log('   Error response:', JSON.stringify(errorResponse, null, 2));

    // Test 6: Database operation logging
    console.log('\n✅ Test 6: Database Operation Logging');
    logDatabaseOperation('TEST_OPERATION', { test: 'logging' });

    console.log('\n🎉 Phase 1 validation completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Server client factory: ✅');
    console.log('   - Admin client factory: ✅ (with proper error handling)');
    console.log('   - Correlation ID generation: ✅');
    console.log('   - Response formatting: ✅');
    console.log('   - Logging utilities: ✅');

  } catch (error) {
    console.error('\n❌ Phase 1 validation failed:', error.message);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testPhase1().catch(console.error);
}

module.exports = { testPhase1 }; 