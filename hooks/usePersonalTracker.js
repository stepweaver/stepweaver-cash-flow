import { useState, useEffect } from 'react';
import { useTokenManager } from '@/lib/client-token-manager';
import { useAuth } from '@/lib/authContext';
import {
  exportToCSV,
  exportToJSON,
  generatePDFHTML,
  downloadFile,
} from '@/lib/exportUtils';
import {
  formatDate,
  createLocalDate,
  formatCurrency,
  getCurrentDateString,
  getMonthNames,
  safeParseFloat,
} from '@/lib/utils';

// Get initial personal data for the current month - matching Google Sheet structure
const getInitialPersonalData = (year, month) => {
  const currentDate = new Date();
  const requestedDate = new Date(year, month - 1, 1);

  // Only return sample data for current month, not for future months
  if (requestedDate > currentDate) {
    return {
      income: [],
      bills: [],
    };
  }

  // Return flat structure directly instead of nested month-keyed structure
  return {
    income: [
      {
        id: '1',
        source: 'PHM',
        date: `${year}-${String(month).padStart(2, '0')}-08`,
        budget: 1662.23,
        actual: 1662.23,
        notes: 'Bi-weekly paycheck',
      },
      {
        id: '2',
        source: 'PHM',
        date: `${year}-${String(month).padStart(2, '0')}-22`,
        budget: 1662.23,
        actual: 1662.23,
        notes: 'Bi-weekly paycheck',
      },
    ],
    bills: [
      {
        id: '1',
        name: 'Mortgage',
        dueDate: `${year}-${String(month).padStart(2, '0')}-01`,
        amountDue: 554.39,
        amountPaid: 554.39,
        status: 'Pending',
        notes: 'Monthly mortgage payment',
        url: 'https://example.com/mortgage-login',
      },
      {
        id: '2',
        name: 'NIPSCO',
        dueDate: `${year}-${String(month).padStart(2, '0')}-01`,
        amountDue: 90.0,
        amountPaid: 90.0,
        status: 'Paid',
        notes: 'Electric utility',
        url: 'https://nipsco.com/login',
      },
      {
        id: '3',
        name: 'Comcast',
        dueDate: `${year}-${String(month).padStart(2, '0')}-15`,
        amountDue: 79.99,
        amountPaid: 79.99,
        status: 'Paid',
        notes: 'Internet service',
        url: 'https://customer.xfinity.com/login',
      },
      {
        id: '4',
        name: 'Water',
        dueDate: `${year}-${String(month).padStart(2, '0')}-20`,
        amountDue: 45.0,
        amountPaid: 0,
        status: 'Pending',
        notes: 'Water utility',
        url: 'https://example.com/water-login',
      },
      {
        id: '5',
        name: 'Car Insurance',
        dueDate: `${year}-${String(month).padStart(2, '0')}-25`,
        amountDue: 120.0,
        amountPaid: 0,
        status: 'Pending',
        notes: 'Auto insurance premium',
        url: 'https://example.com/insurance-login',
      },
    ],
  };
};

