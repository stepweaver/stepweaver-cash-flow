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
} from 'lucide-react';
import {
  getPersonalData,
  addPersonalIncome,
  addPersonalBill,
  updatePersonalBill,
  deletePersonalIncome,
  deletePersonalBill,
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

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Get initial personal data for the current month
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
          ).padStart(2, '0')}-11`,
          budget: 1652.23,
          actual: 1652.23,
          notes: 'Bi-weekly paycheck',
        },
        {
          id: '2',
          source: 'PHM',
          date: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-25`,
          budget: 1652.23,
          actual: null,
          notes: 'Bi-weekly paycheck',
        },
      ],
      bills: [
        {
          id: '1',
          bill: 'Mortgage',
          dueDate: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-01`,
          budget: 579.14,
          actual: 579.14,
          status: 'paid',
          notes: 'Monthly mortgage payment',
        },
        {
          id: '2',
          bill: 'NIPSCO',
          dueDate: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-01`,
          budget: 90.0,
          actual: 90.0,
          status: 'paid',
          notes: 'Electric utility',
        },
        {
          id: '3',
          bill: 'H.E.L.P. (medical)',
          dueDate: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-01`,
          budget: 1201.69,
          actual: 25.0,
          status: 'paid',
          notes: 'Medical payment plan',
        },
        {
          id: '4',
          bill: 'Car Insurance',
          dueDate: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-04`,
          budget: 98.0,
          actual: 98.0,
          status: 'pending',
          notes: 'Auto insurance',
        },
        {
          id: '5',
          bill: 'Liability Insurance',
          dueDate: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-04`,
          budget: 13.08,
          actual: 13.08,
          status: 'pending',
          notes: 'Business liability',
        },
        {
          id: '6',
          bill: 'Metronet',
          dueDate: null,
          budget: 25.0,
          actual: null,
          status: 'pending',
          notes: 'Internet service - billing statement not ready',
          needsAttention: true,
        },
        {
          id: '7',
          bill: 'Day Care',
          dueDate: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, '0')}-04`,
          budget: 60.0,
          actual: 60.0,
          status: 'paid',
          notes: 'Childcare payment',
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
        const data = await getPersonalData(currentYear, currentMonth + 1);
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
      } else {
        const savedBill = await addPersonalBill(bill);
        setPersonalData((prev) => ({
          ...prev,
          bills: [...prev.bills, savedBill],
        }));
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
      await deletePersonalBill(id);
      setPersonalData((prev) => ({
        ...prev,
        bills: prev.bills.filter((item) => item.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting bill:', error);
      alert('Failed to delete bill. Please try again.');
    }
  };

  const handleStatusToggle = async (id) => {
    try {
      const bill = personalData.bills.find((b) => b.id === id);
      if (bill) {
        const newStatus = bill.status === 'paid' ? 'pending' : 'paid';
        await updatePersonalBill(id, { status: newStatus });
        setPersonalData((prev) => ({
          ...prev,
          bills: prev.bills.map((bill) =>
            bill.id === id ? { ...bill, status: newStatus } : bill
          ),
        }));
      }
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
    const start = new Date(startDate);
    const end = new Date(endDate);

    const transactions = [];

    // Add income entries as transactions
    personalData.income.forEach((income) => {
      const incomeDate = new Date(income.date);
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
        const billDate = new Date(bill.dueDate);
        if (billDate >= start && billDate <= end) {
          transactions.push({
            id: bill.id,
            date: billDate,
            type: 'bill',
            description: bill.bill,
            amount: -(bill.actual || bill.budget || 0), // Negative for expenses
            notes: bill.notes || '',
            budget: bill.budget,
            actual: bill.actual,
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

  // Calculate summary statistics
  const totalIncomeBudget = personalData.income.reduce(
    (sum, item) => sum + (item.budget || 0),
    0
  );
  const totalIncomeActual = personalData.income.reduce(
    (sum, item) => sum + (item.actual || 0),
    0
  );
  const totalBillsBudget = personalData.bills.reduce(
    (sum, item) => sum + (item.budget || 0),
    0
  );
  const totalBillsActual = personalData.bills.reduce(
    (sum, item) => sum + (item.actual || 0),
    0
  );
  const netCashFlow = totalIncomeActual - totalBillsActual;

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

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-terminal-light p-6 rounded-lg shadow-sm border border-terminal-border'>
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
              <p className='text-sm text-terminal-muted font-ocr'>
                Actual: {formatCurrency(totalIncomeActual)}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-terminal-light p-6 rounded-lg shadow-sm border border-terminal-border'>
          <div className='flex items-center'>
            <div className='p-2 bg-terminal-dark rounded-lg border border-terminal-red bg-opacity-40'>
              <DollarSign className='h-6 w-6 text-terminal-red lucide' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-terminal-muted font-ocr'>
                Bills Budget
              </p>
              <p className='text-2xl font-bold text-terminal-red font-ibm'>
                {formatCurrency(totalBillsBudget)}
              </p>
              <p className='text-sm text-terminal-muted font-ocr'>
                Actual: {formatCurrency(totalBillsActual)}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-terminal-light p-6 rounded-lg shadow-sm border border-terminal-border'>
          <div className='flex items-center'>
            <div
              className={`p-2 rounded-lg border bg-opacity-40 ${
                netCashFlow >= 0
                  ? 'bg-terminal-dark border-terminal-green'
                  : 'bg-terminal-dark border-terminal-red'
              }`}
            >
              <DollarSign
                className={`h-6 w-6 lucide ${
                  netCashFlow >= 0 ? 'text-terminal-green' : 'text-terminal-red'
                }`}
              />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-terminal-muted font-ocr'>
                Net Cash Flow
              </p>
              <p
                className={`text-2xl font-bold font-ibm ${
                  netCashFlow >= 0 ? 'text-terminal-green' : 'text-terminal-red'
                }`}
              >
                {formatCurrency(netCashFlow)}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-terminal-light p-6 rounded-lg shadow-sm border border-terminal-border'>
          <div className='flex items-center'>
            <div className='p-2 bg-terminal-dark rounded-lg border border-terminal-purple bg-opacity-40'>
              <AlertCircle className='h-6 w-6 text-terminal-purple lucide' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-terminal-muted font-ocr'>
                Pending Bills
              </p>
              <p className='text-2xl font-bold text-terminal-purple font-ibm'>
                {
                  personalData.bills.filter((bill) => bill.status === 'pending')
                    .length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
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
        <button
          onClick={() => setShowExportModal(true)}
          className='flex items-center px-3 py-1 text-sm bg-terminal-blue text-white rounded hover:bg-terminal-blue/80 transition-colors font-ocr ml-auto'
        >
          <Download className='h-3 w-3 mr-1 lucide' />
          Export
        </button>
      </div>

      {/* Income Section */}
      <div className='bg-terminal-light rounded-lg shadow-sm border border-terminal-border overflow-hidden'>
        <div className='px-6 py-4 border-b border-terminal-border'>
          <h3 className='text-lg font-semibold text-terminal-green font-ibm'>
            Income
          </h3>
        </div>

        {personalData.income.length > 0 ? (
          <div className='overflow-x-auto'>
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
                {personalData.income.map((income) => (
                  <tr key={income.id} className='hover:bg-terminal-dark'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-terminal-text font-ocr'>
                      {income.source}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-text font-ocr'>
                      {income.date}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-text text-right font-ocr'>
                      {formatCurrency(income.budget)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-text text-right font-ocr'>
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
                          ✏️
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
          <h3 className='text-lg font-semibold text-terminal-green font-ibm'>
            Bills
          </h3>
        </div>

        {personalData.bills.length > 0 ? (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-terminal-border'>
              <thead className='bg-terminal-dark'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                    Bill
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                    Due Date
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                    Budget
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                    Actual
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
                {personalData.bills.map((bill) => (
                  <tr
                    key={bill.id}
                    className={`hover:bg-terminal-dark ${
                      bill.needsAttention ? 'bg-terminal-dark' : ''
                    }`}
                  >
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-terminal-text font-ocr'>
                      <div className='flex items-center'>
                        {bill.bill}
                        {bill.needsAttention && (
                          <AlertCircle className='h-4 w-4 ml-2 text-terminal-yellow lucide' />
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-text font-ocr'>
                      {bill.dueDate ? bill.dueDate : '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-text text-right font-ocr'>
                      {formatCurrency(bill.budget)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-text text-right font-ocr'>
                      {bill.actual ? formatCurrency(bill.actual) : '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <button
                        onClick={() => handleStatusToggle(bill.id)}
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border bg-opacity-40 transition-colors cursor-pointer ${
                          bill.status === 'paid'
                            ? 'bg-terminal-dark text-terminal-green border-terminal-green'
                            : 'bg-terminal-dark text-terminal-yellow border-terminal-yellow'
                        }`}
                      >
                        {bill.status === 'paid' ? (
                          <CheckCircle className='h-3 w-3 mr-1 lucide' />
                        ) : (
                          <Clock className='h-3 w-3 mr-1 lucide' />
                        )}
                        {bill.status === 'paid' ? 'Paid' : 'Pending'}
                      </button>
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
                          ✏️
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
  const [bill, setBill] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [budget, setBudget] = useState('');
  const [actual, setActual] = useState('');
  const [status, setStatus] = useState('pending');
  const [notes, setNotes] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (transaction) {
      if (modalType === 'income') {
        setSource(transaction.source || '');
        setDate(transaction.date || '');
        setBudget(transaction.budget || '');
        setActual(transaction.actual || '');
        setNotes(transaction.notes || '');
      } else {
        setBill(transaction.bill || '');
        setDueDate(transaction.dueDate || '');
        setBudget(transaction.budget || '');
        setActual(transaction.actual || '');
        setStatus(transaction.status || 'pending');
        setNotes(transaction.notes || '');
      }
    } else if (modalType === 'income') {
      setSource('');
      setDate(formatDate(new Date()));
      setBudget('');
      setActual('');
      setNotes('');
    } else {
      setBill('');
      setDueDate('');
      setBudget('');
      setActual('');
      setStatus('pending');
      setNotes('');
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
        bill: bill.trim(),
        dueDate: dueDate || null,
        budget: parseFloat(budget) || 0,
        actual: actual ? parseFloat(actual) : null,
        status,
        notes: notes.trim(),
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
                  value={bill}
                  onChange={(e) => setBill(e.target.value)}
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
                  <option value='pending'>Pending</option>
                  <option value='paid'>Paid</option>
                </select>
              </div>
            </>
          )}

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
