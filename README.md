# Stepweaver Cash Flow Management System

A comprehensive cash flow tracking application for both business and personal finances, built with Next.js, Tailwind CSS, and Firebase.

## Features

### 🔐 **Authentication System**
- **Login Only**: No public signup - users must be invited by an admin
- **Email Invitations**: Admin can send email invitations to new users
- **Password Reset**: Users can reset their passwords if forgotten
- **Secure Access**: Protected routes ensure only authenticated users can access the system

### 💼 **Business Tracker**
- Track business revenue, expenses, and draws
- Monthly and annual financial summaries
- Receipt upload and management
- Export functionality (CSV, JSON, PDF)
- Date range filtering and reporting

### 👤 **Personal Tracker**
- Monitor personal income and bills
- Bill status tracking (Pending, Paid)
- Monthly budget vs. actual comparisons
- Discretionary income calculations
- Export personal financial data

### 👨‍💼 **Admin Panel**
- **User Management**: View all users and their status
- **Email Invitations**: Send invitations to new users
- **User Roles**: Admin and User role management
- **User Status**: Track Active, Pending, and Inactive users

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project setup

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Firebase configuration in `lib/firebase.js`
4. Run the development server: `npm run dev`

### Environment Variables
Create a `.env.local` file with your Firebase configuration:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Usage

### First Time Setup
1. **Initial Admin User**: You'll need to manually create your first admin user in Firebase
2. **Login**: Use your admin credentials to access the system
3. **Invite Users**: Use the Admin panel to send email invitations to new users

### Adding New Users
1. Navigate to the **Admin** tab
2. Enter the email address of the person you want to invite
3. Click "Send Invitation"
4. The invited user will receive an email with setup instructions

### User Roles
- **Admin**: Full access to all features including user management
- **User**: Access to business and personal tracking features

## Technical Details

### Tech Stack
- **Frontend**: Next.js 15, React 19
- **Styling**: Tailwind CSS with custom terminal theme
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage (for receipts)
- **Deployment**: Vercel-ready

### Custom Tailwind Configuration
- Terminal-style color palette
- Custom animations and keyframes
- OCR and IBM 3270 font support
- Responsive design with mobile-first approach

### File Structure
```
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── Auth/             # Authentication components
│   ├── Admin/            # Admin panel components
│   └── ...               # Other feature components
├── lib/                   # Utility functions and Firebase config
├── public/                # Static assets and fonts
└── tailwind.config.js     # Tailwind CSS configuration
```

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Building
The application builds successfully with no warnings or errors. All Tailwind classes are properly configured and optimized.

## Security Features

- **Protected Routes**: All main features require authentication
- **Email Verification**: Users must verify their email addresses
- **Role-Based Access**: Different permissions for admin and regular users
- **Secure Storage**: Receipts and sensitive data stored securely in Firebase

## Contributing

This is a personal project, but suggestions and improvements are welcome. Please ensure all code follows the existing patterns and maintains the terminal aesthetic.

## License

Private project - All rights reserved.

---

**Built with ❤️ using Next.js and Tailwind CSS**