export function usePersonalTracker() {
  // Initialize with current month and year
  // getMonth() returns 0-indexed (0-11), but we want to work with 1-indexed months (1-12)
  // So August (month 7) should become 8, September (month 8) should become 9, etc.
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [personalData, setPersonalData] = useState({ income: [], bills: [] });
  const [billTemplates, setBillTemplates] = useState([]);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState('income');
  const [editingType, setEditingType] = useState('income');
  const tokenManager = useTokenManager();
  const { user } = useAuth();

  // Export functionality
  const [showExportModal, setShowExportModal] = useState(false);

  // Load data function - moved outside useEffect so it can be reused
  const loadData = async (skipFutureMonthCheck = false) => {
    try {
      // Load bill templates
      // TODO: Implement bill templates API
      // const templates = await getBillTemplates();
      setBillTemplates([]);

      // Load personal data for the month
      // currentMonth is already 1-indexed (1-12), so use it directly
      const monthParam = currentMonth;

      const data = await tokenManager.getPersonalData();

      // Clear notes for future months (notes should not persist forward)
      const currentDate = new Date();
      // currentMonth is 1-indexed (1-12), but Date constructor expects 0-indexed (0-11)
      const viewingDate = new Date(currentYear, currentMonth - 1, 1);

      // More precise future month detection - only consider it future if it's the next month or later
      // Don't treat the current month as future
      const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const isActuallyFutureMonth = viewingDate > currentMonthStart;

      // Only clear bills for future months if we're not skipping the check (e.g., after generating bills)
      // AND if we're actually viewing a future month (not just the current month)
      const shouldClearBills = isActuallyFutureMonth && !skipFutureMonthCheck;

      if (shouldClearBills) {
        // For future months, start with empty bills array - bills must be generated manually
        data.bills = [];
        data.income = data.income.map((income) => ({
          ...income,
          notes: '', // Clear notes for future months
        }));
      } else if (isActuallyFutureMonth && skipFutureMonthCheck) {
        // Skipping future month bill clearing (bills were just generated)
      } else {
        // Not a future month or bills should be preserved
      }

      // Sort bills by due date
      if (data.bills) {
        data.bills.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return 1;
          return createLocalDate(a.dueDate) - createLocalDate(b.dueDate);
        });
      }

      // Ensure data has the expected structure with fallbacks
      const safeData = {
        income: data.income || [],
        bills: data.bills || [],
      };

      // Final check: if this is a future month, ensure bills array is empty (unless skipping)
      if (isActuallyFutureMonth && !skipFutureMonthCheck) {
        safeData.bills = [];
        // Also clear any income notes for future months
        safeData.income = safeData.income.map(income => ({
          ...income,
          notes: ''
        }));

        // Force the state update to ensure UI reflects empty bills
        // Additional safety: ensure we're not showing any bills for future months
        if (safeData.bills.length > 0) {
          safeData.bills = [];
        }
      } else if (isActuallyFutureMonth && skipFutureMonthCheck) {
        // Preserving generated bills in future month
      } else {
        // Preserving bills for current/past month
      }

      setPersonalData(safeData);
    } catch (error) {
      // Fallback to localStorage if Firebase fails
      const savedData = localStorage.getItem('personalData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          // Ensure parsed data has the expected structure
          const safeParsedData = {
            income: parsedData.income || [],
            bills: parsedData.bills || [],
          };
          setPersonalData(safeParsedData);
        } catch (parseError) {
          console.error('Error parsing localStorage data:', parseError);
          // Only load initial sample data for current month, not future months
          const currentDate = new Date();
          const viewingDate = new Date(currentYear, currentMonth, 1);

          if (viewingDate <= currentDate) {
            // Load initial sample data only for current/past months
            const monthParam = currentMonth + 1;
            const initialData = getInitialPersonalData(
              currentYear,
              monthParam
            );
            setPersonalData(initialData);
          } else {
            // For future months, start with empty data
            setPersonalData({ income: [], bills: [] });
          }
        }
      } else {
        // Only load initial sample data for current month, not future months
        const currentDate = new Date();
        const viewingDate = new Date(currentYear, currentMonth, 1);

        if (viewingDate <= currentDate) {
          // Load initial sample data only for current/past months
          const monthParam = currentMonth + 1;
          const initialData = getInitialPersonalData(
            currentYear,
            monthParam
          );
          setPersonalData(initialData);
        } else {
          // For future months, start with empty data
          setPersonalData({ income: [], bills: [] });
        }
      }
    }
  };

  // Load data from Firebase on mount and when month/year changes
  useEffect(() => {
    console.log('usePersonalTracker useEffect triggered:', { user: !!user, currentMonth, currentYear });

    // Don't load if user is not authenticated or if we're still loading
    if (!user || user === null) {
      console.log('User not authenticated, skipping data load');
      return;
    }
    console.log('Loading personal data...');
    loadData(); // Load data when month/year changes
  }, [currentMonth, currentYear, user]); // Depend on month and year changes and user authentication

  const changeMonth = (offset) => {
    // currentMonth is 1-indexed (1-12), but Date constructor expects 0-indexed (0-11)
    const newDate = new Date(currentYear, (currentMonth - 1) + offset, 1);
    // Convert back to 1-indexed for our state
    const newMonth = newDate.getMonth() + 1;
    const newYear = newDate.getFullYear();

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);

    // loadData will be called automatically by useEffect when state updates
  };

  const handleSaveBill = async (bill) => {
    try {
      if (editingItem) {
        // Map the bill data to the expected structure
        const billData = {
          ...bill,
          amountDue: bill.amount,
          amountPaid: bill.status === 'paid' ? bill.amount : 0, // 0 for null, pending, or any other status
        };

        await updatePersonalBill(editingItem.id, billData);
        setPersonalData((prev) => ({
          ...prev,
          bills: (prev.bills || []).map((b) =>
            b.id === editingItem.id ? { ...billData, id: editingItem.id } : b
          ),
        }));

        // Update bill template if it exists
        const existingTemplate = billTemplates.find(
          (t) => t.name === bill.name
        );
        if (existingTemplate) {
          const templateUpdates = {
            amount: bill.amount,
            dueDate: bill.dueDate,
            notes: bill.notes || '',
            url: bill.url || '',
          };
          // TODO: Implement bill template update API
          // await updateBillTemplate(existingTemplate.id, templateUpdates);
        }

        setEditingItem(null);
        setShowBillModal(false);
      } else {
        // Map the bill data to the expected structure
        const billData = {
          ...bill,
          amountDue: bill.amount,
          amountPaid: bill.status === 'paid' ? bill.amount : 0, // 0 for null, pending, or any other status
        };

        const newBill = await createPersonalBill(billData);
        setPersonalData((prev) => ({
          ...prev,
          bills: [...(prev.bills || []), newBill],
        }));

        // Add to bill templates if it doesn't exist
        const existingTemplate = billTemplates.find(
          (t) => t.name === bill.name
        );
        if (!existingTemplate) {
          // TODO: Implement bill template creation API
          // const newTemplate = await addBillTemplate({
          //   name: bill.name,
          //   amount: bill.amount,
          //   dueDate: bill.dueDate,
          //   notes: bill.notes || '',
          //   url: bill.url || '',
          // });
          // setBillTemplates((prev) => [...prev, newTemplate]);
        }

        setShowBillModal(false);
      }
    } catch (error) {
      console.error('Error saving bill:', error);
      throw error;
    }
  };

  const handleSaveIncome = async (incomeData) => {
    try {
      if (editingItem) {
        await updatePersonalBill(editingItem.id, incomeData);
        setPersonalData((prev) => ({
          ...prev,
          income: prev.income.map((i) =>
            i.id === editingItem.id ? { ...incomeData, id: editingItem.id } : i
          ),
        }));
        setEditingItem(null);
        setShowIncomeModal(false);
      } else {
        const newIncome = await createPersonalIncome(incomeData);
        setPersonalData((prev) => ({
          ...prev,
          income: [...prev.income, newIncome],
        }));
        setShowIncomeModal(false);
      }
    } catch (error) {
      console.error('Error saving income:', error);
      throw error;
    }
  };

  const handleDeleteIncome = async (id) => {
    try {
      await deletePersonalIncome(id);
      setPersonalData((prev) => ({
        ...prev,
        income: prev.income.filter((item) => item.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting income:', error);
      throw error;
    }
  };

  const handleDeleteBill = async (id) => {
    try {
      await deletePersonalBill(id);
      setPersonalData((prev) => ({
        ...prev,
        bills: (prev.bills || []).filter((bill) => bill.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting bill:', error);
      throw error;
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Find the bill to get its amount
      const bill = (personalData?.bills || []).find((b) => b.id === id);
      if (!bill) return;

      // Update amountPaid based on status
      let amountPaid = 0;
      if (newStatus === 'paid') {
        amountPaid = bill.amountDue;
      } else if (newStatus === 'pending') {
        amountPaid = 0; // Pending bills haven't been paid yet
      }
      // For null status (-), amountPaid remains 0

      const updatedBill = await updatePersonalBill(id, {
        status: newStatus,
        amountPaid: amountPaid
      });

      setPersonalData((prev) => ({
        ...prev,
        bills: (prev.bills || []).map((bill) =>
          bill.id === id ? { ...bill, status: newStatus, amountPaid: amountPaid } : bill
        ),
      }));
    } catch (error) {
      console.error('Error updating bill status:', error);
      throw error;
    }
  };

  // Bill template handlers
  const handleSaveTemplate = async (template) => {
    try {
      // TODO: Implement bill template creation API
      // await addBillTemplate(template);
      await loadData(); // Reload data to reflect changes
    } catch (error) {
      console.error('Error saving bill template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      // TODO: Implement bill template deletion API
      // await deleteBillTemplate(templateId);
      await loadData(); // Reload data to reflect changes
    } catch (error) {
      console.error('Error deleting bill template:', error);
    }
  };

  const handleUpdateTemplate = async (templateId, updatedTemplate) => {
    try {
      // TODO: Implement bill template update API
      // await updateBillTemplate(templateId, updatedTemplate);
      await loadData(); // Reload data to reflect changes
    } catch (error) {
      console.error('Error updating bill template:', error);
    }
  };

  const handleGenerateBills = async (month, year) => {
    try {
      // TODO: Implement bill generation API
      // await generateBillsForMonth(year, month, billTemplates);
      await loadData(true); // Reload data to reflect changes, skip future month check
    } catch (error) {
      console.error('Error generating bills:', error);
    }
  };



  const openIncomeModal = () => {
    setModalType('income');
    setEditingItem(null);
    setShowIncomeModal(true);
  };

  const openBillModal = () => {
    setModalType('bill');
    setEditingItem(null);
    setShowBillModal(true);
  };

  const editItem = (item, type) => {
    // Close any open modals first
    setShowIncomeModal(false);
    setShowBillModal(false);

    // Set the editing state
    setEditingItem(item);
    setModalType(type);
    setEditingType(type);

    // Open the appropriate modal
    if (type === 'income') {
      setShowIncomeModal(true);
    } else {
      setShowBillModal(true);
    }
  };

  const getTransactionsForExport = (startDate, endDate) => {
    const start = createLocalDate(startDate);
    const end = createLocalDate(endDate);

    const allTransactions = [];

    // Add income transactions
    (personalData?.income || []).forEach((income) => {
      const incomeDate = createLocalDate(income.date);
      if (incomeDate >= start && incomeDate <= end) {
        allTransactions.push({
          date: income.date,
          type: 'Income',
          description: income.source,
          amount: income.actual || income.budget || 0,
          budget: income.budget || 0,
          actual: income.actual || income.budget || 0,
          notes: income.notes || '',
          category: 'Income',
        });
      }
    });

    // Add bill transactions
    (personalData?.bills || []).forEach((bill) => {
      const billDate = createLocalDate(bill.dueDate);
      if (billDate >= start && billDate <= end) {
        allTransactions.push({
          date: bill.dueDate,
          type: 'Bill',
          description: bill.name,
          amount: bill.amountDue || bill.amount || 0,
          amountPaid: bill.amountPaid || 0,
          status: bill.status || 'pending',
          notes: bill.notes || '',
          category: 'Bills',
        });
      }
    });

    // Sort by date
    allTransactions.sort((a, b) => createLocalDate(a.date) - createLocalDate(b.date));

    return allTransactions;
  };

  const handleExport = async ({
    startDate,
    endDate,
    format,
    includeReceipts,
  }) => {
    const exportTransactions = getTransactionsForExport(startDate, endDate);

    if (exportTransactions.length === 0) {
      throw new Error('No transactions found in the selected date range.');
    }

    const dateRange = `${startDate}_to_${endDate}`;

    try {
      switch (format) {
        case 'csv':
          exportToCSV(
            exportTransactions,
            `personal_transactions_${dateRange}.csv`
          );
          break;
        case 'json':
          exportToJSON(
            exportTransactions,
            `personal_transactions_${dateRange}.json`
          );
          break;
        case 'pdf':
          const htmlContent = generatePDFHTML(
            exportTransactions,
            `Personal Transactions (${startDate} to ${endDate})`
          );
          downloadFile(
            htmlContent,
            `personal_transactions_${dateRange}.html`,
            'text/html'
          );
          break;
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  };

  const getBillsWithColorCoding = () => {
    const bills = personalData?.bills || [];

    // Sort bills by due date first, then by amount (bills without due dates go to the end)
    const sortedBills = [...bills].sort((a, b) => {
      // If both bills have due dates, sort by date first, then by amount
      if (a.dueDate && b.dueDate) {
        const dateComparison = createLocalDate(a.dueDate) - createLocalDate(b.dueDate);
        if (dateComparison !== 0) return dateComparison;

        // If dates are the same, sort by amount (higher amounts first)
        const amountA = a.amountDue || a.amount || 0;
        const amountB = b.amountDue || b.amount || 0;
        return amountB - amountA;
      }
      // If only one has a due date, the one with a date comes first
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;

      // If neither has a due date, sort by amount (higher amounts first)
      const amountA = a.amountDue || a.amount || 0;
      const amountB = b.amountDue || b.amount || 0;
      return amountB - amountA;
    });

    return sortedBills.map((bill) => {
      // Ensure bill has required properties with fallbacks
      const safeBill = {
        ...bill,
        amountDue: bill.amountDue || bill.amount || 0,
        amountPaid: bill.amountPaid || 0,
        status: bill.status || null, // Don't default to 'pending', allow null
        dueDate: bill.dueDate || '',
      };

      // If no due date, use muted color
      if (!safeBill.dueDate) {
        return { ...safeBill, colorIndex: 0 }; // Muted
      }

      // Get the income dates for this month to determine color coordination
      const currentMonthIncome = [...(personalData?.income || [])].sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return dateA - dateB;
      });

      // Color bills based on due date to coordinate with income periods
      const dueDate = new Date(safeBill.dueDate);

      // Find which income period this bill falls into
      let colorIndex = 0; // Default to muted

      for (let i = 0; i < currentMonthIncome.length; i++) {
        const incomeDate = new Date(currentMonthIncome[i].date);
        if (dueDate >= incomeDate) {
          // Map to color scheme: 1=green, 2=purple, 3=blue, 4=yellow, etc.
          colorIndex = i + 1;
        } else {
          break; // Bill is before this income period
        }
      }

      // If colorIndex exceeds our color scheme, wrap around or use muted
      if (colorIndex > 9) {
        colorIndex = 0; // Muted
      }

      return { ...safeBill, colorIndex };
    });
  };

  const getIncomeWithColors = () => {
    // Sort income by date to ensure proper color coordination
    const sortedIncome = [...(personalData?.income || [])].sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return dateA - dateB;
    });

    return sortedIncome.map((income, index) => {
      // Ensure income has required properties with fallbacks
      const safeIncome = {
        ...income,
        budget: income.budget || 0,
        actual: income.actual || income.budget || 0,
        date: income.date || new Date().toISOString().split('T')[0],
      };

      // Map index to color scheme: 0=muted, 1=green, 2=purple, 3=blue, 4=yellow, etc.
      const colorIndex = index === 0 ? 1 : index === 1 ? 2 : index === 2 ? 3 : index === 3 ? 4 : index === 4 ? 5 : index === 5 ? 6 : index === 6 ? 7 : index === 7 ? 8 : index === 8 ? 9 : 0;

      return { ...safeIncome, colorIndex };
    });
  };

  // Computed color coordination
  const billsWithColorCoding = getBillsWithColorCoding();
  const incomeWithColors = getIncomeWithColors();

  const getColorClasses = (colorIndex) => {
    const colorSchemes = {
      0: 'border-l-4 border-l-terminal-muted', // Muted gray
      1: 'border-l-4 border-l-terminal-green', // Green
      2: 'border-l-4 border-l-terminal-purple', // Magenta/Purple
      3: 'border-l-4 border-l-terminal-blue', // Blue
      4: 'border-l-4 border-l-terminal-yellow', // Yellow
      5: 'border-l-4 border-l-terminal-cyan', // Cyan
      6: 'border-l-4 border-l-terminal-orange', // Orange
      7: 'border-l-4 border-l-terminal-red', // Red
      8: 'border-l-4 border-l-terminal-pink', // Pink
      9: 'border-l-4 border-l-terminal-white', // White
    };
    return colorSchemes[colorIndex] || 'border-l-4 border-l-terminal-purple'; // Default to purple
  };

  // Alternative function that returns inline styles if Tailwind classes aren't working
  const getColorStyles = (colorIndex) => {
    const colorSchemes = {
      0: { borderLeft: '4px solid #8b949e' }, // Muted gray
      1: { borderLeft: '4px solid #00ff41' }, // Green
      2: { borderLeft: '4px solid #a855f7' }, // Purple
      3: { borderLeft: '4px solid #38beff' }, // Blue
      4: { borderLeft: '4px solid #ffff00' }, // Yellow
      5: { borderLeft: '4px solid #56b6c2' }, // Cyan
      6: { borderLeft: '4px solid #ffa500' }, // Orange
      7: { borderLeft: '4px solid #ff3e3e' }, // Red
      8: { borderLeft: '4px solid #ff55ff' }, // Pink
      9: { borderLeft: '4px solid #ffffff' }, // White
    };
    return colorSchemes[colorIndex] || { borderLeft: '4px solid #a855f7' }; // Default to purple
  };

  const getBackgroundColorClasses = (colorIndex) => {
    const bgColorSchemes = {
      0: 'bg-terminal-muted/5',
      1: 'bg-terminal-green/5',
      2: 'bg-terminal-purple/5',
      3: 'bg-terminal-blue/5',
      4: 'bg-terminal-yellow/5',
      5: 'bg-terminal-cyan/5',
      6: 'bg-terminal-orange/5',
      7: 'bg-terminal-red/5',
      8: 'bg-terminal-pink/5',
      9: 'bg-terminal-white/5',
    };
    return bgColorSchemes[colorIndex] || 'bg-terminal-purple/5'; // Default to light purple
  };

  // Calculate summary statistics with defensive programming
  const totalIncomeBudget = (personalData?.income || []).reduce(
    (sum, item) => sum + (parseFloat(item.budget) || 0),
    0
  );
  const totalIncomeActual = (personalData?.income || []).reduce(
    (sum, item) => sum + (parseFloat(item.actual) || parseFloat(item.budget) || 0),
    0
  );
  const totalBillsDue = (personalData?.bills || []).reduce(
    (sum, item) => sum + (parseFloat(item.amountDue) || parseFloat(item.amount) || 0),
    0
  );
  const totalBillsPaid = (personalData?.bills || []).reduce(
    (sum, item) => sum + (parseFloat(item.amountPaid) || 0),
    0
  );

  // Income variance calculations with defensive programming
  const incomeVariance = totalIncomeActual - totalIncomeBudget;
  const incomeVariancePercent =
    totalIncomeBudget > 0 ? (incomeVariance / totalIncomeBudget) * 100 : 0;

  // Discretionary income calculation (income budget - bills due)
  const discretionaryIncome = totalIncomeBudget - totalBillsDue;

  const netCashFlow = totalIncomeActual - totalBillsPaid;
  const pendingBillsCount = (personalData?.bills || []).filter(
    (bill) => bill.status === 'pending'
  ).length;
  const paidBillsCount = (personalData?.bills || []).filter(
    (bill) => bill.status === 'paid'
  ).length;
  const unsetBillsCount = (personalData?.bills || []).filter(
    (bill) => bill.status === null || bill.status === undefined
  ).length;

  const monthNames = getMonthNames();

  return {
    // State
    currentMonth,
    currentYear,
    personalData,
    billTemplates,
    showIncomeModal,
    showBillModal,
    editingItem,
    modalType,
    editingType,
    showExportModal,

    // Computed values
    totalIncomeBudget,
    totalIncomeActual,
    totalBillsDue,
    totalBillsPaid,
    incomeVariance,
    incomeVariancePercent,
    discretionaryIncome,
    netCashFlow,
    pendingBillsCount,
    paidBillsCount,
    unsetBillsCount,
    monthNames,

    // Color coding
    getBillsWithColorCoding,
    getIncomeWithColors,
    getColorClasses,
    getColorStyles,
    getBackgroundColorClasses,

    // Computed color-coded data
    billsWithColorCoding,
    incomeWithColors,

    // Actions
    changeMonth,
    handleSaveBill,
    handleSaveIncome,
    handleDeleteIncome,
    handleDeleteBill,
    handleStatusChange,
    handleSaveTemplate,
    handleDeleteTemplate,
    handleUpdateTemplate,
    handleGenerateBills,
    openIncomeModal,
    openBillModal,
    editItem,
    handleExport,
    loadData,

    // Modal controls
    setShowIncomeModal,
    setShowBillModal,
    setEditingItem,
    setEditingType,
    setShowExportModal,
  };
}
