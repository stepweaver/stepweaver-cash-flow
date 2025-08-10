# StepWeaver Cash Flow Tracker

A personal and business cash flow tracking application built with Next.js and Firebase.

## Features

- **Business Transactions**: Track revenue, expenses, and draws for your business
- **Personal Finance**: Manage personal income and bills
- **Receipt Management**: Upload and organize receipts for transactions
- **User Management**: Add and manage additional users (Admin only)
- **Export Functionality**: Export data in various formats
- **Responsive Design**: Works on desktop and mobile devices

## User Management

### Adding New Users

As an admin user, you can add new users directly from the Admin tab:

1. Navigate to the **Admin** tab in the main navigation
2. Fill out the "Add New User" form:
   - **Email Address**: The user's email (required)
   - **Password**: A secure password, minimum 6 characters (required)
   - **Display Name**: Optional friendly name for the user
3. Click "Create User" to add the account

**Important Note**: After creating a user account, you will be automatically signed out and need to sign in again. This is a security feature to ensure only the intended user can access the new account.

### Managing Users

- **View Users**: See all current users with their roles and status
- **Change Roles**: Update user roles between "User" and "Admin"
- **Remove Users**: Delete user accounts (users will still be able to sign in until manually removed from Firebase Console)

### User Roles

- **Admin**: Full access to all features including user management
- **User**: Access to business and personal tracking features

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project with Authentication and Firestore enabled

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

- **Build**: `npm run build`
- **Start**: `npm start`
- **Lint**: `npm run lint`

## Architecture

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with custom terminal theme
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **State Management**: React Context for authentication
- **Icons**: Lucide React icon library

## Security Notes

- User creation is limited to authenticated admin users
- Passwords must be at least 6 characters long
- User deletion removes them from the system but they may still be able to sign in until manually removed from Firebase Console
- Consider implementing Firebase Admin SDK for production use cases

## License

Private project - All rights reserved
