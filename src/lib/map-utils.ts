
// Utility functions for mapping between camelCase and snake_case objects
// For use with the Prisma models that use snake_case fields

// Map from Prisma snake_case to application camelCase
export function mapSnakeToCamel(data: any): any {
  if (!data) return data;
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(mapSnakeToCamel);
  }
  
  // Handle objects
  if (typeof data === 'object' && data !== null) {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Handle nested objects/arrays
      const newValue = typeof value === 'object' && value !== null ? mapSnakeToCamel(value) : value;
      
      // Map snake_case to camelCase
      const newKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[newKey] = newValue;
    }
    
    return result;
  }
  
  return data;
}

// Map from application camelCase to Prisma snake_case
export function mapCamelToSnake(data: any): any {
  if (!data) return data;
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(mapCamelToSnake);
  }
  
  // Handle objects
  if (typeof data === 'object' && data !== null) {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Handle nested objects/arrays
      const newValue = typeof value === 'object' && value !== null ? mapCamelToSnake(value) : value;
      
      // Map camelCase to snake_case
      const newKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      result[newKey] = newValue;
    }
    
    return result;
  }
  
  return data;
}

// Field mapping for specific known fields
export const fieldMap = {
  "userId": "user_id",
  "groupId": "group_id",
  "shiftId": "shift_id",
  "startTime": "start_time",
  "endTime": "end_time",
  "emailVerified": "email_verified",
  "googleCalendarEventId": "google_calendar_event_id",
  "checkInTime": "check_in_time",
  "checkOutTime": "check_out_time",
  "zipCode": "zip_code",
  "createdAt": "created_at",
  "updatedAt": "updated_at",
  "approvedBy": "approved_by",
  "approvedAt": "approved_at",
  "rejectedBy": "rejected_by",
  "rejectedAt": "rejected_at",
  "sessionToken": "session_token",
  "providerAccountId": "provider_account_id"
};

// Inverse mapping (snake_case to camelCase)
export const inverseFieldMap = Object.entries(fieldMap).reduce(
  (acc, [camel, snake]) => {
    acc[snake] = camel;
    return acc;
  },
  {} as Record<string, string>
);
