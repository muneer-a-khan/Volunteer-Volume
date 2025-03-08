# Volunteer Volume - Virginia Discovery Museum

A volunteer management system designed for the Virginia Discovery Museum (VADM) to streamline volunteer scheduling, shift tracking, and attendance logging.

## Project Overview

Volunteer Volume is a web-based volunteer management system that allows volunteers to sign up for shifts, track hours, and manage their schedules while providing administrators with tools for scheduling and monitoring participation.

## Features:

- Secure authentication with AWS Cognito
- Shift scheduling and volunteer management
- Automated shift reminders via AWS SNS
- Check-in & check-out system for attendance tracking
- Admin dashboard for monitoring volunteers & shifts
- Google Calendar integration for scheduling
- Responsive UI with TailwindCSS
- Hosted on AWS Amplify & AWS Lambda

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| React.js | Frontend framework |
| TailwindCSS | Styling framework |
| Next.js API Routes (AWS Lambda) | Backend logic |
| Prisma ORM with AWS RDS (MySQL) | Database |
| AWS Cognito | Authentication |
| AWS SNS | Notifications |
| AWS S3 | File storage (volunteer logs, documents) |
| Google Calendar API | Shift scheduling |
| AWS Amplify | Hosting & Deployment |

## Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (v16+)
- npm
- AWS CLI (for AWS services)
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
Create a `.env.local` file in the root directory and configure AWS & database credentials:
```
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_COGNITO_REGION=us-east-1
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_WEB_CLIENT_ID=your-client-id
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
NEXT_PUBLIC_AWS_S3_BUCKET=vadm-volunteer-files
NEXT_PUBLIC_AWS_SNS_TOPIC_ARN=your-sns-topic-arn

DATABASE_URL=mysql://username:password@your-rds-instance.amazonaws.com:3306/volunteer_volume

GOOGLE_CALENDAR_API_KEY=your-google-api-key
GOOGLE_CALENDAR_ID=your-calendar-id

NEXTAUTH_SECRET=random-string-for-jwt-encryption
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

4. Generate Prisma client
```bash
npx prisma generate
```

5. Push database schema to your database
```bash
npx prisma db push
```

6. Run the development server
```bash
npm run dev
```
Visit http://localhost:3000 in your browser.

## AWS Setup

For detailed AWS setup instructions, please refer to the [AWS Setup Guide](aws-setup-guide.md).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register new users |
| POST | /api/auth/login | Authenticate users |
| GET | /api/shifts | Retrieve available shifts |
| POST | /api/shifts | Schedule a new shift |
| PATCH | /api/shifts/:id | Update a shift |
| DELETE | /api/shifts/:id | Delete a shift |
| POST | /api/log-hours | Log volunteer hours |
| POST | /api/check-in | Check-in for a shift |
| POST | /api/check-out | Check-out from a shift |

## Deployment

To deploy the application to AWS Amplify:

1. Ensure your AWS CLI is configured with appropriate credentials
2. Build the project:
```bash
npm run build
```

3. Deploy using the Amplify CLI:
```bash
amplify publish
```

Alternatively, set up continuous deployment by connecting your repository to AWS Amplify.

## Collaboration Guidelines

### Branching Strategy
- Each issue should have its own branch.
- If you are the first to assign yourself to an issue, create a branch:
  ```bash
  git checkout -b feature/issue-<issue_number>
  ```
- Keep branch names structured, e.g., `voice-processing/multiple-speakers`, `UI/rendering-error`.
- Avoid making structural changes unless necessary and communicate before making them.

### Commit & Merge Guidelines
#### Commit Messages
Use meaningful commit messages following this format:
```
[Label name] Short description
```
Example:
```
[voice-processing] Implemented AI-driven scenario-based questioning
```

#### Merging
When a feature is complete:

1. Ensure your branch is up to date:
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/issue-<issue_number>
   git rebase main
   ```

2. Create a pull request (PR) with a detailed description.

#### Creating a Pull Request
1. Push your updated feature branch:
   ```bash
   git push origin feature/issue-<issue_number>
   ```

2. On GitHub:
   - Navigate to this repository
   - Click "Compare & pull request"
   - Fill out the PR form:
     - Base branch: `main`
     - Compare branch: `feature/issue-<issue_number>`
     - Title: Brief description of the change
     - Description: Add details about the change and relevant issue number
     - Assign appropriate reviewers
     - Add appropriate labels

3. Wait for review and address any feedback by pushing new commits.

4. Once approved, use "Squash and merge" and delete the feature branch.

## Team Members

| Name | Role |
|------|------|
| Muneer | Lead Developer (Backend, AWS Integration) |
| Manav | Frontend Developer (UI Components, API Integration) |
| Aiden | UI/UX Designer (Wireframes, Styling, UX) |
| Joshua | Tester & QA (Bug Reports, Documentation) |
| Ramses | Project Coordinator (Planning, Research, Presentation) |

## Security & Best Practices
- Data Encryption: All sensitive user data is encrypted.
- Role-Based Access Control: Volunteers & Admins have different permissions.
- Rate Limiting: Prevents spam requests.
- AWS Security Measures: IAM Roles, CloudWatch Monitoring.

## Future Enhancements
- Shift Swap System: Allow volunteers to trade shifts.
- Machine Learning Recommendations: Suggest shifts based on past activity.
- Mobile App (React Native): Expand accessibility.

## License
This project is licensed under the MIT License.