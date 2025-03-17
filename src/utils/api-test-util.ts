/**
 * API Testing Utility
 * 
 * This utility helps test API data transformations to ensure
 * that data is properly transformed between snake_case and camelCase.
 */

import axios from 'axios';
import { mapSnakeToCamel, mapCamelToSnake } from '../lib/map-utils';

/**
 * Test if an object's properties match expected casing style
 * @param obj Object to test
 * @param casing Expected casing style ('snake' or 'camel')
 * @returns Array of properties that do not match the expected casing
 */
export function testCasing(obj: Record<string, any>, casing: 'snake' | 'camel'): string[] {
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
 * @param obj Object to test
 * @param casing Expected casing style ('snake' or 'camel')
 * @param path Current property path for nested objects
 * @returns Object with invalid property paths and their values
 */
export function deepTestCasing(
  obj: Record<string, any>, 
  casing: 'snake' | 'camel', 
  path: string = ''
): Record<string, any> {
  const invalidProps: Record<string, any> = {};
  
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
        obj[prop].forEach((item: any, index: number) => {
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
 * @param endpoints Array of API endpoints to test
 * @returns Promise with test results
 */
export async function testApiEndpoints(endpoints: string[]): Promise<Record<string, any>> {
  const results: Record<string, any> = {};
  
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
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  return results;
}

/**
 * Example usage:
 *
 * Create a test file that imports this utility and tests your API endpoints
 *
 * async function runApiTests() {
 *   const endpoints = [
 *     '/api/volunteers/123',
 *     '/api/shifts',
 *     '/api/groups/456'
 *   ];
 *
 *   const results = await testApiEndpoints(endpoints);
 *   console.log(JSON.stringify(results, null, 2));
 * }
 */ 