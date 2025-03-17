/**
 * Mock API Transformation Test Script
 * 
 * This script demonstrates the API testing utility with mock responses.
 */

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

// Mock API responses
const mockResponses = {
  // A correctly formatted response with camelCase
  '/api/volunteers/123': {
    id: 123,
    firstName: 'John',
    lastName: 'Doe',
    emailAddress: 'john@example.com',
    profileData: {
      address: '123 Main St',
      zipCode: '12345'
    },
    recentActivity: [
      {
        id: 1,
        type: 'CHECK_IN',
        date: '2023-01-01'
      }
    ]
  },
  
  // A response with some snake_case properties (invalid)
  '/api/shifts': {
    shifts: [
      {
        id: 1,
        title: 'Morning Shift',
        start_time: '09:00', // Invalid: should be startTime
        end_time: '12:00',   // Invalid: should be endTime
        volunteers: [
          {
            id: 123,
            firstName: 'John',
            lastName: 'Doe'
          }
        ]
      }
    ],
    total_count: 5  // Invalid: should be totalCount
  },
  
  // A response with nested snake_case properties
  '/api/groups': {
    id: 1,
    name: 'Volunteers',
    members: [
      {
        id: 123,
        firstName: 'John',
        lastName: 'Doe',
        user_role: {   // Invalid: should be userRole
          role_id: 1,  // Invalid: should be roleId
          name: 'Admin'
        }
      }
    ]
  }
};

// Test function
function testMockEndpoints() {
  console.log('Testing API Transformations (Mock)...');
  console.log('----------------------------');
  console.log('');
  
  const results = {};
  
  // Test each mock endpoint
  for (const endpoint in mockResponses) {
    const data = mockResponses[endpoint];
    
    // Test if response data uses camelCase
    const invalidProps = deepTestCasing(data, 'camel');
    
    results[endpoint] = {
      success: Object.keys(invalidProps).length === 0,
      invalidProps: invalidProps
    };
    
    // Print results
    if (results[endpoint].success) {
      console.log(`✅ ${endpoint}: PASSED`);
    } else {
      console.log(`❌ ${endpoint}: FAILED - Found ${Object.keys(invalidProps).length} invalid properties`);
      console.log('Invalid properties:');
      
      Object.keys(invalidProps).forEach(prop => {
        console.log(`   - ${prop}: ${JSON.stringify(invalidProps[prop])}`);
      });
    }
    
    console.log('');
  }
  
  // Summary
  const passCount = Object.values(results).filter(r => r.success).length;
  const failCount = Object.values(results).filter(r => !r.success).length;
  
  console.log('----------------------------');
  console.log(`Summary: ${passCount} passed, ${failCount} failed`);
}

// Run the tests
testMockEndpoints(); 