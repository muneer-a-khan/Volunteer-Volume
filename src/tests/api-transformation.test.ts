/**
 * API Transformation Tests
 * 
 * This test suite validates that API endpoints correctly transform data
 * between snake_case (database) and camelCase (frontend).
 */

// Add Jest imports to fix linter errors
import '@jest/globals';
import { describe, test, expect, jest } from '@jest/globals';

import { testCasing, deepTestCasing, testApiEndpoints } from '../utils/api-test-util';
// Fix the API client import to use the correct export
import { apiGet } from '../lib/api-client';
import { mapSnakeToCamel, mapCamelToSnake } from '../lib/map-utils';

// Mock API data for testing
const mockSnakeCaseData = {
  user_id: 123,
  first_name: 'John',
  last_name: 'Doe',
  email_address: 'john.doe@example.com',
  phone_number: '123-456-7890',
  created_at: '2023-01-01T00:00:00Z',
  is_active: true,
  user_roles: [
    {
      role_id: 1,
      role_name: 'admin',
      assigned_at: '2023-01-01T00:00:00Z'
    },
    {
      role_id: 2,
      role_name: 'volunteer',
      assigned_at: '2023-01-01T00:00:00Z'
    }
  ],
  recent_activities: [
    {
      activity_id: 1,
      activity_type: 'CHECK_IN',
      check_in_time: '2023-01-02T09:00:00Z',
      check_out_time: '2023-01-02T17:00:00Z',
      total_hours: 8
    },
    {
      activity_id: 2,
      activity_type: 'LOG',
      log_date: '2023-01-03',
      hours_logged: 4,
      task_description: 'Helped with event setup'
    }
  ]
};

// Define interfaces for our test data
interface ActivityItem {
  id: number;
  type: string;
  date: string;
  hours: number;
  details: string;
}

interface VolunteerResponse {
  id: number;
  firstName: string;
  lastName: string;
  emailAddress: string;
  isActive: boolean;
  recentActivity: ActivityItem[];
}

// Manual test for mapSnakeToCamel
describe('Data Mapping Utility Tests', () => {
  test('mapSnakeToCamel correctly transforms snake_case to camelCase', () => {
    const camelCaseData = mapSnakeToCamel(mockSnakeCaseData);
    
    // Verify top-level properties were transformed
    expect(camelCaseData).toHaveProperty('userId');
    expect(camelCaseData).toHaveProperty('firstName');
    expect(camelCaseData).toHaveProperty('lastName');
    expect(camelCaseData).toHaveProperty('emailAddress');
    expect(camelCaseData).not.toHaveProperty('user_id');
    expect(camelCaseData).not.toHaveProperty('first_name');
    
    // Verify nested objects were transformed
    expect(camelCaseData.userRoles[0]).toHaveProperty('roleId');
    expect(camelCaseData.userRoles[0]).toHaveProperty('roleName');
    expect(camelCaseData.userRoles[0]).not.toHaveProperty('role_id');
    expect(camelCaseData.userRoles[0]).not.toHaveProperty('role_name');
    
    // Verify arrays were transformed
    expect(camelCaseData.recentActivities[0]).toHaveProperty('activityId');
    expect(camelCaseData.recentActivities[0]).toHaveProperty('activityType');
    expect(camelCaseData.recentActivities[0]).toHaveProperty('checkInTime');
    expect(camelCaseData.recentActivities[0]).not.toHaveProperty('activity_id');
    expect(camelCaseData.recentActivities[0]).not.toHaveProperty('check_in_time');
    
    // Test using the casing utility
    const invalidProps = deepTestCasing(camelCaseData, 'camel');
    expect(Object.keys(invalidProps).length).toBe(0);
  });
  
  test('mapCamelToSnake correctly transforms camelCase to snake_case', () => {
    // Start with camelCase data
    const camelCaseData = {
      userId: 123,
      firstName: 'John',
      lastName: 'Doe',
      emailAddress: 'john.doe@example.com',
      isActive: true,
      userRoles: [
        {
          roleId: 1,
          roleName: 'admin'
        }
      ]
    };
    
    const snakeCaseData = mapCamelToSnake(camelCaseData);
    
    // Verify top-level properties were transformed
    expect(snakeCaseData).toHaveProperty('user_id');
    expect(snakeCaseData).toHaveProperty('first_name');
    expect(snakeCaseData).toHaveProperty('last_name');
    expect(snakeCaseData).toHaveProperty('email_address');
    expect(snakeCaseData).not.toHaveProperty('userId');
    expect(snakeCaseData).not.toHaveProperty('firstName');
    
    // Verify nested objects were transformed
    expect(snakeCaseData.user_roles[0]).toHaveProperty('role_id');
    expect(snakeCaseData.user_roles[0]).toHaveProperty('role_name');
    expect(snakeCaseData.user_roles[0]).not.toHaveProperty('roleId');
    expect(snakeCaseData.user_roles[0]).not.toHaveProperty('roleName');
    
    // Test using the casing utility
    const invalidProps = deepTestCasing(snakeCaseData, 'snake');
    expect(Object.keys(invalidProps).length).toBe(0);
  });
});

