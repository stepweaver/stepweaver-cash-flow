'use client';

import { useState, useEffect } from 'react';
import {
  Trash2,
  Plus,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Edit3,
} from 'lucide-react';
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
} from '../lib/firebase';
import DateRangePicker from './DateRangePicker';
import {
  exportToCSV,
  exportToJSON,
  generatePDFHTML,
  downloadFile,
} from '../lib/exportUtils';

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
  if (!(date instanceof Date) || isNaN(date)) {
    return '';
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to create a Date object from YYYY-MM-DD string in local timezone
const createLocalDate = (dateString) => {
  if (!dateString) return new Date();
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

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
          name: 'H.E.L.P. (medical)',
          dueDate: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-01`,
          amountDue: 25.0,
          amountPaid: 25.0,
          status: 'Paid',
          notes: 'Medical payment plan',
        },
        {
          id: '4',
          name: 'Day Care',
          dueDate: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-01`,
          amountDue: 60.0,
          amountPaid: 60.0,
          status: 'Paid',
          notes: 'Childcare payment',
        },
        {
          id: '5',
          name: 'Car Insurance',
          dueDate: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-04`,
          amountDue: 196.0,
          amountPaid: 196.0,
          status: 'Paid',
          notes: 'Auto insurance',
        },
        {
          id: '6',
          name: 'Liability Insurance',
          dueDate: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-04`,
          amountDue: 26.16,
          amountPaid: 26.16,
          status: 'Paid',
          notes: 'Business liability',
        },
        {
          id: '7',
          name: 'USAA',
          dueDate: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-11`,
          amountDue: 67.0,
          amountPaid: null,
          status: 'Pending',
          notes: 'Credit card payment',
        },
        {
          id: '8',
          name: 'Hulu + Disney',
          dueDate: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-13`,
          amountDue: 10.99,
          amountPaid: null,
          status: 'Pending',
          notes: 'Streaming services',
        },
        {
          id: '9',
          name: 'Spotify',
          dueDate: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-13`,
          amountDue: 15.99,
          amountPaid: null,
          status: 'Pending',
          notes: 'Music streaming',
        },
        {
          id: '10',
          name: 'Mortgage',
          dueDate: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-15`,
          amountDue: 554.39,
          amountPaid: null,
          status: 'Pending',
          notes: 'Monthly mortgage payment',
        },
      ],
    },
  };
  return sampleData[key] || { income: [], bills: [] };
};

