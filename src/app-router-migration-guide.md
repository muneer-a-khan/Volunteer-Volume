# App Router Migration Guide for Volunteer Volume

This guide outlines the steps to complete the migration from Next.js Pages Router to the App Router, along with implementing ShadCN UI components.

## Progress Tracking

| Category | Total | Completed | Remaining |
| -------- | ----- | --------- | --------- |
| App Router Pages | 14 | 6 | 8 |
| Router References | Unknown | 2+ | Many |
| ShadCN Components | 10+ | 7+ | Several |

## Migration Process

### 1. Creating Remaining App Router Pages

We need to convert these pages from the Pages Router to the App Router structure.

- ✅ `src/app/dashboard/page.tsx` (Migrated)
- ✅ `src/app/login/page.tsx` (Migrated)
- ✅ `src/app/check-in/page.tsx` (Migrated)
- ✅ `src/app/admin/volunteers/page.tsx` (Migrated)
- ✅ `src/app/shifts/page.tsx` (Migrated)
- ✅ `src/app/profile/page.tsx` (Migrated)
- ⬜ `src/app/admin/dashboard/page.tsx` (Pending)
- ⬜ `src/app/admin/reports/page.tsx` (Pending)
- ⬜ `src/app/apply/page.tsx` (Pending)
- ⬜ `src/app/about/page.tsx` (Pending)
- ⬜ `src/app/calendar/page.tsx` (Pending)
- ⬜ `src/app/volunteers/[id]/page.tsx` (Pending)
- ⬜ `src/app/shifts/new/page.tsx` (Pending)
- ⬜ `src/app/register/page.tsx` (Pending)

For each page:
1. Create the corresponding directory structure in `src/app`
2. Add `'use client';` at the top of each file
3. Update imports to use `next/navigation` instead of `next/router`
4. Replace existing UI components with ShadCN components
5. Implement loading states with `Skeleton` components
6. Update redirects and authentication checks

### 2. Updating Router References

Replace all instances of `next/router` with `next/navigation`.

| Old API | New API |
| ------- | ------- |
| `import { useRouter } from 'next/router';` | `import { useRouter, usePathname, useSearchParams } from 'next/navigation';` |
| `router.pathname` | `pathname` |
| `router.query.paramName` | `searchParams.get('paramName')` |
| `router.push('/route')` | `router.push('/route')` (API unchanged) |
| `router.replace('/route')` | `router.replace('/route')` (API unchanged) |
| `router.back()` | `router.back()` (API unchanged) |

Components to check:
- ✅ `src/components/layout/Navbar.tsx` (Updated)
- ⬜ `src/components/layout/SideNav.jsx`
- ⬜ `src/components/auth/AuthContext.jsx`
- ⬜ `src/hooks/useAuth.ts`
- ⬜ All form submit handlers that use `router.push`
- ⬜ Any components using `router.query`

### 3. Replacing UI Components with ShadCN

- ✅ Button Component 
- ✅ Card Component
- ✅ Input Component
- ✅ Alert Component
- ✅ Tabs Component
- ✅ Table Component
- ✅ Separator Component
- ⬜ Dialog Component
- ⬜ Select Component
- ⬜ Checkbox Component
- ⬜ TextArea Component
- ⬜ Badge Component
- ⬜ Calendar Component
- ⬜ DatePicker Component

For each component:
1. Create the ShadCN component file in `src/components/ui/`
2. Install necessary Radix UI dependencies
3. Replace instances in the codebase

### 4. Creating Layout Structure

- ✅ `src/components/layout/ShadcnLayout.tsx` (Created)
- ⬜ `src/app/layout.tsx` (Root layout)
- ⬜ `src/app/admin/layout.tsx` (Admin layout)

### 5. Migration Testing Strategy

1. Test each migrated page for:
   - Authentication flows
   - Form submissions
   - Data fetching
   - Navigation
   - UI rendering

2. Create a checklist of critical user flows to validate:
   - User login and registration
   - Volunteer application
   - Checking in for shifts
   - Logging hours
   - Admin volunteer management
   - Reporting

### 6. Final Cleanup

After all pages are migrated:

1. Remove `src/pages/_app.tsx`
2. Remove all unused Pages Router pages
3. Update imports in all components
4. Remove duplicate components
5. Test the entire application

## Example Migration: Converting a Pages Router Page to App Router

### Original Pages Router Pattern:

```tsx
// src/pages/some-page.tsx
import { useRouter } from 'next/router';

export default function SomePage() {
  const router = useRouter();
  const { id } = router.query;
  
  // Component logic
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### App Router Pattern:

```tsx
// src/app/some-page/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function SomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  // Component logic
  
  return (
    <div>
      {/* Component JSX with ShadCN components */}
    </div>
  );
}
```

### Route Parameter Pattern:

```tsx
// src/app/items/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';

export default function ItemPage() {
  const params = useParams();
  const id = params.id;
  
  // Component logic
  
  return (
    <div>
      {/* Component JSX with ShadCN components */}
    </div>
  );
}
```

## Required Dependencies for ShadCN Components

Make sure to install these dependencies:

```bash
npm install @radix-ui/react-alert-dialog
npm install @radix-ui/react-dialog
npm install @radix-ui/react-select
npm install @radix-ui/react-checkbox
npm install @radix-ui/react-popover
npm install @radix-ui/react-slot
npm install @radix-ui/react-label
npm install react-day-picker date-fns
```

## Testing Checklist

- [ ] Authentication flows working
- [ ] Forms submitting correctly
- [ ] Data loading properly
- [ ] Navigation working across the application
- [ ] UI displaying correctly with ShadCN components
- [ ] Dynamic routes working with parameters
- [ ] API routes functioning
- [ ] SSR/Rendering strategies working
- [ ] Error handling

## Troubleshooting Common Issues

1. **Client Component Errors**: Make sure to add `'use client';` at the top of components that use hooks or browser APIs.

2. **Navigation Issues**: Double-check that you're using the correct imports from `next/navigation` instead of `next/router`.

3. **Parameter Access**: Use `useParams()` for route parameters and `useSearchParams()` for query parameters.

4. **ShadCN Component Errors**: Ensure all required Radix UI packages are installed.

5. **Layout Issues**: Make sure you have the proper layout hierarchy in the `app` directory.

## Resources

- [Next.js Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [ShadCN UI Documentation](https://ui.shadcn.com/docs)
- [Example Components](./migration-helpers.md) 