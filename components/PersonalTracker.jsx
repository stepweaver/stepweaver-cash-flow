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
} from 'lucide-react';
import {
  getPersonalData,
  addPersonalIncome,
  addPersonalBill,
  updatePersonalBill,
  deletePersonalIncome,
  deletePersonalBill,
} from '../lib/firebase';

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
      <div className='flex justify-between items-center'>
        <h2 className='text-3xl font-bold text-terminal-green font-ibm'>
          Personal Budget Tracker
        </h2>
        <div className='flex items-center space-x-4'>
          <button
            onClick={() => changeMonth(-1)}
            className='w-12 h-10 flex items-center justify-center text-terminal-muted hover:text-terminal-text hover:bg-terminal-light rounded-md transition-colors font-ocr cursor-pointer'
          >
            ←
          </button>
          <span className='text-lg font-semibold text-terminal-text min-w-[140px] text-center font-ocr'>
            {monthNames[currentMonth]} {currentYear}
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
      <div className='flex space-x-4'>
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
      <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          {transaction ? 'Edit' : 'Add'}{' '}
          {modalType === 'income' ? 'Income' : 'Bill'}
        </h3>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {modalType === 'income' ? (
            <>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Source
                </label>
                <input
                  type='text'
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Date
                </label>
                <input
                  type='date'
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Bill Name
                </label>
                <input
                  type='text'
                  value={bill}
                  onChange={(e) => setBill(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Due Date
                </label>
                <input
                  type='date'
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value='pending'>Pending</option>
                  <option value='paid'>Paid</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Budget Amount
            </label>
            <input
              type='number'
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              min='0'
              step='0.01'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Actual Amount
            </label>
            <input
              type='number'
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              min='0'
              step='0.01'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              rows='3'
            />
          </div>

          <div className='flex space-x-3 pt-4'>
            <button
              type='submit'
              className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer'
            >
              Save
            </button>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors cursor-pointer'
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
