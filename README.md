# Volunteer Volume - Virginia Discovery Museum
A volunteer management system designed for the Virginia Discovery Museum (VADM) to streamline volunteer scheduling, shift tracking, and attendance logging.

## Project Overview
Volunteer Volume is a web-based volunteer management system that allows volunteers to sign up for shifts, track hours, and manage their schedules while providing administrators with tools for scheduling and monitoring participation.

### Features:
- Secure authentication with **AWS Cognito**
- Shift scheduling and volunteer management
- Automated **shift reminders** via **AWS SNS**
- **Check-in & check-out** system for attendance tracking
- **Admin dashboard** for monitoring volunteers & shifts
- **Google Calendar integration** for scheduling
- Responsive **UI with TailwindCSS**
- Hosted on **AWS Amplify & AWS Lambda**

## 🛠 Tech Stack
| Technology | Purpose |
|------------|---------|
| **React.js** | Frontend framework |
| **TailwindCSS** | Styling framework |
| **Next.js API Routes (AWS Lambda)** | Backend logic |
| **Prisma ORM with AWS RDS (MySQL)** | Database |
| **AWS Cognito** | Authentication |
| **AWS SNS** | Notifications |
| **AWS S3** | File storage (volunteer logs, documents) |
| **Google Calendar API** | Shift scheduling |
| **AWS Amplify** | Hosting & Deployment |

## Getting Started
### Prerequisites
Ensure you have the following installed:
- **Node.js** (v16+)
- **npm**
- **AWS CLI** (for AWS services)
- **Google Cloud API Key** (for Google Calendar integration)

### Installation
#### 1. Clone the repository
```sh
git clone https://github.com/your-org/volunteer-volume.git
cd volunteer-volume
```

#### 2. Install dependencies
```sh
npm install
```

#### 3. Set up environment variables
Create a `.env.local` file in the root directory and configure AWS & database credentials:
```env
NEXT_PUBLIC_AWS_COGNITO_REGION=us-east-1
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID=your-client-id
DATABASE_URL=your-database-url
GOOGLE_CALENDAR_API_KEY=your-google-api-key
AWS_S3_BUCKET=your-s3-bucket
```

#### 4. Run the development server
```sh
npm run dev
```
Visit `http://localhost:3000` in your browser.

#### 5. Deploy to AWS
```sh
npm run build
aws amplify publish
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/auth/signup` | Register new users |
| **POST** | `/api/auth/login` | Authenticate users |
| **GET** | `/api/shifts` | Retrieve available shifts |
| **POST** | `/api/shifts` | Schedule a new shift |
| **PATCH** | `/api/shifts/:id` | Update a shift |
| **DELETE** | `/api/shifts/:id` | Delete a shift |
| **POST** | `/api/log-hours` | Log volunteer hours |
| **POST** | `/api/check-in` | Check-in for a shift |
| **POST** | `/api/check-out` | Check-out from a shift |

## Team Members
| Name | Role |
|------|------|
| **Muneer** | Lead Developer (Backend, AWS Integration) |
| **Manav** | Frontend Developer (UI Components, API Integration) |
| **Aiden** | UI/UX Designer (Wireframes, Styling, UX) |
| **Joshua** | Tester & QA (Bug Reports, Documentation) |
| **Ramses** | Project Coordinator (Planning, Research, Presentation) |

## Security & Best Practices
- **Data Encryption:** All sensitive user data is encrypted.
- **Role-Based Access Control:** Volunteers & Admins have different permissions.
- **Rate Limiting:** Prevents spam requests.
- **AWS Security Measures:** IAM Roles, CloudWatch Monitoring.

## Future Enhancements
- **Shift Swap System:** Allow volunteers to trade shifts.
- **Machine Learning Recommendations:** Suggest shifts based on past activity.
- **Mobile App (React Native):** Expand accessibility.

## Acknowledgments
Thanks to **Virginia Discovery Museum** for supporting this project! 🙌

## License
This project is licensed under the **MIT License**.
