/**
 * API Transformation Test Script
 * 
 * This script can be run during development to verify that API endpoints
 * are correctly transforming data between snake_case and camelCase.
 * 
 * Run with: ts-node test-api-transformations.ts
 */

// Using CommonJS require syntax instead of ES modules for ts-node compatibility
const { testApiEndpoints, deepTestCasing } = require('../utils/api-test-util');
const { apiGet } = require('../lib/api-client');

// Update this with your actual development server URL
const API_BASE_URL = 'http://localhost:3000';

// Update these with your actual API endpoints
const API_ENDPOINTS = [
  `${API_BASE_URL}/api/volunteers/123`,
  `${API_BASE_URL}/api/shifts`,
  `${API_BASE_URL}/api/groups`
];

async function testAllApiEndpoints() {
  console.log('Testing API Transformations...');
  console.log('----------------------------');
  console.log('');
  
  try {
    const results = await testApiEndpoints(API_ENDPOINTS);
    
    let passCount = 0;
    let failCount = 0;
    
    for (const endpoint in results) {
      const result = results[endpoint];
      
      if (result.success) {
        console.log(`✅ ${endpoint}: PASSED`);
        passCount++;
      } else if (result.error) {
        console.log(`❌ ${endpoint}: ERROR - ${result.error}`);
        failCount++;
      } else {
        console.log(`❌ ${endpoint}: FAILED - Found ${Object.keys(result.invalidProps).length} invalid properties`);
        console.log('Invalid properties:');
        
        // Print the first 5 invalid properties
        const invalidPropKeys = Object.keys(result.invalidProps);
        invalidPropKeys.slice(0, 5).forEach(prop => {
          console.log(`   - ${prop}: ${JSON.stringify(result.invalidProps[prop])}`);
        });
        
        if (invalidPropKeys.length > 5) {
          console.log(`   ... and ${invalidPropKeys.length - 5} more`);
        }
        
        failCount++;
      }
      
      console.log('');
    }
    
    console.log('----------------------------');
    console.log(`Summary: ${passCount} passed, ${failCount} failed`);
    
    if (failCount > 0) {
      console.log('');
      console.log('Troubleshooting tips:');
      console.log('1. Ensure all API routes are using mapSnakeToCamel before returning data');
      console.log('2. For nested data, ensure specialized mappers are being used');
      console.log('3. Check that frontend components are using the camelCase property names');
    }
  } catch (error) {
    console.error('Error testing API endpoints:', error);
  }
}

/**
 * Directly test a single endpoint
 */
async function testSingleEndpoint(endpoint: string) {
  try {
    console.log(`Testing endpoint: ${endpoint}`);
    
    const data = await apiGet(endpoint);
    
    // Check if the data uses camelCase - using type assertion to fix the linter error
    const invalidProps = deepTestCasing(data, 'camel');
    
    if (Object.keys(invalidProps).length === 0) {
      console.log('✅ All properties use camelCase correctly');
    } else {
      console.log(`❌ Found ${Object.keys(invalidProps).length} properties that don't use camelCase:`);
      
      Object.keys(invalidProps).forEach(prop => {
        console.log(`   - ${prop}: ${JSON.stringify(invalidProps[prop])}`);
      });
    }
  } catch (error) {
    console.error('Error testing endpoint:', error);
  }
}

// Check if a specific endpoint was provided as a command-line argument
if (process.argv.length > 2) {
  const endpoint = process.argv[2];
  testSingleEndpoint(endpoint);
} else {
  // Otherwise test all endpoints
  testAllApiEndpoints();
}

/**
 * How to use this script:
 * 
 * 1. Install ts-node if you haven't already:
 *    npm install -g ts-node
 * 
 * 2. Run the script to test all endpoints:
 *    ts-node test-api-transformations.ts
 * 
 * 3. Or test a specific endpoint:
 *    ts-node test-api-transformations.ts http://localhost:3000/api/volunteers/123
 */ 