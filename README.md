# λstepweaver Cash Flow

A comprehensive cash flow tracking application for both business and personal finances.

## Features

- **λstepweaver**: Business transaction tracking and management
- **Personal**: Personal finance tracking and management
- **Admin**: User management and system administration

## Project Structure

```
app/
├── page.jsx                 # Main page with navigation links
├── stepweaver/              # Business tracker page
│   └── page.jsx
├── personal/                # Personal tracker page
│   └── page.jsx
├── admin/                   # Admin panel page
│   └── page.jsx
├── layout.jsx               # Root layout
└── globals.css              # Global styles

components/
├── BusinessTracker.jsx      # Business transaction component
├── PersonalTracker.jsx      # Personal finance component
├── Admin/
│   └── UserManagement.jsx   # User management component
└── ...                      # Other components
```

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Navigation

- **Home** (`/`): Simple navigation page with links to all sections
- **λstepweaver** (`/stepweaver`): Business transaction management
- **Personal** (`/personal`): Personal finance tracking
- **Admin** (`/admin`): User management and system administration

## Technology Stack

- **Frontend**: Next.js 15, React 19
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **File Storage**: Firebase Storage

## Development

- **Build**: `npm run build`
- **Start**: `npm start`
- **Lint**: `npm run lint`
