# App Router Migration and Cleanup Plan

## Completed Migrations
- ✅ `/src/app/login`: Login page migrated
- ✅ `/src/app/register`: Register page migrated
- ✅ `/src/app/dashboard`: Dashboard page migrated
- ✅ `/src/app/log-hours`: Log Hours page migrated
- ✅ `/src/app/check-in`: Check-in page migrated
- ✅ `/src/app/admin/dashboard`: Admin Dashboard page migrated
- ✅ Fixed `AuthContext.jsx` to use next/navigation
- ✅ Fixed `useAuth.ts` to use next/navigation
- ✅ Created `skeleton.tsx` ShadCN component
- ✅ Updated `LogHoursForm.jsx` to use ShadCN UI components

## Remaining Tasks

### App Router Pages to Create
1. `/src/app/apply`
2. `/src/app/application-success`
3. `/src/app/admin/volunteers`
4. `/src/app/admin/applications`
5. `/src/app/admin/reports`
6. `/src/app/admin/shifts`
7. `/src/app/groups`
8. `/src/app/groups/[id]`
9. `/src/app/volunteers`
10. `/src/app/volunteers/[id]`
11. `/src/app/volunteers/profile`
12. `/src/app/shifts`
13. `/src/app/shifts/[id]`
14. `/src/app/shifts/new`

### Files to Update with next/navigation Router
1. `src/components/layout/Navbar.tsx`
2. `src/components/volunteers/VolunteerList.jsx`
3. `src/components/volunteers/ApplicationForm.jsx`
4. `src/components/shifts/ShiftForm.jsx`

### Replace Common Components with ShadCN
1. Replace `src/components/common/Button.tsx` with `src/components/ui/button.tsx`
2. Replace `src/components/common/Card.jsx` with `src/components/ui/card.tsx`
3. Replace `src/components/common/Alert.jsx` with `src/components/ui/alert.tsx`

### Replace Layout Components with ShadCN
1. Replace `src/components/layout/Layout.tsx` with `src/components/layout/ShadcnLayout.tsx`
2. Replace `src/components/layout/Navbar.tsx` with `src/components/layout/ShadcnNavbar.tsx`
3. Replace `src/components/layout/Footer.tsx` with `src/components/layout/ShadcnFooter.tsx`

### Components to Update with ShadCN UI
1. `src/components/dashboard/AdminDashboard.jsx`
2. `src/components/dashboard/VolunteerDashboard.jsx`
3. `src/components/dashboard/Stats.jsx`
4. `src/components/volunteers/VolunteerList.jsx`
5. `src/components/volunteers/VolunteerProfile.jsx`
6. `src/components/volunteers/ApplicationForm.jsx`
7. `src/components/shifts/ShiftForm.jsx`

### Final Cleanup
Once all components have been migrated and updated:
1. Delete original pages: `/src/pages/` (except /api)
2. Delete unused components in `/src/components/common`
3. Delete unused components in `/src/components/layout` (old versions)
4. Update imports in any remaining files

## Implementation Strategy
1. First, complete the creation of all app router pages
2. Next, update remaining components to use next/navigation
3. Then, replace common components with ShadCN components one by one
4. Finally, perform cleanup once all replacements are verified working