export default function PersonalTracker() {
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
            if (!b.dueDate) return -1;
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

  // Note: We no longer save to localStorage automatically since we're using Firebase
  // Data is saved directly to Firebase when changes are made

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
            name: bill.name,
            defaultAmount: bill.amountDue,
            defaultDueDay: bill.dueDate
              ? parseInt(bill.dueDate.split('-')[2])
              : 1,
            url: bill.url,
          };
          await updateBillTemplate(existingTemplate.id, templateUpdates);
          setBillTemplates((prev) =>
            prev.map((t) =>
              t.id === existingTemplate.id ? { ...t, ...templateUpdates } : t
            )
          );
        }
      } else {
        const savedBill = await addPersonalBill(bill);
        setPersonalData((prev) => ({
          ...prev,
          bills: [...prev.bills, savedBill],
        }));

        // Create a new bill template for forward persistence (without notes)
        const newTemplate = {
          name: bill.name,
          defaultAmount: bill.amountDue,
          defaultDueDay: bill.dueDate
            ? parseInt(bill.dueDate.split('-')[2])
            : 1,
          url: bill.url,
        };
        const savedTemplate = await addBillTemplate(newTemplate);
        setBillTemplates((prev) => [...prev, savedTemplate]);
      }
      setShowBillModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving bill:', error);
      alert('Failed to save bill. Please try again.');
    }
  };

  const handleSaveIncome = async (incomeData) => {
    try {
      if (editingItem) {
        // For income updates, we'll need to implement updatePersonalIncome
        // For now, we'll delete and recreate
        await deletePersonalIncome(editingItem.id);
        const savedIncome = await addPersonalIncome(incomeData);
        setPersonalData((prev) => ({
          ...prev,
          income: prev.income.map((i) =>
            i.id === editingItem.id ? savedIncome : i
          ),
        }));
      } else {
        const savedIncome = await addPersonalIncome(incomeData);
        setPersonalData((prev) => ({
          ...prev,
          income: [...prev.income, savedIncome],
        }));
      }
      setShowIncomeModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving income:', error);
      alert('Failed to save income. Please try again.');
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
      alert('Failed to delete income. Please try again.');
    }
  };

  const handleDeleteBill = async (id) => {
    try {
      const billToDelete = personalData.bills.find((b) => b.id === id);
      if (!billToDelete) return;

      // Use forward persistence delete - removes from current month forward only
      await deletePersonalBillFromCurrentAndFuture(
        billToDelete.name,
        currentYear,
        currentMonth + 1
      );

      // Update local state
      setPersonalData((prev) => ({
        ...prev,
        bills: prev.bills.filter((item) => item.id !== id),
      }));

      // Remove from templates
      setBillTemplates((prev) =>
        prev.filter((t) => t.name !== billToDelete.name)
      );
    } catch (error) {
      console.error('Error deleting bill:', error);
      alert('Failed to delete bill. Please try again.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updatePersonalBill(id, { status: newStatus });
      setPersonalData((prev) => ({
        ...prev,
        bills: prev.bills.map((bill) =>
          bill.id === id ? { ...bill, status: newStatus } : bill
        ),
      }));
    } catch (error) {
      console.error('Error updating bill status:', error);
      alert('Failed to update bill status. Please try again.');
    }
  };

  const openIncomeModal = () => {
    setModalType('income');
    setShowIncomeModal(true);
    setEditingItem(null);
  };

  const openBillModal = () => {
    setModalType('bill');
    setShowBillModal(true);
    setEditingItem(null);
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

  // Export functions
  const getTransactionsForExport = (startDate, endDate) => {
    const start = createLocalDate(startDate);
    const end = createLocalDate(endDate);

    const transactions = [];

    // Add income entries as transactions
    personalData.income.forEach((income) => {
      const incomeDate = createLocalDate(income.date);
      if (incomeDate >= start && incomeDate <= end) {
        transactions.push({
          id: income.id,
          date: incomeDate,
          type: 'income',
          description: `Income from ${income.source}`,
          amount: income.actual || income.budget || 0,
          notes: income.notes || '',
          source: income.source,
          budget: income.budget,
          actual: income.actual,
        });
      }
    });

    // Add bills as transactions
    personalData.bills.forEach((bill) => {
      if (bill.dueDate) {
        const billDate = createLocalDate(bill.dueDate);
        if (billDate >= start && billDate <= end) {
          transactions.push({
            id: bill.id,
            date: billDate,
            type: 'bill',
            description: bill.name,
            amount: -(bill.amountPaid || bill.amountDue || 0), // Negative for expenses
            notes: bill.notes || '',
            amountDue: bill.amountDue,
            amountPaid: bill.amountPaid,
            status: bill.status,
          });
        }
      }
    });

    // Sort by date
    return transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const handleExport = async ({
    startDate,
    endDate,
    format,
    includeReceipts,
  }) => {
    const exportTransactions = getTransactionsForExport(startDate, endDate);

    if (exportTransactions.length === 0) {
      alert('No transactions found in the selected date range.');
      return;
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

  // Helper function to assign bills to income periods for color coordination
  const getBillsWithColorCoding = () => {
    if (!personalData.income.length || !personalData.bills.length) {
      return personalData.bills;
    }

    const sortedIncome = [...personalData.income].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    return personalData.bills.map((bill) => {
      if (!bill.dueDate) return bill;

      const billDate = createLocalDate(bill.dueDate);
      let colorPeriod = null;

      // Period 0: Before first income date (plain border - carry over from last month)
      if (billDate < createLocalDate(sortedIncome[0].date)) {
        colorPeriod = 0; // Period 0 - plain muted border
      } else {
        // Find which income period this bill falls into
        let foundPeriod = false;

        for (let i = 0; i < sortedIncome.length; i++) {
          const currentIncomeDate = createLocalDate(sortedIncome[i].date);
          const nextIncomeDate =
            i + 1 < sortedIncome.length
              ? createLocalDate(sortedIncome[i + 1].date)
              : null;

          // If this is the last income or the bill is before the next income
          if (!nextIncomeDate || billDate < nextIncomeDate) {
            // Bill falls in period after this income (i + 1)
            colorPeriod = i + 1;
            foundPeriod = true;
            break;
          }
        }

        // Fallback if no period found
        if (!foundPeriod) {
          colorPeriod = 0;
        }
      }

      return {
        ...bill,
        colorIndex: colorPeriod,
      };
    });
  };

  const billsWithColors = getBillsWithColorCoding();

  // Helper function to get income with color coordination
  const getIncomeWithColors = () => {
    const sortedIncome = [...personalData.income].sort(
      (a, b) => createLocalDate(a.date) - createLocalDate(b.date)
    );

    return sortedIncome.map((income, index) => ({
      ...income,
      colorIndex: index + 1, // Income periods start at 1
    }));
  };

  const incomeWithColors = getIncomeWithColors();

  // Helper function to get color classes for income periods (left borders only)
  const getColorClasses = (colorIndex) => {
    if (colorIndex === null || colorIndex === undefined) return '';

    const colorSchemes = {
      0: 'border-l-4 border-l-[#8b949e]', // Period 0 - Plain muted border (before first pay period)
      1: 'border-l-4 border-l-[#00ff41]', // Period 1 - Terminal green
      2: 'border-l-4 border-l-[#ff55ff]', // Period 2 - Terminal magenta
      3: 'border-l-4 border-l-[#ffff00]', // Period 3 - Terminal yellow
      4: 'border-l-4 border-l-[#38beff]', // Period 4 - Terminal blue
      5: 'border-l-4 border-l-[#56b6c2]', // Period 5 - Terminal cyan
      6: 'border-l-4 border-l-[#ffa500]', // Period 6 - Terminal orange
      7: 'border-l-4 border-l-[#a855f7]', // Period 7 - Terminal purple
      8: 'border-l-4 border-l-[#ff3e3e]', // Period 8 - Terminal red
      9: 'border-l-4 border-l-[#ffffff]', // Period 9 - Terminal white
    };

    return colorSchemes[colorIndex] || 'border-l-4 border-l-terminal-purple'; // Default to purple for any additional periods
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

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0'>
        <div className='flex items-center justify-center md:justify-end space-x-4'>
          <button
            onClick={() => changeMonth(-1)}
            className='w-12 h-10 flex items-center justify-center text-terminal-muted hover:text-terminal-text hover:bg-terminal-light rounded-md transition-colors font-ocr cursor-pointer'
          >
            ←
          </button>
          <span className='text-lg font-semibold text-terminal-text min-w-[140px] text-center font-ocr'>
            [{monthNames[currentMonth]} {currentYear}]
          </span>
          <button
            onClick={() => changeMonth(1)}
            className='w-12 h-10 flex items-center justify-center text-terminal-muted hover:text-terminal-text hover:bg-terminal-light rounded-md transition-colors font-ocr cursor-pointer'
          >
            →
          </button>
        </div>
      </div>

      {/* Monthly Summary Cards */}
      <div className='bg-terminal-light p-6 rounded-lg shadow-sm border border-terminal-border'>
        <h3 className='text-xl font-semibold text-terminal-green mb-4 flex items-center font-ibm'>
          <Calendar className='h-5 w-5 mr-2 lucide' />[
          {monthNames[currentMonth]} {currentYear}]
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='bg-terminal-dark p-6 rounded-lg shadow-sm border border-terminal-border'>
            <div className='flex items-center'>
              <div className='p-2 bg-terminal-dark rounded-lg border border-terminal-green bg-opacity-40'>
                <DollarSign className='h-6 w-6 text-terminal-green lucide' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-terminal-muted font-ocr'>
                  Income Budget
                </p>
                <p className='text-2xl font-bold text-terminal-green font-ibm'>
                  {formatCurrency(totalIncomeBudget)}
                </p>
                <p className='text-xs text-terminal-muted font-ocr'>
                  Actual: {formatCurrency(totalIncomeActual)}
                </p>
                <p
                  className={`text-xs font-ocr ${
                    incomeVariance >= 0
                      ? 'text-terminal-green'
                      : 'text-terminal-red'
                  }`}
                >
                  Variance: {incomeVariance >= 0 ? '+' : ''}
                  {formatCurrency(incomeVariance)} (
                  {incomeVariancePercent.toFixed(1)}%)
                </p>
              </div>
            </div>
          </div>

          <div className='bg-terminal-dark p-6 rounded-lg shadow-sm border border-terminal-border'>
            <div className='flex items-center'>
              <div className='p-2 bg-terminal-dark rounded-lg border border-terminal-red bg-opacity-40'>
                <DollarSign className='h-6 w-6 text-terminal-red lucide' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-terminal-muted font-ocr'>
                  Bills Due
                </p>
                <p className='text-2xl font-bold text-terminal-red font-ibm'>
                  {formatCurrency(totalBillsDue)}
                </p>
                <p className='text-xs text-terminal-muted font-ocr'>
                  Paid: {formatCurrency(totalBillsPaid)}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-terminal-dark p-6 rounded-lg shadow-sm border border-terminal-border'>
            <div className='flex items-center'>
              <div
                className={`p-2 rounded-lg border bg-opacity-40 ${
                  discretionaryIncome >= 0
                    ? 'bg-terminal-dark border-terminal-green'
                    : 'bg-terminal-dark border-terminal-red'
                }`}
              >
                <DollarSign
                  className={`h-6 w-6 lucide ${
                    discretionaryIncome >= 0
                      ? 'text-terminal-green'
                      : 'text-terminal-red'
                  }`}
                />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-terminal-muted font-ocr'>
                  Discretionary Income
                </p>
                <p
                  className={`text-2xl font-bold font-ibm ${
                    discretionaryIncome >= 0
                      ? 'text-terminal-green'
                      : 'text-terminal-red'
                  }`}
                >
                  {formatCurrency(discretionaryIncome)}
                </p>
                <p className='text-xs text-terminal-muted font-ocr'>
                  After Bills Paid
                </p>
              </div>
            </div>
          </div>

          <div className='bg-terminal-dark p-6 rounded-lg shadow-sm border border-terminal-border'>
            <div className='flex items-center'>
              <div className='p-2 bg-terminal-dark rounded-lg border border-terminal-purple bg-opacity-40'>
                <AlertCircle className='h-6 w-6 text-terminal-purple lucide' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-terminal-muted font-ocr'>
                  Bills Status
                </p>
                <p className='text-2xl font-bold text-terminal-purple font-ibm'>
                  {pendingBillsCount}
                </p>
                <p className='text-xs text-terminal-muted font-ocr'>
                  Pending • {paidBillsCount} Paid
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className='bg-terminal-light p-6 rounded-lg shadow-sm border border-terminal-border'>
        <h3 className='text-lg font-semibold text-terminal-green mb-4 font-ibm'>
          Quick Actions
        </h3>
        <div className='flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0'>
          <div className='flex flex-wrap items-center gap-4'>
            <button
              onClick={openIncomeModal}
              className='flex items-center px-4 py-2 bg-terminal-green text-black rounded-md hover:bg-terminal-green/80 focus:outline-none focus:ring-2 focus:ring-terminal-green focus:ring-offset-2 transition-colors font-ocr cursor-pointer'
            >
              <Plus className='h-4 w-4 mr-2 lucide' />
              Add Income
            </button>
            <button
              onClick={openBillModal}
              className='flex items-center px-4 py-2 bg-terminal-red text-white rounded-md hover:bg-terminal-red/80 focus:outline-none focus:ring-2 focus:ring-terminal-red focus:ring-offset-2 transition-colors font-ocr cursor-pointer'
            >
              <Plus className='h-4 w-4 mr-2 lucide' />
              Add Bill
            </button>
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            className='flex items-center px-3 py-1 text-sm text-terminal-muted hover:text-terminal-text border border-terminal-border rounded hover:border-terminal-muted hover:bg-terminal-dark/20 transition-all duration-200 font-ocr cursor-pointer'
          >
            <Download className='h-3 w-3 mr-1 lucide' />
            Export
          </button>
        </div>
      </div>

      {/* Income Section */}
      <div className='bg-terminal-light rounded-lg shadow-sm border border-terminal-border overflow-hidden'>
        <div className='px-6 py-4 border-b border-terminal-border'>
          <h3 className='text-lg font-semibold text-terminal-green font-ibm'>
            Income
          </h3>
        </div>

        {personalData.income.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className='hidden md:block overflow-x-auto'>
              <table className='min-w-full divide-y divide-terminal-border'>
                <thead className='bg-terminal-dark'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                      Source
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                      Date
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                      Budget
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                      Actual
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                      Notes
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-terminal-light divide-y divide-terminal-border'>
                  {incomeWithColors.map((income) => (
                    <tr
                      key={income.id}
                      className={`hover:bg-terminal-dark ${getColorClasses(
                        income.colorIndex
                      )}`}
                    >
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-terminal-text font-ocr'>
                        {income.source}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-text font-ocr'>
                        {formatDate(createLocalDate(income.date))}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-green text-right font-ocr'>
                        {formatCurrency(income.budget)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-green text-right font-ocr'>
                        {income.actual ? formatCurrency(income.actual) : '-'}
                      </td>
                      <td className='px-6 py-4 text-sm text-terminal-text font-ocr'>
                        {income.notes}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-center'>
                        <div className='flex justify-center space-x-2'>
                          <button
                            onClick={() => editItem(income, 'income')}
                            className='text-terminal-blue hover:text-terminal-blue/80 transition-colors cursor-pointer'
                            title='Edit income'
                          >
                            <Edit3 className='h-4 w-4 lucide' />
                          </button>
                          <button
                            onClick={() => handleDeleteIncome(income.id)}
                            className='text-terminal-red hover:text-terminal-red/80 transition-colors cursor-pointer'
                            title='Delete income'
                          >
                            <Trash2 className='h-4 w-4 lucide' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile Card View */}
            <div className='md:hidden space-y-2 p-4'>
              {incomeWithColors.map((income) => (
                <div
                  key={income.id}
                  className={`bg-terminal-dark p-3 rounded border border-terminal-border ${getColorClasses(
                    income.colorIndex
                  )}`}
                >
                  <div className='flex justify-between items-center mb-2'>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between'>
                        <span className='text-xs text-terminal-muted font-ocr'>
                          {formatDate(createLocalDate(income.date))}
                        </span>
                        <p className='text-lg font-bold text-terminal-green font-ibm'>
                          {income.actual
                            ? formatCurrency(income.actual)
                            : formatCurrency(income.budget)}
                        </p>
                      </div>
                      <h4 className='text-terminal-text font-medium font-ocr text-sm mt-1'>
                        {income.source}
                      </h4>
                      {income.notes && (
                        <p className='text-xs text-terminal-muted font-ocr mt-1'>
                          {income.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center justify-between pt-2 border-t border-terminal-border'>
                    <div className='text-xs text-terminal-muted font-ocr'>
                      Budget: {formatCurrency(income.budget)}
                      {income.actual &&
                        ` • Actual: ${formatCurrency(income.actual)}`}
                    </div>

                    <div className='flex items-center space-x-3'>
                      <button
                        onClick={() => editItem(income, 'income')}
                        className='text-terminal-blue hover:text-terminal-blue/80 transition-colors cursor-pointer'
                        title='Edit income'
                      >
                        <Edit3 className='h-3 w-3 lucide' />
                      </button>
                      <button
                        onClick={() => handleDeleteIncome(income.id)}
                        className='text-terminal-red hover:text-terminal-red/80 transition-colors cursor-pointer'
                        title='Delete income'
                      >
                        <Trash2 className='h-3 w-3 lucide' />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className='px-6 py-12 text-center'>
            <p className='text-terminal-muted font-ocr'>
              No income entries yet. Add some above!
            </p>
          </div>
        )}
      </div>

      {/* Bills Section */}
      <div className='bg-terminal-light rounded-lg shadow-sm border border-terminal-border overflow-hidden'>
        <div className='px-6 py-4 border-b border-terminal-border'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-terminal-green font-ibm'>
              Bills
            </h3>
            {personalData.income.length > 0 && (
              <div className='flex items-center space-x-4 text-xs font-ocr'>
                <span className='text-terminal-muted'>Income Periods:</span>
                {incomeWithColors.map((income, index) => {
                  const colors = {
                    1: 'bg-[#00ff41]', // Period 1 - Green
                    2: 'bg-[#ff55ff]', // Period 2 - Magenta
                    3: 'bg-[#ffff00]', // Period 3 - Yellow
                    4: 'bg-[#38beff]', // Period 4 - Blue
                    5: 'bg-[#56b6c2]', // Period 5 - Cyan
                    6: 'bg-[#ffa500]', // Period 6 - Orange
                    7: 'bg-[#a855f7]', // Period 7 - Purple
                    8: 'bg-[#ff3e3e]', // Period 8 - Red
                    9: 'bg-[#ffffff]', // Period 9 - White
                  };
                  return (
                    <div
                      key={income.id}
                      className='flex items-center space-x-1'
                    >
                      <div
                        className={`w-3 h-3 rounded ${
                          colors[income.colorIndex] || 'bg-terminal-muted'
                        } border border-terminal-border`}
                      ></div>
                      <span className='text-terminal-text'>
                        {formatDate(createLocalDate(income.date))}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {personalData.bills.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className='hidden md:block overflow-x-auto'>
              <table className='min-w-full divide-y divide-terminal-border'>
                <thead className='bg-terminal-dark'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                      Name
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                      Due Date
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                      Amount Due
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                      Amount Paid
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                      Notes
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-terminal-light divide-y divide-terminal-border'>
                  {billsWithColors.map((bill) => (
                    <tr
                      key={bill.id}
                      className={`hover:bg-terminal-dark ${
                        bill.needsAttention ? 'bg-terminal-dark' : ''
                      } ${getColorClasses(bill.colorIndex)}`}
                    >
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-terminal-text font-ocr'>
                        <div className='flex items-center'>
                          {bill.url ? (
                            <a
                              href={bill.url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-terminal-blue hover:text-terminal-blue/80 underline transition-colors'
                            >
                              {bill.name}
                            </a>
                          ) : (
                            bill.name
                          )}
                          {bill.needsAttention && (
                            <AlertCircle className='h-4 w-4 ml-2 text-terminal-yellow lucide' />
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-text font-ocr'>
                        {bill.dueDate
                          ? formatDate(createLocalDate(bill.dueDate))
                          : '-'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-red text-right font-ocr'>
                        {formatCurrency(bill.amountDue)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-red text-right font-ocr'>
                        {bill.amountPaid
                          ? formatCurrency(bill.amountPaid)
                          : '-'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-center'>
                        <select
                          value={bill.status || ''}
                          onChange={(e) =>
                            handleStatusChange(bill.id, e.target.value)
                          }
                          className={`rounded px-2 py-1 text-xs font-ocr focus:outline-none focus:ring-2 focus:ring-terminal-green ${
                            bill.status === 'Paid'
                              ? 'bg-terminal-dark text-terminal-green border border-terminal-green'
                              : bill.status === 'Pending'
                              ? 'bg-terminal-dark text-terminal-yellow border border-terminal-yellow'
                              : 'bg-terminal-dark text-terminal-muted border border-terminal-muted'
                          }`}
                        >
                          <option value=''>-</option>
                          <option value='Pending'>Pending</option>
                          <option value='Paid'>Paid</option>
                        </select>
                      </td>
                      <td className='px-6 py-4 text-sm text-terminal-text font-ocr'>
                        {bill.notes}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-center'>
                        <div className='flex justify-center space-x-2'>
                          <button
                            onClick={() => editItem(bill, 'bill')}
                            className='text-terminal-blue hover:text-terminal-blue/80 transition-colors cursor-pointer'
                            title='Edit bill'
                          >
                            <Edit3 className='h-4 w-4 lucide' />
                          </button>
                          <button
                            onClick={() => handleDeleteBill(bill.id)}
                            className='text-terminal-red hover:text-terminal-red/80 transition-colors cursor-pointer'
                            title='Delete bill'
                          >
                            <Trash2 className='h-4 w-4 lucide' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile Card View */}
            <div className='md:hidden space-y-2 p-4'>
              {billsWithColors.map((bill) => (
                <div
                  key={bill.id}
                  className={`bg-terminal-dark p-3 rounded border ${
                    bill.needsAttention
                      ? 'border-terminal-yellow'
                      : 'border-terminal-border'
                  } ${getColorClasses(bill.colorIndex)}`}
                >
                  <div className='flex justify-between items-center mb-2'>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center'>
                          <span className='text-xs text-terminal-muted font-ocr'>
                            {bill.dueDate
                              ? formatDate(createLocalDate(bill.dueDate))
                              : 'No due date'}
                          </span>
                          {bill.needsAttention && (
                            <AlertCircle className='h-3 w-3 ml-1 text-terminal-yellow lucide' />
                          )}
                        </div>
                        <p className='text-lg font-bold text-terminal-red font-ibm'>
                          -
                          {bill.amountPaid
                            ? formatCurrency(bill.amountPaid)
                            : formatCurrency(bill.amountDue)}
                        </p>
                      </div>
                      <h4 className='text-terminal-text font-medium font-ocr text-sm mt-1'>
                        {bill.url ? (
                          <a
                            href={bill.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-terminal-blue hover:text-terminal-blue/80 underline transition-colors'
                          >
                            {bill.name}
                          </a>
                        ) : (
                          bill.name
                        )}
                      </h4>
                      {bill.notes && (
                        <p className='text-xs text-terminal-muted font-ocr mt-1'>
                          {bill.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center justify-between pt-2 border-t border-terminal-border'>
                    <div className='flex items-start justify-between flex-1'>
                      <div className='text-xs text-terminal-muted font-ocr'>
                        <div>Due: {formatCurrency(bill.amountDue)}</div>
                        {bill.amountPaid && (
                          <div>Paid: {formatCurrency(bill.amountPaid)}</div>
                        )}
                      </div>
                      <select
                        value={bill.status || ''}
                        onChange={(e) =>
                          handleStatusChange(bill.id, e.target.value)
                        }
                        className={`rounded px-2 py-1 text-xs font-ocr focus:outline-none focus:ring-2 focus:ring-terminal-green ${
                          bill.status === 'Paid'
                            ? 'bg-terminal-dark text-terminal-green border border-terminal-green'
                            : bill.status === 'Pending'
                            ? 'bg-terminal-dark text-terminal-yellow border border-terminal-yellow'
                            : 'bg-terminal-dark text-terminal-muted border border-terminal-muted'
                        }`}
                      >
                        <option value=''>-</option>
                        <option value='Pending'>Pending</option>
                        <option value='Paid'>Paid</option>
                      </select>
                    </div>

                    <div className='flex items-center space-x-3 ml-4'>
                      <button
                        onClick={() => editItem(bill, 'bill')}
                        className='text-terminal-blue hover:text-terminal-blue/80 transition-colors cursor-pointer'
                        title='Edit bill'
                      >
                        <Edit3 className='h-3 w-3 lucide' />
                      </button>
                      <button
                        onClick={() => handleDeleteBill(bill.id)}
                        className='text-terminal-red hover:text-terminal-red/80 transition-colors cursor-pointer'
                        title='Delete bill'
                      >
                        <Trash2 className='h-3 w-3 lucide' />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className='px-6 py-12 text-center'>
            <p className='text-terminal-muted font-ocr'>
              No bills yet. Add some above!
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showIncomeModal && (
        <TransactionModal
          isOpen={showIncomeModal}
          onClose={() => setShowIncomeModal(false)}
          onSave={handleSaveIncome}
          transaction={editingItem}
          modalType='income'
        />
      )}

      {showBillModal && (
        <TransactionModal
          isOpen={showBillModal}
          onClose={() => setShowBillModal(false)}
          onSave={handleSaveBill}
          transaction={editingItem}
          modalType='bill'
        />
      )}

      {/* Export Modal */}
      <DateRangePicker
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        title='Export Personal Data'
      />
    </div>
  );
}

// Transaction Modal Component
function TransactionModal({ isOpen, onClose, onSave, transaction, modalType }) {
  const [name, setName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [amountDue, setAmountDue] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [url, setUrl] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState('');
  const [budget, setBudget] = useState('');
  const [actual, setActual] = useState('');

  useEffect(() => {
    if (transaction) {
      if (modalType === 'income') {
        setSource(transaction.source || '');
        setDate(transaction.date || '');
        setBudget(transaction.budget || '');
        setActual(transaction.actual || '');
        setNotes(transaction.notes || '');
      } else {
        setName(transaction.name || '');
        setDueDate(transaction.dueDate || '');
        setAmountDue(transaction.amountDue || '');
        setAmountPaid(transaction.amountPaid || '');
        setStatus(transaction.status || '');
        setNotes(transaction.notes || '');
        setUrl(transaction.url || '');
      }
    } else if (modalType === 'income') {
      setSource('');
      setDate(formatDate(new Date()));
      setBudget('');
      setActual('');
      setNotes('');
    } else {
      setName('');
      setDueDate('');
      setAmountDue('');
      setAmountPaid('');
      setStatus('');
      setNotes('');
      setUrl('');
    }
  }, [transaction, modalType]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (modalType === 'income') {
      onSave({
        source: source.trim(),
        date,
        budget: parseFloat(budget) || 0,
        actual: actual ? parseFloat(actual) : null,
        notes: notes.trim(),
      });
    } else {
      onSave({
        name: name.trim(),
        dueDate: dueDate || null,
        amountDue: parseFloat(amountDue) || 0,
        amountPaid: amountPaid ? parseFloat(amountPaid) : null,
        status,
        notes: notes.trim(),
        url: url.trim(),
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-terminal-light rounded-lg p-6 w-full max-w-md mx-4 border border-terminal-border'>
        <h3 className='text-lg font-semibold text-terminal-green mb-4 font-ibm'>
          {transaction ? 'Edit' : 'Add'}{' '}
          {modalType === 'income' ? 'Income' : 'Bill'}
        </h3>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {modalType === 'income' ? (
            <>
              <div>
                <label className='block text-sm font-medium text-terminal-text mb-1 font-ocr'>
                  Source
                </label>
                <input
                  type='text'
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ocr'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-terminal-text mb-1 font-ocr'>
                  Date
                </label>
                <input
                  type='date'
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ocr'
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className='block text-sm font-medium text-terminal-text mb-1 font-ocr'>
                  Bill Name
                </label>
                <input
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ocr'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-terminal-text mb-1 font-ocr'>
                  Due Date
                </label>
                <input
                  type='date'
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ocr'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-terminal-text mb-1 font-ocr'>
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ocr'
                >
                  <option value=''>-</option>
                  <option value='Pending'>Pending</option>
                  <option value='Paid'>Paid</option>
                </select>
              </div>
            </>
          )}

          {modalType === 'income' ? (
            <>
              <div>
                <label className='block text-sm font-medium text-terminal-text mb-1 font-ocr'>
                  Budget Amount
                </label>
                <input
                  type='number'
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ocr'
                  min='0'
                  step='0.01'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-terminal-text mb-1 font-ocr'>
                  Actual Amount
                </label>
                <input
                  type='number'
                  value={actual}
                  onChange={(e) => setActual(e.target.value)}
                  className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ocr'
                  min='0'
                  step='0.01'
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className='block text-sm font-medium text-terminal-text mb-1 font-ocr'>
                  Amount Due
                </label>
                <input
                  type='number'
                  value={amountDue}
                  onChange={(e) => setAmountDue(e.target.value)}
                  className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ocr'
                  min='0'
                  step='0.01'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-terminal-text mb-1 font-ocr'>
                  Amount Paid
                </label>
                <input
                  type='number'
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ocr'
                  min='0'
                  step='0.01'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-terminal-text mb-1 font-ocr'>
                  Login URL (Optional)
                </label>
                <input
                  type='url'
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder='https://example.com/login'
                  className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ocr'
                />
              </div>
            </>
          )}

          <div>
            <label className='block text-sm font-medium text-terminal-text mb-1 font-ocr'>
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ocr'
              rows='3'
            />
          </div>

          <div className='flex space-x-3 pt-4'>
            <button
              type='submit'
              className='flex-1 px-4 py-2 bg-terminal-green text-black rounded-md hover:bg-terminal-green/80 focus:outline-none focus:ring-2 focus:ring-terminal-green focus:ring-offset-2 transition-colors cursor-pointer font-ocr'
            >
              Save
            </button>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-4 py-2 bg-terminal-muted text-terminal-text rounded-md hover:bg-terminal-muted/80 focus:outline-none focus:ring-2 focus:ring-terminal-muted focus:ring-offset-2 transition-colors cursor-pointer font-ocr'
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
