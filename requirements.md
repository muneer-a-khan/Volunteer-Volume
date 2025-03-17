# Volunteer Volume Dependencies

This document lists all the dependencies required for the Volunteer Volume project and provides installation instructions.

## Core Application Dependencies

The core application dependencies are managed through npm and are defined in `package.json`. To install these dependencies, run:

```bash
npm install
```

This will install the following:

- **Frontend**:
  - `react`: ^18.2.0
  - `react-dom`: ^18.2.0
  - `next`: ^13.5.4
  - `tailwindcss`: ^3.3.3
  - `@headlessui/react`: ^1.7.17
  - `@heroicons/react`: ^2.0.18
  - `react-hook-form`: ^7.46.2
  - `react-hot-toast`: ^2.4.1
  - `react-query`: ^3.39.3
  - `zod`: ^3.22.2
  - `date-fns`: ^2.30.0

- **AWS Integration**:
  - `aws-amplify`: ^5.3.11
  - `@aws-amplify/ui-react`: ^4.6.4
  - `@aws-sdk/client-cognito-identity-provider`: ^3.427.0
  - `@aws-sdk/client-s3`: ^3.427.0
  - `@aws-sdk/client-sns`: ^3.427.0

- **Database**:
  - `@prisma/client`: ^5.3.1

- **API Integration**:
  - `axios`: ^1.5.1
  - `googleapis`: ^126.0.1
  - `jsonwebtoken`: ^9.0.2

## AWS Setup Dependencies

Additional dependencies for AWS setup scripts include:

```bash
npm install dotenv uuid @aws-sdk/client-cognito-identity-provider @aws-sdk/client-rds @aws-sdk/client-s3 @aws-sdk/client-sns --save-dev
```

## Development Dependencies

Development dependencies can be installed with:

```bash
npm install --save-dev
```

These include:
- `prisma`: ^5.3.1
- `typescript`: ^5.2.2
- `@types/node`: ^20.8.3
- `@types/react`: ^18.2.25
- `eslint`: ^8.51.0
- `eslint-config-next`: ^13.5.4
- `jest`: ^29.7.0
- `@testing-library/jest-dom`: ^6.1.3
- `@testing-library/react`: ^14.0.0
- `autoprefixer`: ^10.4.16
- `postcss`: ^8.4.31

## Complete Installation

To install all dependencies (both production and development), run:

```bash
npm install
```

## Setup Script

For a complete setup including dependencies and configuration, you can use the project's setup script:

```bash
node setup.js
```

This interactive script will:
1. Install all dependencies
2. Set up environment variables
3. Configure AWS services (optional)
4. Set up the database

## Manual Installation for Python Developers

If you're more familiar with Python's pip and want a similar experience, you can create a `package-install.sh` script:

```bash
#!/bin/bash
# package-install.sh
npm install
```

Then make it executable:

```bash
chmod +x package-install.sh
```

And run it:

```bash
./package-install.sh
```

This provides a similar experience to `pip install -r requirements.txt`. 