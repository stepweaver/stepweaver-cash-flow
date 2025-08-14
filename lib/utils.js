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
export const createLocalDate = (dateInput) => {
  if (!dateInput) return null;

  // If it's already a Date object, return it
  if (dateInput instanceof Date) {
    if (isNaN(dateInput)) return null;
    return dateInput;
  }

  // Convert to string and handle various input types
  const dateString = String(dateInput);
  if (!dateString || dateString.trim() === '' || dateString === 'Invalid Date') return null;

  // Handle ISO date strings (YYYY-MM-DDTHH:mm:ss.sssZ)
  if (dateString.includes('T')) {
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate) ? null : parsedDate;
  }

  // Handle YYYY-MM-DD format
  if (dateString.includes('-')) {
    const [year, month, day] = dateString.split('-').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    return new Date(year, month - 1, day); // month is 0-indexed
  }

  // Try to parse as a general date
  const parsedDate = new Date(dateString);
  return isNaN(parsedDate) ? null : parsedDate;
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

// Helper function to debounce function calls
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Helper function to throttle function calls
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Helper function to validate email format
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Helper function to validate URL format
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Helper function to truncate text
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Helper function to capitalize first letter
export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Helper function to format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
