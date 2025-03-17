# API Data Transformation Guide

## Overview

This guide explains our approach to handling data transformations between the database (snake_case) and frontend (camelCase) in our API endpoints.

## Background

Our project uses:
- **Database/Backend**: snake_case field names (`user_id`, `first_name`)
- **Frontend/Client**: camelCase field names (`userId`, `firstName`)

This standardization helps maintain consistent coding styles across different parts of the application.

## Data Transformation Process

### Main Utilities

We use the following utilities to transform data:

1. **`mapSnakeToCamel`**: Converts all keys in an object from snake_case to camelCase
   - Used when sending data from backend to frontend
   - Handles nested objects and arrays
   - Located in `src/lib/map-utils.ts`

2. **`mapCamelToSnake`**: Converts all keys in an object from camelCase to snake_case
   - Used when receiving data from frontend to save in database
   - Handles nested objects and arrays
   - Located in `src/lib/map-utils.ts`

3. **Specialized Mappers**: Custom functions for complex data structures
   - Located in `src/lib/data-mappers.ts`
   - Examples: `mapVolunteerActivity`, `mapShiftWithVolunteers`

### API Client Utilities

For frontend API calls, we provide the following utilities:

- **`apiGet`**: Makes GET requests and handles responses
- **`apiPost`**: Makes POST requests with proper data transformation
- **`apiPut`**: Makes PUT requests with proper data transformation
- **`apiDelete`**: Makes DELETE requests

These utilities are located in `src/lib/api-client.ts`.

## Guidelines for API Endpoints

### Creating New API Endpoints

When creating a new API endpoint:

1. **Database Queries**:
   - Use snake_case for all field names in database queries
   - Example: `SELECT user_id, first_name, last_name FROM users`

2. **Response Transformation**:
   - Always transform data before sending to the client
   - Use `mapSnakeToCamel` as the base transformer
   - For complex data structures, create a specialized mapper

3. **Request Data Handling**:
   - Transform data received from the client with `mapCamelToSnake`
   - Example: `const userData = mapCamelToSnake(req.body)`

### Example: Basic API Endpoint

```typescript
import { mapSnakeToCamel } from '../../lib/map-utils';

export default async function handler(req, res) {
  // GET request
  if (req.method === 'GET') {
    try {
      // Fetch data from database (snake_case)
      const result = await db.query('SELECT user_id, first_name, last_name FROM users');
      
      // Transform data to camelCase for frontend
      const transformedData = mapSnakeToCamel(result.rows);
      
      return res.status(200).json(transformedData);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
```

### Example: Complex Data Structure

For complex data structures, create specialized mappers:

```typescript
import { mapSnakeToCamel } from '../../lib/map-utils';
import { mapVolunteerActivity } from '../../lib/data-mappers';

export default async function handler(req, res) {
  // GET request for volunteer data with activities
  if (req.method === 'GET') {
    try {
      // Fetch basic volunteer data
      const volunteerResult = await db.query(
        'SELECT user_id, first_name, last_name FROM volunteers WHERE user_id = $1',
        [req.query.id]
      );
      
      // Fetch activity data
      const activitiesResult = await fetchActivities(req.query.id);
      
      // Transform basic data
      const volunteer = mapSnakeToCamel(volunteerResult.rows[0]);
      
      // Use specialized mapper for complex activity data
      volunteer.recentActivity = mapVolunteerActivity(activitiesResult);
      
      return res.status(200).json(volunteer);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
```

## Testing API Transformations

We provide utilities to test and verify your API transformations:

1. **Unit Tests**: Test individual mappers
   - Located in `src/tests/api-transformation.test.ts`
   - Run with `npm test`

2. **Development Testing Script**: Test live API endpoints
   - Located in `src/scripts/test-api-transformations.ts`
   - Run with `ts-node src/scripts/test-api-transformations.ts`
   - Tests if all properties are correctly using camelCase

## Common Issues and Solutions

### Missing Transformations

**Issue**: Some fields are still in snake_case in API responses

**Solution**:
- Ensure you're applying `mapSnakeToCamel` to all returned data
- For nested structures, create and use specialized mappers
- Use the testing script to identify missing transformations

### Inconsistent Field Names

**Issue**: Some fields are named differently after transformation

**Solution**:
- Follow consistent naming conventions in database schema
- Create custom mappers for special fields that need different names
- Document any intentional naming differences

### Complex Nested Data

**Issue**: Nested objects or arrays aren't transformed correctly

**Solution**:
- Use specialized mappers for complex data structures
- Test nested transformations separately
- Consider flattening overly complex structures

## Best Practices

1. **Always Transform**: Never send snake_case data directly to the frontend
2. **Create Specialized Mappers**: For complex data structures
3. **Type Definitions**: Create TypeScript interfaces for both snake_case and camelCase versions
4. **Test Transformations**: Use the provided testing utilities
5. **Document Special Cases**: If some fields need special handling, document them

## Further Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) 