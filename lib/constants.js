// Application constants

// Transaction types
export const TRANSACTION_TYPES = {
  REVENUE: 'revenue',
  EXPENSE: 'expense',
  DRAW: 'draw',
};

// Bill statuses
export const BILL_STATUSES = {
  PENDING: 'Pending',
  PAID: 'Paid',
};

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB in bytes
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
};

// Export formats
export const EXPORT_FORMATS = {
  CSV: 'csv',
  JSON: 'json',
  PDF: 'pdf',
};

// Tax calculations
export const TAX_CALCULATIONS = {
  SELF_EMPLOYMENT_RATE: 0.9235, // 92.35% of net profit
  TAX_RESERVE_RATE: 0.25, // 25% of taxable income
};

// Date formats
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  DISPLAY: 'MMMM D, YYYY',
  SHORT: 'MM/DD/YYYY',
};

// Currency settings
export const CURRENCY = {
  CODE: 'USD',
  LOCALE: 'en-US',
  SYMBOL: '$',
};

// Color schemes for income periods
export const INCOME_PERIOD_COLORS = {
  0: '#8b949e', // Period 0 - Plain muted (before first pay period)
  1: '#00ff41', // Period 1 - Terminal green
  2: '#ff55ff', // Period 2 - Terminal magenta
  3: '#ffff00', // Period 3 - Terminal yellow
  4: '#38beff', // Period 4 - Terminal blue
  5: '#56b6c2', // Period 5 - Terminal cyan
  6: '#ffa500', // Period 6 - Terminal orange
  7: '#a855f7', // Period 7 - Terminal purple
  8: '#ff3e3e', // Period 8 - Terminal red
  9: '#ffffff', // Period 9 - Terminal white
};

// Firebase collection names
export const FIREBASE_COLLECTIONS = {
  BUSINESS_TRANSACTIONS: 'businessTransactions',
  PERSONAL_INCOME: 'personalIncome',
  PERSONAL_BILLS: 'personalBills',
  BILL_TEMPLATES: 'billTemplates',
};

// Storage paths
export const STORAGE_PATHS = {
  RECEIPTS: 'receipts',
};

// Application metadata
export const APP_INFO = {
  NAME: 'StepWeaver Cash Flow Tracker',
  VERSION: '1.0.0',
  DESCRIPTION: 'Personal and business cash flow tracking application',
};

// Local storage keys
export const LOCAL_STORAGE_KEYS = {
  BUSINESS_TRANSACTIONS: 'businessTransactions',
  PERSONAL_DATA: 'personalData',
  THEME: 'theme',
};

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection and try again.',
  FIREBASE: 'Database error. Please try again later.',
  FILE_UPLOAD: 'Failed to upload file. Please try again.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 10MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload images or PDF files.',
  VALIDATION: 'Please check your input and try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  TRANSACTION_ADDED: 'Transaction added successfully',
  TRANSACTION_UPDATED: 'Transaction updated successfully',
  TRANSACTION_DELETED: 'Transaction deleted successfully',
  BILL_ADDED: 'Bill added successfully',
  BILL_UPDATED: 'Bill updated successfully',
  BILL_DELETED: 'Bill deleted successfully',
  EXPORT_COMPLETE: 'Export completed successfully',
  FILE_UPLOADED: 'File uploaded successfully',
};

// Validation rules
export const VALIDATION = {
  REQUIRED_FIELD: 'This field is required',
  MIN_AMOUNT: 0,
  MAX_DESCRIPTION_LENGTH: 255,
  MAX_NOTES_LENGTH: 500,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL_REGEX: /^https?:\/\/.+/,
};

// Quick date range options
export const QUICK_DATE_RANGES = {
  THIS_MONTH: 'thisMonth',
  LAST_MONTH: 'lastMonth',
  THIS_YEAR: 'thisYear',
  LAST_YEAR: 'lastYear',
  LAST_30_DAYS: 'last30Days',
  LAST_90_DAYS: 'last90Days',
};

// Responsive breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
};

// Animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Z-index layers
export const Z_INDEX = {
  MODAL: 50,
  DROPDOWN: 40,
  HEADER: 30,
  OVERLAY: 20,
  NORMAL: 10,
};
