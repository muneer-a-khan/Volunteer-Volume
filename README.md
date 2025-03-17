# Volunteer Volume - Virginia Discovery Museum

A volunteer management system designed for the Virginia Discovery Museum (VADM) to streamline volunteer scheduling, shift tracking, and attendance logging.

## Project Overview

Volunteer Volume is a web-based volunteer management system that allows volunteers to sign up for shifts, track hours, and manage their schedules while providing administrators with tools for scheduling and monitoring participation.

## Features:

- Secure authentication with Auth.js (NextAuth)
- Shift scheduling and volunteer management
- Automated shift reminders via Supabase Edge Functions
- Check-in & check-out system for attendance tracking
- Admin dashboard for monitoring volunteers & shifts
- Google Calendar integration for scheduling
- Responsive UI with TailwindCSS
- Hosted on Vercel

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| React.js | Frontend framework |
| TailwindCSS | Styling framework |
| Next.js | Full-stack framework |
| Prisma ORM with Supabase | Database |
| Auth.js (NextAuth) | Authentication |
| Supabase Storage | File storage |
| Supabase Edge Functions | Notifications & serverless functions |
| Google Calendar API | Shift scheduling |
| Vercel | Hosting & Deployment |

## Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (v16+)
- npm
- Supabase CLI (for local development)
- Google Cloud API Key (for Google Calendar integration)

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-org/volunteer-volume.git
cd volunteer-volume
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file in the root directory and configure credentials:
```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Google Calendar
GOOGLE_CALENDAR_API_KEY=your-google-api-key
GOOGLE_CALENDAR_ID=your-calendar-id

# Auth.js (NextAuth)
NEXTAUTH_SECRET=random-string-for-jwt-encryption
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Environment
NODE_ENV=development
```

4. Generate Prisma client
```bash
npx prisma generate
```

5. Push database schema to your Supabase PostgreSQL database
```bash
npx prisma db push
```

6. Run the development server
```bash
npm run dev
```
Visit http://localhost:3000 in your browser.

## Supabase Setup

This project uses Supabase for the following:
- PostgreSQL database through Prisma
- Storage for files and volunteer documents
- Edge Functions for notifications and scheduled tasks

### Setting up Supabase:
1. Create a Supabase project at https://app.supabase.com
2. Get your API keys from the project dashboard
3. Create a storage bucket named 'volunteer-files'
4. Deploy Edge Functions for email notifications

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new users |
| POST | /api/auth/forgot-password | Request password reset |
| GET | /api/shifts | Retrieve available shifts |
| POST | /api/shifts | Schedule a new shift |
| PATCH | /api/shifts/:id | Update a shift |
| DELETE | /api/shifts/:id | Delete a shift |
| POST | /api/log-hours | Log volunteer hours |
| POST | /api/check-in | Check-in for a shift |
| POST | /api/check-out | Check-out from a shift |

## Deployment

To deploy the application to Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure the environment variables
4. Deploy!

Alternatively, use the Vercel CLI:
```bash
vercel
```

## Collaboration Guidelines

### Branching Strategy
- Each issue should have its own branch.
- Use conventional commit messages.

## Team Members

| Name | Role |
|------|------|
| Muneer | Lead Developer (Backend, Supabase Integration) |
| Manav | Frontend Developer (UI Components, API Integration) |
| Aiden | UI/UX Designer (Wireframes, Styling, UX) |
| Joshua | Tester & QA (Bug Reports, Documentation) |
| Ramses | Project Coordinator (Planning, Research, Presentation) |

## Security & Best Practices
- Data Encryption: All sensitive user data is encrypted.
- Role-Based Access Control: Volunteers & Admins have different permissions.
- Rate Limiting: Prevents spam requests.
- Supabase Security: Row Level Security, Database Policies.

## Future Enhancements
- Shift Swap System: Allow volunteers to trade shifts.
- Machine Learning Recommendations: Suggest shifts based on past activity.
- Mobile App (React Native): Expand accessibility.

## License
This project is licensed under the MIT License.