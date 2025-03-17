/**
 * Simple API Transformation Test Script
 * 
 * This script tests API endpoints to verify they return camelCase data.
 * It's a standalone script that doesn't require importing from the project's modules.
 */

const axios = require('axios');

// Update this with your actual development server URL
const API_BASE_URL = 'http://localhost:3000';

// Update these with your actual API endpoints
const API_ENDPOINTS = [
  `${API_BASE_URL}/api/volunteers/123`,
  `${API_BASE_URL}/api/shifts`,
  `${API_BASE_URL}/api/groups`
];

/**
 * Test if an object's properties match expected casing style
 */
function testCasing(obj, casing) {
  const invalidProps = [];
  
  for (const prop in obj) {
    if (typeof obj[prop] === 'object' && obj[prop] !== null) {
      continue; // Skip nested objects for direct property test
    }
    
    // Test camelCase (has uppercase letters but doesn't start with one, and no underscores)
    if (casing === 'camel') {
      if (prop.includes('_') || (prop !== prop.toLowerCase() && prop[0] === prop[0].toUpperCase())) {
        invalidProps.push(prop);
      }
    }
    
    // Test snake_case (only lowercase and underscore)
    if (casing === 'snake') {
      if (prop !== prop.toLowerCase() || (prop.includes('_') && !/^[a-z0-9_]+$/.test(prop))) {
        invalidProps.push(prop);
      }
    }
  }
  
  return invalidProps;
}

/**
 * Recursively test object properties and nested objects for casing style
 */
function deepTestCasing(obj, casing, path = '') {
  const invalidProps = {};
  
  for (const prop in obj) {
    const currentPath = path ? `${path}.${prop}` : prop;
    
    // Test current property name
    let isValid = true;
    if (casing === 'camel') {
      // Test camelCase (no underscores, doesn't start with uppercase)
      if (prop.includes('_') || (prop !== prop.toLowerCase() && prop[0] === prop[0].toUpperCase())) {
        isValid = false;
      }
    } else if (casing === 'snake') {
      // Test snake_case (only lowercase and underscore)
      if (prop !== prop.toLowerCase() || (!/^[a-z0-9_]+$/.test(prop) && prop.includes('_'))) {
        isValid = false;
      }
    }
    
    if (!isValid) {
      invalidProps[currentPath] = obj[prop];
    }
    
    // Recursively test nested objects
    if (typeof obj[prop] === 'object' && obj[prop] !== null) {
      if (Array.isArray(obj[prop])) {
        // For arrays, test each item
        obj[prop].forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            const nestedResults = deepTestCasing(
              item, 
              casing, 
              `${currentPath}[${index}]`
            );
            Object.assign(invalidProps, nestedResults);
          }
        });
      } else {
        // For objects, test recursively
        const nestedResults = deepTestCasing(obj[prop], casing, currentPath);
        Object.assign(invalidProps, nestedResults);
      }
    }
  }
  
  return invalidProps;
}

/**
 * Test API endpoints to verify they return camelCase data
 */
async function testApiEndpoints(endpoints) {
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint);
      const data = response.data;
      
      // Test if response data uses camelCase
      const invalidProps = deepTestCasing(data, 'camel');
      
      results[endpoint] = {
        success: Object.keys(invalidProps).length === 0,
        invalidProps: invalidProps,
        sampleData: data
      };
    } catch (error) {
      results[endpoint] = {
        success: false,
        error: error.message || 'Unknown error'
      };
    }
  }
  
  return results;
}

/**
 * Main function to test all endpoints
 */
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

// Run the tests
testAllApiEndpoints(); 