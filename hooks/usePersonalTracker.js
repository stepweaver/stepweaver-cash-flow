import { useState, useEffect } from 'react';
import {
  getPersonalData,
  addPersonalIncome,
  addPersonalBill,
  updatePersonalBill,
  deletePersonalIncome,
  deletePersonalBill,
  getBillTemplates,
  addBillTemplate,
  updateBillTemplate,
  deleteBillTemplate,
  deletePersonalBillFromCurrentAndFuture,
  generateBillsForMonth,
} from '@/lib/firebase';
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
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [personalData, setPersonalData] = useState({ income: [], bills: [] });
  const [billTemplates, setBillTemplates] = useState([]);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState('income');
  const [editingType, setEditingType] = useState('income');

  // Export functionality
  const [showExportModal, setShowExportModal] = useState(false);

  // Load data from Firebase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load bill templates
        const templates = await getBillTemplates();
        setBillTemplates(templates);

        // Load personal data for the month
        const data = await getPersonalData(currentYear, currentMonth + 1);

        // Debug logging to help identify data structure issues
        console.log('Loaded personal data:', data);
        if (data.bills && data.bills.length > 0) {
          console.log('Sample bill structure:', data.bills[0]);
        }
        if (data.income && data.income.length > 0) {
          console.log('Sample income structure:', data.income[0]);
        }

        // Generate bills from templates if needed (for future months)
        const currentDate = new Date();
        const viewingDate = new Date(currentYear, currentMonth, 1);

        if (viewingDate >= currentDate) {
          // Only auto-generate for current month and future months
          const generatedBills = await generateBillsForMonth(
            currentYear,
            currentMonth + 1,
            templates
          );
          if (generatedBills.length > 0) {
            data.bills = [...data.bills, ...generatedBills];
          }
        }

        // Clear notes for future months (notes should not persist forward)
        if (viewingDate > currentDate) {
          data.bills = data.bills.map((bill) => ({
            ...bill,
            notes: '', // Clear notes for future months
          }));
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

        setPersonalData(safeData);
      } catch (error) {
        console.error('Error loading personal data:', error);
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
            // Load initial sample data if parsing fails
            const initialData = getInitialPersonalData(
              currentYear,
              currentMonth + 1
            );
            setPersonalData(initialData);
          }
        } else {
          // Load initial sample data
          const initialData = getInitialPersonalData(
            currentYear,
            currentMonth + 1
          );
          setPersonalData(initialData);
        }
      }
    };

    loadData();
  }, [currentYear, currentMonth]);

  const changeMonth = (offset) => {
    const newDate = new Date(currentYear, currentMonth + offset, 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  const handleSaveBill = async (bill) => {
    try {
      if (editingItem) {
        // Map the bill data to the expected structure
        const billData = {
          ...bill,
          amountDue: bill.amount,
          amountPaid: bill.status === 'paid' ? bill.amount : 0,
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
            notes: bill.notes,
            url: bill.url,
          };
          await updateBillTemplate(existingTemplate.id, templateUpdates);
        }

        setEditingItem(null);
        setShowBillModal(false);
      } else {
        // Map the bill data to the expected structure
        const billData = {
          ...bill,
          amountDue: bill.amount,
          amountPaid: bill.status === 'paid' ? bill.amount : 0,
        };

        const newBill = await addPersonalBill(billData);
        setPersonalData((prev) => ({
          ...prev,
          bills: [...(prev.bills || []), newBill],
        }));

        // Add to bill templates if it doesn't exist
        const existingTemplate = billTemplates.find(
          (t) => t.name === bill.name
        );
        if (!existingTemplate) {
          const newTemplate = await addBillTemplate({
            name: bill.name,
            amount: bill.amount,
            dueDate: bill.dueDate,
            notes: bill.notes,
            url: bill.url,
          });
          setBillTemplates((prev) => [...prev, newTemplate]);
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
        const newIncome = await addPersonalIncome(incomeData);
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
      const billToDelete = (personalData?.bills || []).find((b) => b.id === id);
      if (billToDelete) {
        await deletePersonalBillFromCurrentAndFuture(
          id,
          currentYear,
          currentMonth + 1
        );
        setPersonalData((prev) => ({
          ...prev,
          bills: (prev.bills || []).filter((bill) => bill.id !== id),
        }));
      }
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
      const amountPaid = newStatus === 'paid' ? bill.amountDue : 0;

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
      await addBillTemplate(template);
      await loadData(); // Reload data to reflect changes
    } catch (error) {
      console.error('Error saving bill template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await deleteBillTemplate(templateId);
      await loadData(); // Reload data to reflect changes
    } catch (error) {
      console.error('Error deleting bill template:', error);
    }
  };

  const handleUpdateTemplate = async (templateId, updatedTemplate) => {
    try {
      await updateBillTemplate(templateId, updatedTemplate);
      await loadData(); // Reload data to reflect changes
    } catch (error) {
      console.error('Error updating bill template:', error);
    }
  };

  const handleGenerateBills = async (month, year) => {
    try {
      await generateBillsForMonth(month, year);
      await loadData(); // Reload data to reflect changes
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
    return (personalData?.bills || []).map((bill) => {
      // Ensure bill has required properties with fallbacks
      const safeBill = {
        ...bill,
        amountDue: bill.amountDue || bill.amount || 0,
        amountPaid: bill.amountPaid || 0,
        status: bill.status || 'pending',
        dueDate: bill.dueDate || new Date().toISOString().split('T')[0],
      };

      // Get the income dates for this month to determine color coordination
      const currentMonthIncome = personalData?.income || [];
      const firstIncomeDate = currentMonthIncome[0]?.date;
      const secondIncomeDate = currentMonthIncome[1]?.date;

      // Color bills based on due date to coordinate with income periods
      const dueDate = new Date(safeBill.dueDate);
      const firstIncome = firstIncomeDate ? new Date(firstIncomeDate) : null;
      const secondIncome = secondIncomeDate ? new Date(secondIncomeDate) : null;

      // Period 0: Before first income date (muted)
      if (firstIncome && dueDate < firstIncome) {
        return { ...safeBill, colorIndex: 0 }; // Muted
      }
      // First income period: On or after first income date, but before second income date (green)
      else if (firstIncome && dueDate >= firstIncome && (!secondIncome || dueDate < secondIncome)) {
        return { ...safeBill, colorIndex: 1 }; // Green
      }
      // Second income period: On or after second income date (magenta)
      else if (secondIncome && dueDate >= secondIncome) {
        return { ...safeBill, colorIndex: 2 }; // Magenta
      }
      // Fallback: If no income dates, use muted
      else {
        return { ...safeBill, colorIndex: 0 }; // Muted
      }
    });
  };

  const getIncomeWithColors = () => {
    return (personalData?.income || []).map((income, index) => {
      // Ensure income has required properties with fallbacks
      const safeIncome = {
        ...income,
        budget: income.budget || 0,
        actual: income.actual || income.budget || 0,
        date: income.date || new Date().toISOString().split('T')[0],
      };

      // First income period (around day 8) - green
      if (index === 0) {
        return { ...safeIncome, colorIndex: 1 }; // Green
      }
      // Second income period (around day 22) - magenta
      else if (index === 1) {
        return { ...safeIncome, colorIndex: 2 }; // Magenta
      }
      // Default to muted for any additional periods
      else {
        return { ...safeIncome, colorIndex: 0 }; // Muted
      }
    });
  };

  // Computed color coordination
  const billsWithColorCoding = getBillsWithColorCoding();
  const incomeWithColors = getIncomeWithColors();

  const getColorClasses = (colorIndex) => {
    const colorSchemes = {
      0: 'border-l-4 border-l-gray-400', // Muted gray
      1: 'border-l-4 border-l-green-400', // Green
      2: 'border-l-4 border-l-pink-400', // Magenta
      3: 'border-l-4 border-l-yellow-400', // Yellow
      4: 'border-l-4 border-l-blue-400', // Blue
      5: 'border-l-4 border-l-cyan-400', // Cyan
      6: 'border-l-4 border-l-orange-400', // Orange
      7: 'border-l-4 border-l-purple-400', // Purple
      8: 'border-l-4 border-l-red-400', // Red
      9: 'border-l-4 border-l-white', // White
    };
    return colorSchemes[colorIndex] || 'border-l-4 border-l-purple-400'; // Default to purple
  };

  // Alternative function that returns inline styles if Tailwind classes aren't working
  const getColorStyles = (colorIndex) => {
    const colorSchemes = {
      0: { borderLeft: '4px solid #9ca3af' }, // Muted gray
      1: { borderLeft: '4px solid #4ade80' }, // Green
      2: { borderLeft: '4px solid #f472b6' }, // Magenta
      3: { borderLeft: '4px solid #facc15' }, // Yellow
      4: { borderLeft: '4px solid #60a5fa' }, // Blue
      5: { borderLeft: '4px solid #22d3ee' }, // Cyan
      6: { borderLeft: '4px solid #fb923c' }, // Orange
      7: { borderLeft: '4px solid #a78bfa' }, // Purple
      8: { borderLeft: '4px solid #f87171' }, // Red
      9: { borderLeft: '4px solid #ffffff' }, // White
    };
    return colorSchemes[colorIndex] || { borderLeft: '4px solid #a78bfa' }; // Default to purple
  };

  const getBackgroundColorClasses = (colorIndex) => {
    const bgColorSchemes = {
      0: 'bg-[#8b949e]/5',
      1: 'bg-[#00ff41]/5',
      2: 'bg-[#ff55ff]/5',
      3: 'bg-[#ffff00]/5',
      4: 'bg-[#38beff]/5',
      5: 'bg-[#56b6c2]/5',
      6: 'bg-[#ffa500]/5',
      7: 'bg-[#a855f7]/5',
      8: 'bg-[#ff3e3e]/5',
      9: 'bg-[#ffffff]/5',
    };
    return bgColorSchemes[colorIndex] || 'bg-[#a855f7]/5'; // Default to light purple
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

  // Discretionary income calculation (actual income - bills paid)
  const discretionaryIncome = totalIncomeActual - totalBillsPaid;

  const netCashFlow = totalIncomeActual - totalBillsPaid;
  const pendingBillsCount = (personalData?.bills || []).filter(
    (bill) => (bill.status || '').toLowerCase() === 'pending'
  ).length;
  const paidBillsCount = (personalData?.bills || []).filter(
    (bill) => (bill.status || '').toLowerCase() === 'paid'
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

    // Modal controls
    setShowIncomeModal,
    setShowBillModal,
    setEditingItem,
    setEditingType,
    setShowExportModal,
  };
}
