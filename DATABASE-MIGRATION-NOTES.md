# Database Migration Notes

## Background

This project has been migrated to work with an existing PostgreSQL database that uses `snake_case` field names and table names. 
The application code expects `camelCase`, so we've implemented mapping utilities to handle the conversion between the two naming conventions.

## Key Changes

1. **Database Model Names** 
   - Model names are now plural and snake_case (e.g. `users`, `shifts`, `check_ins`)
   - In your code: `prisma.users` instead of `prisma.user`

2. **Field Names** 
   - Database field names are snake_case (e.g. `user_id`, `start_time`)
   - Application code expects camelCase (e.g. `userId`, `startTime`)

3. **Database Schema**
   - We're using tables from both the `public` and `auth` schemas
   - The `multiSchema` preview feature is enabled in Prisma

## Working with the Updated Code

### When Querying the Database

```typescript
// DO THIS - use snake_case field names in queries
const user = await prisma.users.findUnique({
  where: { 
    id: userId,
    email: userEmail
  },
  select: { 
    id: true,
    name: true,
    email: true,
    created_at: true 
  }
});

// Then convert to camelCase for your application
const camelCaseUser = mapSnakeToCamel(user);
// Now you can use camelCaseUser.id, camelCaseUser.createdAt
```

### When Creating or Updating Records

```typescript
// Convert from camelCase to snake_case for database operations
const dataToInsert = mapCamelToSnake({
  userId: "...",
  startTime: new Date(),
  status: "ACTIVE"
});

// Or manually use snake_case fields
await prisma.check_ins.create({ 
  data: {
    user_id: userId,
    shift_id: shiftId,
    check_in_time: new Date(),
    notes: notes || ''
  }
});
```

### API Responses

Always convert snake_case database results to camelCase before sending to the frontend:

```typescript
return res.status(200).json(mapSnakeToCamel(databaseResult));
```

### Relationships

Many relationships have changed names as well:

- `user.profile` → `users.profiles`
- `shift.volunteers` → `shifts.shift_volunteers`
- `group.members` → `groups.user_groups`

Check the Prisma schema for the correct relationship names.

### Important Relations

- `shift_volunteers` - junction table between shifts and users
- `user_groups` - junction table between users and groups
- `group_admins` - junction table for group administrators
- `check_ins` - replaces CheckIn
- `volunteer_logs` - replaces VolunteerLog

## Troubleshooting Common Issues

1. **"Property does not exist"** - You might be trying to access a camelCase property on a snake_case object or vice versa. Make sure to:
   - Convert database results with `mapSnakeToCamel` before using them
   - Convert client data with `mapCamelToSnake` before sending to the database

2. **Relationship not found** - Make sure you're using the correct relationship names from the schema

3. **Complex nested objects** - For deeply nested data from multiple relations, you may need to implement custom mapping

## Supabase Row Level Security

Many tables have row-level security policies. These were preserved during the migration. Any changes to database structure should take these policies into account.

## For New Developers

When working with this codebase:

1. Look at the Prisma schema first to understand the data structure
2. Remember the snake_case/camelCase distinction
3. Use the mapping utilities whenever crossing the application/database boundary
4. Understand that the database uses a multiple-schema approach 