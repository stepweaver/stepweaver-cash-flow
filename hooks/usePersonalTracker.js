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
  const monthStr = String(month).padStart(2, '0');
  const key = `${year}-${monthStr}`;
  const sampleData = {
    [`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(
      2,
      '0'
    )}`]: {
      income: [
        {
          id: '1',
          source: 'PHM',
          date: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-08`,
          budget: 1662.23,
          actual: 1662.23,
          notes: 'Bi-weekly paycheck',
        },
        {
          id: '2',
          source: 'PHM',
          date: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-22`,
          budget: 1662.23,
          actual: 1662.23,
          notes: 'Bi-weekly paycheck',
        },
      ],
      bills: [
        {
          id: '1',
          name: 'Mortgage',
          dueDate: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-01`,
          amountDue: 554.39,
          amountPaid: 554.39,
          status: 'Pending',
          notes: 'Monthly mortgage payment',
          url: 'https://example.com/mortgage-login',
        },
        {
          id: '2',
          name: 'NIPSCO',
          dueDate: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-01`,
          amountDue: 90.0,
          amountPaid: 90.0,
          status: 'Paid',
          notes: 'Electric utility',
          url: 'https://nipsco.com/login',
        },
        {
          id: '3',
          name: 'Comcast',
          dueDate: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-15`,
          amountDue: 79.99,
          amountPaid: 79.99,
          status: 'Paid',
          notes: 'Internet service',
          url: 'https://customer.xfinity.com/login',
        },
        {
          id: '4',
          name: 'Water',
          dueDate: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-20`,
          amountDue: 45.0,
          amountPaid: 0,
          status: 'Pending',
          notes: 'Water utility',
          url: 'https://example.com/water-login',
        },
        {
          id: '5',
          name: 'Car Insurance',
          dueDate: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-25`,
          amountDue: 120.0,
          amountPaid: 0,
          status: 'Pending',
          notes: 'Auto insurance premium',
          url: 'https://example.com/insurance-login',
        },
      ],
    },
  };
  return sampleData[key] || { income: [], bills: [] };
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

        setPersonalData(data);
      } catch (error) {
        console.error('Error loading personal data:', error);
        // Fallback to localStorage if Firebase fails
        const savedData = localStorage.getItem('personalData');
        if (savedData) {
          setPersonalData(JSON.parse(savedData));
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
        await updatePersonalBill(editingItem.id, bill);
        setPersonalData((prev) => ({
          ...prev,
          bills: prev.bills.map((b) =>
            b.id === editingItem.id ? { ...bill, id: editingItem.id } : b
          ),
        }));

        // Update bill template if it exists
        const existingTemplate = billTemplates.find(
          (t) => t.name === bill.name
        );
        if (existingTemplate) {
          const templateUpdates = {
            amount: bill.amountDue,
            dueDate: bill.dueDate,
            notes: bill.notes,
            url: bill.url,
          };
          await updateBillTemplate(existingTemplate.id, templateUpdates);
        }

        setEditingItem(null);
        setShowBillModal(false);
      } else {
        const newBill = await addPersonalBill(bill);
        setPersonalData((prev) => ({
          ...prev,
          bills: [...prev.bills, newBill],
        }));

        // Add to bill templates if it doesn't exist
        const existingTemplate = billTemplates.find(
          (t) => t.name === bill.name
        );
        if (!existingTemplate) {
          const newTemplate = await addBillTemplate({
            name: bill.name,
            amount: bill.amountDue,
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
      const billToDelete = personalData.bills.find((b) => b.id === id);
      if (billToDelete) {
        await deletePersonalBillFromCurrentAndFuture(
          id,
          currentYear,
          currentMonth + 1
        );
        setPersonalData((prev) => ({
          ...prev,
          bills: prev.bills.filter((bill) => bill.id !== id),
        }));
      }
    } catch (error) {
      console.error('Error deleting bill:', error);
      throw error;
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updatedBill = await updatePersonalBill(id, { status: newStatus });
      setPersonalData((prev) => ({
        ...prev,
        bills: prev.bills.map((bill) =>
          bill.id === id ? { ...bill, status: newStatus } : bill
        ),
      }));
    } catch (error) {
      console.error('Error updating bill status:', error);
      throw error;
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
    setEditingItem(item);
    setModalType(type);
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
    personalData.income.forEach((income) => {
      const incomeDate = createLocalDate(income.date);
      if (incomeDate >= start && incomeDate <= end) {
        allTransactions.push({
          date: income.date,
          type: 'Income',
          description: income.source,
          amount: income.actual || income.budget,
          budget: income.budget,
          actual: income.actual,
          notes: income.notes,
          category: 'Income',
        });
      }
    });

    // Add bill transactions
    personalData.bills.forEach((bill) => {
      const billDate = createLocalDate(bill.dueDate);
      if (billDate >= start && billDate <= end) {
        allTransactions.push({
          date: bill.dueDate,
          type: 'Bill',
          description: bill.name,
          amount: bill.amountDue,
          amountPaid: bill.amountPaid,
          status: bill.status,
          notes: bill.notes,
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
    return personalData.bills.map((bill, index) => ({
      ...bill,
      colorIndex: index % 10, // 10 different colors
    }));
  };

  const getIncomeWithColors = () => {
    return personalData.income.map((income, index) => ({
      ...income,
      colorIndex: index % 10, // 10 different colors
    }));
  };

  const getColorClasses = (colorIndex) => {
    const colorSchemes = {
      0: 'border-l-[#8b949e]',
      1: 'border-l-[#00ff41]',
      2: 'border-l-[#ff55ff]',
      3: 'border-l-[#ffff00]',
      4: 'border-l-[#38beff]',
      5: 'border-l-[#56b6c2]',
      6: 'border-l-[#ffa500]',
      7: 'border-l-[#a855f7]',
      8: 'border-l-[#ff3e3e]',
      9: 'border-l-[#ffffff]',
    };
    return colorSchemes[colorIndex] || 'border-l-[#a855f7]'; // Default to light purple
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

  // Calculate summary statistics
  const totalIncomeBudget = personalData.income.reduce(
    (sum, item) => sum + (item.budget || 0),
    0
  );
  const totalIncomeActual = personalData.income.reduce(
    (sum, item) => sum + (item.actual || 0),
    0
  );
  const totalBillsDue = personalData.bills.reduce(
    (sum, item) => sum + (item.amountDue || 0),
    0
  );
  const totalBillsPaid = personalData.bills.reduce(
    (sum, item) => sum + (item.amountPaid || 0),
    0
  );

  // Income variance calculations
  const incomeVariance = totalIncomeActual - totalIncomeBudget;
  const incomeVariancePercent =
    totalIncomeBudget > 0 ? (incomeVariance / totalIncomeBudget) * 100 : 0;

  // Discretionary income calculation (actual income - bills paid)
  const discretionaryIncome = totalIncomeActual - totalBillsPaid;

  const netCashFlow = totalIncomeActual - totalBillsPaid;
  const pendingBillsCount = personalData.bills.filter(
    (bill) => bill.status === 'Pending'
  ).length;
  const paidBillsCount = personalData.bills.filter(
    (bill) => bill.status === 'Paid'
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
    getBackgroundColorClasses,

    // Actions
    changeMonth,
    handleSaveBill,
    handleSaveIncome,
    handleDeleteIncome,
    handleDeleteBill,
    handleStatusChange,
    openIncomeModal,
    openBillModal,
    editItem,
    handleExport,

    // Modal controls
    setShowIncomeModal,
    setShowBillModal,
    setEditingItem,
    setShowExportModal,
  };
}
