/**
 * Specialized data mappers for complex nested structures
 */
import { mapSnakeToCamel, mapCamelToSnake } from './map-utils';

// Define activity types to match the ones in the API
type ActivityType = 'CHECK_IN' | 'LOG';

interface ActivityItem {
  type: ActivityType;
  date: Date;
  details: string;
  id: string;
  [key: string]: any;
}

/**
 * Maps complex volunteer activity data from database format to frontend format
 * This handles the special case of combining check-ins and volunteer logs
 * with proper field name conversion
 */
export function mapVolunteerActivity(checkInActivity: any[], logActivity: any[]): ActivityItem[] {
  // First, map each activity to have camelCase fields
  const mappedCheckIns = checkInActivity.map(checkIn => {
    const camelCaseCheckIn = mapSnakeToCamel(checkIn);
    return {
      type: 'CHECK_IN' as ActivityType,
      date: camelCaseCheckIn.checkInTime,
      details: camelCaseCheckIn.shifts?.title || 'Unknown shift',
      duration: camelCaseCheckIn.duration || null,
      id: camelCaseCheckIn.id,
      shiftId: camelCaseCheckIn.shiftId,
      rawData: camelCaseCheckIn
    };
  });

  const mappedLogs = logActivity.map(log => {
    const camelCaseLog = mapSnakeToCamel(log);
    return {
      type: 'LOG' as ActivityType,
      date: camelCaseLog.date,
      details: `${camelCaseLog.hours} hours ${camelCaseLog.minutes > 0 ? `${camelCaseLog.minutes} minutes` : ''}`,
      hours: camelCaseLog.hours,
      minutes: camelCaseLog.minutes,
      id: camelCaseLog.id,
      rawData: camelCaseLog
    };
  });

  // Combine and sort by date
  return [...mappedCheckIns, ...mappedLogs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Maps complex shift data with volunteer information
 */
export function mapShiftWithVolunteers(shift: any) {
  const camelCaseShift = mapSnakeToCamel(shift);
  
  // Process volunteer data if present
  if (camelCaseShift.shiftVolunteers && Array.isArray(camelCaseShift.shiftVolunteers)) {
    // Map the nested volunteer data in each shift-volunteer relationship
    camelCaseShift.volunteers = camelCaseShift.shiftVolunteers.map((sv: any) => {
      if (sv.users) {
        return mapSnakeToCamel(sv.users);
      }
      return null;
    }).filter(Boolean);
  }
  
  return camelCaseShift;
}

/**
 * Maps group data with members and admins
 */
export function mapGroupWithMembers(group: any) {
  const camelCaseGroup = mapSnakeToCamel(group);
  
  // Process member data
  if (camelCaseGroup.userGroups && Array.isArray(camelCaseGroup.userGroups)) {
    camelCaseGroup.members = camelCaseGroup.userGroups
      .map((ug: any) => {
        if (ug.users) {
          const member = mapSnakeToCamel(ug.users);
          // Add membership info to each member
          member.membershipStatus = ug.status;
          member.membershipRole = ug.role;
          member.joinedAt = ug.joinedAt;
          return member;
        }
        return null;
      })
      .filter(Boolean);
  }
  
  // Process admin data
  if (camelCaseGroup.groupAdmins && Array.isArray(camelCaseGroup.groupAdmins)) {
    camelCaseGroup.admins = camelCaseGroup.groupAdmins
      .map((ga: any) => ga.users ? mapSnakeToCamel(ga.users) : null)
      .filter(Boolean);
  }
  
  return camelCaseGroup;
}

/**
 * Creates a mapper function for a specific nested data structure
 * This is a factory function to create custom mappers for different data types
 */
export function createNestedMapper<T>(
  nestedFieldMapping: Record<string, string | ((data: any) => any)>
) {
  return function mapNestedData(data: any): T {
    // First apply standard casing conversions
    const camelCaseData = mapSnakeToCamel(data);
    
    // Then apply custom nested field mappings
    Object.entries(nestedFieldMapping).forEach(([field, mapper]) => {
      if (typeof mapper === 'function') {
        if (camelCaseData[field]) {
          camelCaseData[field] = mapper(camelCaseData[field]);
        }
      } else if (typeof mapper === 'string') {
        // This is a field rename operation
        if (camelCaseData[field] !== undefined) {
          camelCaseData[mapper] = camelCaseData[field];
          delete camelCaseData[field];
        }
      }
    });
    
    return camelCaseData as T;
  };
} 