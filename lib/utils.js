// Shared utility functions for the application

// Helper function to format date as YYYY-MM-DD (user prefers this format)
export const formatDate = (date) => {
  if (!date) {
    return '';
  }

  // If it's already a string in YYYY-MM-DD format, return it as is
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  // If it's a Date object, format it
  if (date instanceof Date && !isNaN(date)) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // If it's a string that can be parsed as a date, try to convert it
  if (typeof date === 'string') {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate)) {
      const year = parsedDate.getFullYear();
      const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = parsedDate.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  return '';
};

// Helper function to format date for display (readable format)
export const formatDateForDisplay = (date) => {
  if (!(date instanceof Date) || isNaN(date)) {
    return '';
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper function to create a Date object from YYYY-MM-DD string in local timezone
export const createLocalDate = (dateString) => {
  if (!dateString || dateString.trim() === '') return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};

// Helper function to format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Helper function to get current date in YYYY-MM-DD format
export const getCurrentDateString = () => {
  return formatDate(new Date());
};

// Helper function to get first day of month
export const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1);
};

// Helper function to get last day of month
export const getLastDayOfMonth = (year, month) => {
  return new Date(year, month + 1, 0);
};

// Helper function to validate date string format (YYYY-MM-DD)
export const isValidDateString = (dateString) => {
  if (!dateString) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = createLocalDate(dateString);
  return formatDate(date) === dateString;
};

// Helper function to get month names
export const getMonthNames = () => [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper function to safely parse float
export const safeParseFloat = (value, defaultValue = 0) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Helper function to generate unique ID
export const generateUniqueId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};


