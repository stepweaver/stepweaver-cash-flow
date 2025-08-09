# StepWeaver Cash Flow App

A modern, responsive cash flow and budget tracking application built with Next.js 15 and Tailwind CSS v4.

## 🚀 Features

### Business Tracker

- **Revenue, Expenses & Draws tracking** with color-coded categories
- **Monthly summary cards** showing totals and net income
- **Add/Edit/Delete transactions** with full CRUD operations
- **Date-based filtering** by month with navigation
- **Local storage persistence** for data retention

### Personal Budget Tracker

- **Income management** with source tracking and actual vs budget amounts
- **Bill management** with due dates, status tracking (paid/pending)
- **Visual indicators** for bills needing attention
- **Net cash flow calculation** with color-coded positive/negative amounts
- **Modal forms** for adding/editing income and bills

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **Tailwind CSS v4** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Local Storage** - Client-side data persistence
- **Firebase** - Cloud data persistence (coming soon)

## 🎨 UI/UX Features

- **Clean, professional design** with modern aesthetics
- **Responsive layout** that works on all devices
- **Color-coded status indicators** (green for paid, yellow for pending)
- **Smooth transitions** and hover effects
- **Accessible design** with proper focus states
- **Dashboard with summary cards** showing key metrics

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/stepweaver-cash-flow.git
   cd stepweaver-cash-flow
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Business Tab

- Track revenue, expenses, and draws
- View monthly summaries and net income
- Add transactions with descriptions, amounts, and dates
- Filter by month using navigation arrows

### Personal Tab

- Manage income sources and expected amounts
- Track bills with due dates and payment status
- Monitor actual vs budget amounts
- Toggle bill status between paid and pending

## 🔧 Development

### Project Structure

```
stepweaver-cash-flow/
├── app/
│   ├── layout.jsx          # Root layout with fonts and theme
│   ├── page.jsx            # Main application page
│   ├── globals.css         # Global styles and terminal theme
│   └── fonts/              # Custom terminal fonts
├── components/
│   ├── BusinessTracker.jsx # Business expense/revenue tracking
│   ├── PersonalTracker.jsx # Personal budget and bill tracking
│   ├── DateRangePicker.jsx # Export date range selector
│   ├── ReceiptUpload.jsx   # File upload component
│   └── ReceiptViewer.jsx   # Receipt viewing modal
├── lib/
│   ├── firebase.js         # Firebase configuration and functions
│   └── exportUtils.js      # Data export utilities
├── styles/                 # Additional CSS modules
├── public/                 # Static assets
└── tailwind.config.js      # Tailwind CSS configuration
```

## 🚀 Deployment

### Environment Variables

Create a `.env.local` file in the root directory with your Firebase configuration:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Build and Deploy

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Test the production build**
   ```bash
   npm start
   ```

### Deployment Platforms

#### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in the Vercel dashboard
3. Deploy automatically on push

#### Netlify

1. Build command: `npm run build`
2. Publish directory: `.next`
3. Add environment variables in Netlify settings

#### Other Platforms

The app is a standard Next.js application and can be deployed to any platform that supports Node.js applications.

## 🔒 Security Features

- Environment variable validation
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- CORS protection for Firebase Storage
- Input sanitization and validation
- No sensitive data in client-side code

## 📊 Performance Optimizations

- Next.js 15 with App Router for optimal performance
- Image optimization with AVIF/WebP support
- Code splitting and lazy loading
- Tailwind CSS for minimal bundle size
- Efficient Firebase queries with proper indexing
- Local storage fallback for offline functionality