// Test for specialized mappers
describe('Specialized Mapper Tests', () => {
  test('mapVolunteerActivity transforms volunteer activity data correctly', async () => {
    // This would be imported from the data-mappers.ts
    // But we're mocking it here for the test
    const { mapVolunteerActivity } = require('../lib/data-mappers');
    
    // Create test data as arrays (not objects with check_ins and logs properties)
    const checkInActivities = [
      {
        check_in_id: 1,
        volunteer_id: 123,
        check_in_time: '2023-01-02T09:00:00Z',
        check_out_time: '2023-01-02T17:00:00Z',
        shift_id: 5,
        shift_name: 'Morning Shift'
      }
    ];
    
    const logActivities = [
      {
        log_id: 2,
        volunteer_id: 123,
        log_date: '2023-01-03',
        hours: 4,
        description: 'Helped with event setup'
      }
    ];
    
    const mappedActivities = mapVolunteerActivity(checkInActivities, logActivities);
    
    // Check that the returned array has the right structure
    expect(Array.isArray(mappedActivities)).toBe(true);
    expect(mappedActivities.length).toBe(2);
    
    // Check that each activity has the expected camelCase properties
    const checkIn = mappedActivities.find((a: any) => a.type === 'CHECK_IN');
    const log = mappedActivities.find((a: any) => a.type === 'LOG');
    
    expect(checkIn).toHaveProperty('id'); // May be undefined in the mock
    expect(checkIn).toHaveProperty('date');
    expect(checkIn).toHaveProperty('details');
    expect(checkIn).toHaveProperty('type');
    expect(checkIn).not.toHaveProperty('check_in_id');
    expect(checkIn).not.toHaveProperty('check_in_time');
    
    expect(log).toHaveProperty('id'); // May be undefined in the mock
    expect(log).toHaveProperty('date');
    expect(log).toHaveProperty('details');
    expect(log).toHaveProperty('type');
    expect(log).not.toHaveProperty('log_id');
    expect(log).not.toHaveProperty('log_date');
  });
});

// Manual API endpoint test
describe('API Endpoint Integration Tests', () => {
  // This test would need to be run with actual API endpoints
  // so it's marked as skipped by default
  test.skip('Volunteer API endpoint returns properly formatted data', async () => {
    // Define the mock response type
    const mockResponse: VolunteerResponse = {
      id: 123,
      firstName: 'John',
      lastName: 'Doe',
      emailAddress: 'john.doe@example.com',
      isActive: true,
      recentActivity: [
        {
          id: 1,
          type: 'CHECK_IN',
          date: '2023-01-02',
          hours: 8,
          details: 'Morning Shift (9:00 AM - 5:00 PM)'
        }
      ]
    };
    
    // Create a mock of the apiGet function
    const mockApiGet = jest.fn().mockImplementation(() => Promise.resolve(mockResponse));
    
    // Mock the apiGet function
    jest.mock('../lib/api-client', () => ({
      apiGet: mockApiGet
    }));
    
    // Test an API call
    const response = await apiGet<VolunteerResponse>('/api/volunteers/123');
    
    // Verify the response has camelCase properties
    const invalidProps = deepTestCasing(response as Record<string, any>, 'camel');
    expect(Object.keys(invalidProps).length).toBe(0);
    
    // Verify specific expected properties
    expect(response).toHaveProperty('firstName');
    expect(response).toHaveProperty('lastName');
    expect(response).toHaveProperty('emailAddress');
    expect(response.recentActivity[0]).toHaveProperty('type');
    expect(response.recentActivity[0]).toHaveProperty('details');
  });
});

/**
 * How to run these tests:
 * 
 * 1. Make sure Jest is installed in your project:
 *    npm install --save-dev jest @types/jest ts-jest
 * 
 * 2. Add this to your package.json:
 *    "scripts": {
 *      "test": "jest"
 *    }
 *
 * 3. Create a jest.config.js file:
 *    module.exports = {
 *      preset: 'ts-jest',
 *      testEnvironment: 'node',
 *    };
 * 
 * 4. Run the tests:
 *    npm test
 */ 