import localFont from 'next/font/local';
import './globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider } from '@/lib/authContext';

const ibm3270 = localFont({
  src: './fonts/IBM_3270.woff',
  variable: '--font-ibm',
  display: 'swap',
});

export const metadata = {
  title: 'Cash Flow Tracker',
  description: 'Personal and business cash flow tracking application',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang='en'
      className={`${ibm3270.variable} antialiased`}
      data-theme='dark'
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.classList.add('theme-loaded');
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.classList.add('theme-loaded');
                }
              })();
            `,
          }}
          strategy='beforeInteractive'
        />
      </head>
      <body className='text-terminal-text'>
        <ErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
