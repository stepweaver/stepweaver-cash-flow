'use client';

import { useState, useEffect } from 'react';
import {
  Trash2,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Paperclip,
  Eye,
  Download,
  Edit3,
  X,
} from 'lucide-react';
import {
  addBusinessTransaction,
  getBusinessTransactions,
  deleteBusinessTransaction,
  uploadReceiptFile,
  deleteReceiptFile,
  updateBusinessTransaction,
} from '../lib/firebase';
import ReceiptUpload from './ReceiptUpload';
import ReceiptViewer from './ReceiptViewer';
import DateRangePicker from './DateRangePicker';
import {
  exportToCSV,
  exportToJSON,
  generatePDFHTML,
  downloadFile,
  downloadReceiptsAsZip,
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

export default function BusinessTracker() {
  const [transactions, setTransactions] = useState([]);
  const [newTransactionDescription, setNewTransactionDescription] =
    useState('');
  const [newTransactionAmount, setNewTransactionAmount] = useState('');
  const [newTransactionType, setNewTransactionType] = useState('revenue');
  const [newTransactionDate, setNewTransactionDate] = useState(
    formatDate(new Date())
  );
  // Initialize with current month and year
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Receipt and file management
  const [receiptFiles, setReceiptFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);
  const [selectedTransactionReceipts, setSelectedTransactionReceipts] =
    useState([]);
  const [selectedTransactionDescription, setSelectedTransactionDescription] =
    useState('');

  // Export functionality
  const [showExportModal, setShowExportModal] = useState(false);

  // Edit functionality
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Load transactions from Firebase on mount
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await getBusinessTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Error loading transactions:', error);
        // Fallback to localStorage if Firebase fails
        const savedTransactions = localStorage.getItem('businessTransactions');
        if (savedTransactions) {
          setTransactions(JSON.parse(savedTransactions));
        }
      }
    };

    loadTransactions();
  }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();

    if (!newTransactionDescription.trim() || !newTransactionAmount) {
      return;
    }

    const newTransaction = {
      description: newTransactionDescription.trim(),
      amount: parseFloat(newTransactionAmount),
      type: newTransactionType,
      date: new Date(newTransactionDate),
      receipts: receiptFiles.length > 0 ? receiptFiles : [],
    };

    try {
      const savedTransaction = await addBusinessTransaction(newTransaction);
      setTransactions((prev) => [savedTransaction, ...prev]);
      setNewTransactionDescription('');
      setNewTransactionAmount('');
      setNewTransactionType('revenue');
      setNewTransactionDate(formatDate(new Date()));
      setReceiptFiles([]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction. Please try again.');
    }
  };

  const handleDeleteTransaction = async (idToDelete) => {
    const transactionToDelete = transactions.find((t) => t.id === idToDelete);

    try {
      // Delete associated receipt files from storage
      if (transactionToDelete?.receipts) {
        for (const receipt of transactionToDelete.receipts) {
          if (receipt.storagePath) {
            await deleteReceiptFile(receipt.storagePath);
          }
        }
      }

      await deleteBusinessTransaction(idToDelete);
      setTransactions((prev) =>
        prev.filter((transaction) => transaction.id !== idToDelete)
      );
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  // Receipt handling functions
  const handleReceiptUpload = async (files) => {
    setUploading(true);
    try {
      const uploadedReceipts = [];

      for (const file of files) {
        // Create a temporary transaction ID for new transactions
        const tempTransactionId = `temp_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const receiptData = await uploadReceiptFile(file, tempTransactionId);
        uploadedReceipts.push(receiptData);
      }

      setReceiptFiles((prev) => [...prev, ...uploadedReceipts]);
    } catch (error) {
      console.error('Error uploading receipts:', error);
      alert('Failed to upload receipts. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const openReceiptViewer = (transaction) => {
    setSelectedTransactionReceipts(transaction.receipts || []);
    setSelectedTransactionDescription(transaction.description || '');
    setShowReceiptViewer(true);
  };

  const handleDeleteReceipt = async (receiptId) => {
    try {
      // Find the receipt to delete
      const receipt = selectedTransactionReceipts.find(
        (r) => r.id === receiptId
      );
      if (receipt && receipt.storagePath) {
        await deleteReceiptFile(receipt.storagePath);
      }

      // Update the transaction to remove the receipt
      const transaction = transactions.find(
        (t) => t.receipts && t.receipts.some((r) => r.id === receiptId)
      );

      if (transaction) {
        const updatedReceipts = transaction.receipts.filter(
          (r) => r.id !== receiptId
        );
        await updateBusinessTransaction(transaction.id, {
          receipts: updatedReceipts,
        });

        // Update local state
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === transaction.id ? { ...t, receipts: updatedReceipts } : t
          )
        );

        setSelectedTransactionReceipts(updatedReceipts);
      }
    } catch (error) {
      console.error('Error deleting receipt:', error);
      throw error;
    }
  };

  // Edit transaction functions
  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  const handleEditTransaction = async (updatedData) => {
    if (!editingTransaction) return;

    try {
      await updateBusinessTransaction(editingTransaction.id, updatedData);

      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingTransaction.id ? { ...t, ...updatedData } : t
        )
      );

      setShowEditModal(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Failed to update transaction. Please try again.');
    }
  };

  // Export functions
  const getTransactionsForExport = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= start && transactionDate <= end;
    });
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
            `business_transactions_${dateRange}.csv`
          );
          break;
        case 'json':
          exportToJSON(
            exportTransactions,
            `business_transactions_${dateRange}.json`
          );
          break;
        case 'pdf':
          const htmlContent = generatePDFHTML(
            exportTransactions,
            `Business Transactions (${startDate} to ${endDate})`
          );
          downloadFile(
            htmlContent,
            `business_transactions_${dateRange}.html`,
            'text/html'
          );
          break;
        default:
          throw new Error('Unsupported export format');
      }

      // Export receipts if requested
      if (includeReceipts) {
        const transactionsWithReceipts = exportTransactions.filter(
          (t) => t.receipts && t.receipts.length > 0
        );
        if (transactionsWithReceipts.length > 0) {
          await downloadReceiptsAsZip(
            transactionsWithReceipts,
            `business_receipts_${dateRange}.zip`
          );
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentYear, currentMonth + offset, 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  // Filter transactions for current month
  const filteredMonthlyTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear
    );
  });

  // Filter transactions for current year
  const filteredAnnualTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getFullYear() === currentYear;
  });

  // Calculate monthly summary statistics
  const monthlyRevenue = filteredMonthlyTransactions
    .filter((t) => t.type === 'revenue')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = filteredMonthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyDraws = filteredMonthlyTransactions
    .filter((t) => t.type === 'draw')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyNetIncome = monthlyRevenue - monthlyExpenses - monthlyDraws;

  // Calculate annual summary statistics
  const annualRevenue = filteredAnnualTransactions
    .filter((t) => t.type === 'revenue')
    .reduce((sum, t) => sum + t.amount, 0);

  const annualExpenses = filteredAnnualTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const annualDraws = filteredAnnualTransactions
    .filter((t) => t.type === 'draw')
    .reduce((sum, t) => sum + t.amount, 0);

  const annualNetProfit = annualRevenue - annualExpenses;
  const annualTaxableIncome = annualNetProfit * 0.9235; // 92.35% of net profit
  const annualTaxReserve =
    annualTaxableIncome > 0 ? annualTaxableIncome * 0.25 : 0; // 25% of taxable income
  const annualDrawableCash = Math.max(
    0,
    annualNetProfit - annualTaxReserve - annualDraws
  );

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

      {/* Annual Summary Cards */}
      <div className='bg-terminal-light p-6 rounded-lg shadow-sm border border-terminal-border'>
        <h3 className='text-xl font-semibold text-terminal-green mb-4 flex items-center font-ibm'>
          <Calendar className='h-5 w-5 mr-2 lucide' />[{currentYear}]
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='bg-terminal-dark p-4 rounded-lg border border-terminal-green bg-opacity-40'>
            <p className='text-sm font-medium text-terminal-green font-ocr'>
              Annual Revenue
            </p>
            <p className='text-2xl font-bold text-terminal-green font-ibm'>
              {formatCurrency(annualRevenue)}
            </p>
          </div>

          <div className='bg-terminal-dark p-4 rounded-lg border border-terminal-red bg-opacity-40'>
            <p className='text-sm font-medium text-terminal-red font-ocr'>
              Annual Expenses
            </p>
            <p className='text-2xl font-bold text-terminal-red font-ibm'>
              {formatCurrency(annualExpenses)}
            </p>
          </div>

          <div className='bg-terminal-dark p-4 rounded-lg border border-terminal-green bg-opacity-40'>
            <p className='text-sm font-medium text-terminal-green font-ocr'>
              Annual Net Profit
            </p>
            <p
              className={`text-2xl font-bold font-ibm ${
                annualNetProfit >= 0
                  ? 'text-terminal-green'
                  : 'text-terminal-red'
              }`}
            >
              {formatCurrency(annualNetProfit)}
            </p>
          </div>

          <div className='bg-terminal-dark p-4 rounded-lg border border-terminal-yellow bg-opacity-40'>
            <p className='text-sm font-medium text-terminal-yellow font-ocr'>
              Taxable Income
            </p>
            <p className='text-2xl font-bold text-terminal-yellow font-ibm'>
              {formatCurrency(annualTaxableIncome)}
            </p>
            <p className='text-xs text-terminal-yellow font-ocr'>
              92.35% of net profit
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
          <div className='bg-terminal-dark p-4 rounded-lg border border-terminal-yellow bg-opacity-40'>
            <p className='text-sm font-medium text-terminal-yellow font-ocr'>
              Tax Reserve
            </p>
            <p className='text-2xl font-bold text-terminal-yellow font-ibm'>
              {formatCurrency(annualTaxReserve)}
            </p>
            <p className='text-xs text-terminal-yellow font-ocr'>
              25% of taxable income
            </p>
          </div>

          <div className='bg-terminal-dark p-4 rounded-lg border border-terminal-purple bg-opacity-40'>
            <p className='text-sm font-medium text-terminal-purple font-ocr'>
              Total Draws
            </p>
            <p className='text-2xl font-bold text-terminal-purple font-ibm'>
              {formatCurrency(annualDraws)}
            </p>
          </div>

          <div className='bg-terminal-dark p-4 rounded-lg border border-terminal-magenta bg-opacity-40'>
            <p className='text-sm font-medium text-terminal-magenta font-ocr'>
              Drawable Cash
            </p>
            <p
              className={`text-2xl font-bold font-ibm ${
                annualDrawableCash > 0
                  ? 'text-terminal-magenta'
                  : annualDrawableCash < 0
                  ? 'text-terminal-red'
                  : 'text-terminal-magenta'
              }`}
            >
              {formatCurrency(annualDrawableCash)}
            </p>
            <p className='text-xs text-terminal-magenta font-ocr'>
              Available for owner's draw
            </p>
          </div>
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
                <TrendingUp className='h-6 w-6 text-terminal-green lucide' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-terminal-muted font-ocr'>
                  Revenue
                </p>
                <p className='text-2xl font-bold text-terminal-green font-ibm'>
                  {formatCurrency(monthlyRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-terminal-dark p-6 rounded-lg shadow-sm border border-terminal-border'>
            <div className='flex items-center'>
              <div className='p-2 bg-terminal-dark rounded-lg border border-terminal-red bg-opacity-40'>
                <TrendingDown className='h-6 w-6 text-terminal-red lucide' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-terminal-muted font-ocr'>
                  Expenses
                </p>
                <p className='text-2xl font-bold text-terminal-red font-ibm'>
                  {formatCurrency(monthlyExpenses)}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-terminal-dark p-6 rounded-lg shadow-sm border border-terminal-border'>
            <div className='flex items-center'>
              <div className='p-2 bg-terminal-dark rounded-lg border border-terminal-purple bg-opacity-40'>
                <DollarSign className='h-6 w-6 text-terminal-purple lucide' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-terminal-muted font-ocr'>
                  Draws
                </p>
                <p className='text-2xl font-bold text-terminal-purple font-ibm'>
                  {formatCurrency(monthlyDraws)}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-terminal-dark p-6 rounded-lg shadow-sm border border-terminal-border'>
            <div className='flex items-center'>
              <div
                className={`p-2 rounded-lg border bg-opacity-40 ${
                  monthlyNetIncome >= 0
                    ? 'bg-terminal-dark border-terminal-green'
                    : 'bg-terminal-dark border-terminal-red'
                }`}
              >
                <DollarSign
                  className={`h-6 w-6 lucide ${
                    monthlyNetIncome >= 0
                      ? 'text-terminal-green'
                      : 'text-terminal-red'
                  }`}
                />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-terminal-muted font-ocr'>
                  Net Income
                </p>
                <p
                  className={`text-2xl font-bold font-ibm ${
                    monthlyNetIncome >= 0
                      ? 'text-terminal-green'
                      : 'text-terminal-red'
                  }`}
                >
                  {formatCurrency(monthlyNetIncome)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Transaction Form */}
      <div className='bg-terminal-light p-6 rounded-lg shadow-sm border border-terminal-border'>
        <h3 className='text-lg font-semibold text-terminal-green mb-4 font-ibm'>
          Add Transaction
        </h3>
        <form onSubmit={handleAddTransaction} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div>
              <label className='block text-sm font-medium text-terminal-text mb-1 font-ocr'>
                Description
              </label>
              <input
                type='text'
                value={newTransactionDescription}
                onChange={(e) => setNewTransactionDescription(e.target.value)}
                placeholder='Transaction description'
                className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ocr'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-terminal-text mb-1 font-ocr'>
                Amount
              </label>
              <input
                type='number'
                value={newTransactionAmount}
                onChange={(e) => setNewTransactionAmount(e.target.value)}
                placeholder='0.00'
                className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ocr'
                min='0'
                step='0.01'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-terminal-text mb-1 font-ocr'>
                Type
              </label>
              <select
                value={newTransactionType}
                onChange={(e) => setNewTransactionType(e.target.value)}
                className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ocr'
              >
                <option value='revenue'>Revenue</option>
                <option value='expense'>Expense</option>
                <option value='draw'>Draw</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-terminal-text mb-1 font-ocr'>
                Date
              </label>
              <input
                type='date'
                value={newTransactionDate}
                onChange={(e) => setNewTransactionDate(e.target.value)}
                className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ocr'
                required
              />
            </div>
          </div>

          {/* Receipt Upload Section - Integrated */}
          <div className='border-t border-terminal-border pt-4'>
            <label className='block text-sm font-medium text-terminal-text mb-2 font-ocr'>
              <Paperclip className='h-4 w-4 inline mr-1 lucide' />
              Attach Receipts (Optional)
            </label>
            <ReceiptUpload
              onUpload={handleReceiptUpload}
              uploading={uploading}
            />
            {receiptFiles.length > 0 && (
              <div className='mt-3 p-3 bg-terminal-dark rounded-md border border-terminal-green'>
                <p className='text-sm text-terminal-green font-ocr'>
                  {receiptFiles.length} receipt
                  {receiptFiles.length !== 1 ? 's' : ''} ready to attach
                </p>
              </div>
            )}
          </div>

          <button
            type='submit'
            className='flex items-center px-4 py-2 bg-terminal-green text-black rounded-md hover:bg-terminal-green/80 focus:outline-none focus:ring-2 focus:ring-terminal-green focus:ring-offset-2 transition-colors font-ocr cursor-pointer'
          >
            <Plus className='h-4 w-4 mr-2 lucide' />
            Add Transaction
          </button>
        </form>
      </div>

      {/* Transactions Table */}
      <div className='bg-terminal-light rounded-lg shadow-sm border border-terminal-border overflow-hidden'>
        <div className='px-6 py-4 border-b border-terminal-border flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-terminal-green font-ibm'>
            Transactions
          </h3>
          <button
            onClick={() => setShowExportModal(true)}
            className='flex items-center px-3 py-1 text-sm bg-terminal-blue text-white rounded hover:bg-terminal-blue/80 transition-colors font-ocr'
          >
            <Download className='h-3 w-3 mr-1 lucide' />
            Export
          </button>
        </div>

        {filteredMonthlyTransactions.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className='hidden md:block overflow-x-auto'>
              <table className='min-w-full divide-y divide-terminal-border'>
                <thead className='bg-terminal-dark'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                      Date
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                      Type
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                      Description
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                      Amount
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                      Receipts
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-terminal-light divide-y divide-terminal-border'>
                  {filteredMonthlyTransactions.map((transaction) => (
                    <tr key={transaction.id} className='hover:bg-terminal-dark'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-text font-ocr'>
                        {formatDate(transaction.date)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border bg-opacity-40 ${
                            transaction.type === 'revenue'
                              ? 'bg-terminal-dark text-terminal-green border-terminal-green'
                              : transaction.type === 'expense'
                              ? 'bg-terminal-dark text-terminal-red border-terminal-red'
                              : 'bg-terminal-dark text-terminal-yellow border-terminal-yellow'
                          }`}
                        >
                          {transaction.type === 'draw'
                            ? 'DRAW'
                            : transaction.type.charAt(0).toUpperCase() +
                              transaction.type.slice(1)}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-sm text-terminal-text font-ocr'>
                        {transaction.description}
                      </td>
                      <td className='px-6 py-4 text-sm text-terminal-text text-right font-ocr'>
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-center'>
                        {transaction.receipts &&
                        transaction.receipts.length > 0 ? (
                          <button
                            onClick={() => openReceiptViewer(transaction)}
                            className='inline-flex items-center px-2 py-1 text-xs bg-terminal-blue text-white rounded hover:bg-terminal-blue/80 transition-colors font-ocr'
                            title={`View ${
                              transaction.receipts.length
                            } receipt${
                              transaction.receipts.length !== 1 ? 's' : ''
                            }`}
                          >
                            <Paperclip className='h-3 w-3 mr-1 lucide' />
                            {transaction.receipts.length}
                          </button>
                        ) : (
                          <span className='text-terminal-muted text-xs font-ocr'>
                            -
                          </span>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-center'>
                        <div className='flex justify-center space-x-2'>
                          <button
                            onClick={() => openEditModal(transaction)}
                            className='text-terminal-blue hover:text-terminal-blue/80 transition-colors cursor-pointer'
                            title='Edit transaction'
                          >
                            <Edit3 className='h-4 w-4 lucide' />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteTransaction(transaction.id)
                            }
                            className='text-terminal-red hover:text-terminal-red/80 transition-colors cursor-pointer'
                            title='Delete transaction'
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
            <div className='md:hidden space-y-4 p-4'>
              {filteredMonthlyTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className='bg-terminal-dark p-4 rounded-lg border border-terminal-border'
                >
                  <div className='flex justify-between items-start mb-3'>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm text-terminal-muted font-ocr'>
                          {formatDate(transaction.date)}
                        </span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border bg-opacity-40 ${
                            transaction.type === 'revenue'
                              ? 'bg-terminal-dark text-terminal-green border-terminal-green'
                              : transaction.type === 'expense'
                              ? 'bg-terminal-dark text-terminal-red border-terminal-red'
                              : 'bg-terminal-dark text-terminal-yellow border-terminal-yellow'
                          }`}
                        >
                          {transaction.type === 'draw'
                            ? 'DRAW'
                            : transaction.type.charAt(0).toUpperCase() +
                              transaction.type.slice(1)}
                        </span>
                      </div>
                      <h4 className='text-terminal-text font-medium font-ocr mb-1'>
                        {transaction.description}
                      </h4>
                      <p className='text-lg font-bold text-terminal-text font-ibm'>
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center justify-between pt-3 border-t border-terminal-border'>
                    <div className='flex items-center space-x-3'>
                      {transaction.receipts &&
                      transaction.receipts.length > 0 ? (
                        <button
                          onClick={() => openReceiptViewer(transaction)}
                          className='inline-flex items-center px-2 py-1 text-xs bg-terminal-blue text-white rounded hover:bg-terminal-blue/80 transition-colors font-ocr'
                          title={`View ${transaction.receipts.length} receipt${
                            transaction.receipts.length !== 1 ? 's' : ''
                          }`}
                        >
                          <Paperclip className='h-3 w-3 mr-1 lucide' />
                          {transaction.receipts.length}
                        </button>
                      ) : (
                        <span className='text-terminal-muted text-xs font-ocr'>
                          No receipts
                        </span>
                      )}
                    </div>

                    <div className='flex items-center space-x-3'>
                      <button
                        onClick={() => openEditModal(transaction)}
                        className='text-terminal-blue hover:text-terminal-blue/80 transition-colors cursor-pointer'
                        title='Edit transaction'
                      >
                        <Edit3 className='h-4 w-4 lucide' />
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className='text-terminal-red hover:text-terminal-red/80 transition-colors cursor-pointer'
                        title='Delete transaction'
                      >
                        <Trash2 className='h-4 w-4 lucide' />
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
              No transactions for this month yet. Add some above!
            </p>
          </div>
        )}
      </div>

      {/* Receipt Viewer Modal */}
      <ReceiptViewer
        isOpen={showReceiptViewer}
        onClose={() => setShowReceiptViewer(false)}
        receipts={selectedTransactionReceipts}
        transactionDescription={selectedTransactionDescription}
        onDeleteReceipt={handleDeleteReceipt}
      />

      {/* Export Modal */}
      <DateRangePicker
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        title='Export Business Transactions'
      />

      {/* Edit Transaction Modal */}
      {showEditModal && editingTransaction && (
        <EditTransactionModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingTransaction(null);
          }}
          onSave={handleEditTransaction}
          transaction={editingTransaction}
        />
      )}
    </div>
  );
}

// Edit Transaction Modal Component
function EditTransactionModal({ isOpen, onClose, onSave, transaction }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('revenue');
  const [date, setDate] = useState('');

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

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description || '');
      setAmount(transaction.amount || '');
      setType(transaction.type || 'revenue');
      setDate(formatDate(new Date(transaction.date)) || '');
    }
  }, [transaction]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!description.trim() || !amount) {
      return;
    }

    onSave({
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      date: new Date(date),
    });
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-terminal-light rounded-lg max-w-md w-full mx-4 border border-terminal-border'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-terminal-border'>
          <h3 className='text-lg font-semibold text-terminal-green font-ibm'>
            Edit Transaction
          </h3>
          <button
            onClick={onClose}
            className='text-terminal-muted hover:text-terminal-text transition-colors'
          >
            <X className='h-6 w-6 lucide' />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          <div>
            <label className='block text-sm font-medium text-terminal-text mb-1 font-ocr'>
              Description
            </label>
            <input
              type='text'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Transaction description'
              className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ocr'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-terminal-text mb-1 font-ocr'>
              Amount
            </label>
            <input
              type='number'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder='0.00'
              className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ocr'
              min='0'
              step='0.01'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-terminal-text mb-1 font-ocr'>
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ocr'
            >
              <option value='revenue'>Revenue</option>
              <option value='expense'>Expense</option>
              <option value='draw'>Draw</option>
            </select>
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

          {/* Footer */}
          <div className='flex items-center justify-end space-x-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm bg-terminal-muted text-terminal-text rounded hover:bg-terminal-muted/80 transition-colors font-ocr'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 text-sm bg-terminal-green text-black rounded hover:bg-terminal-green/80 focus:outline-none focus:ring-2 focus:ring-terminal-green focus:ring-offset-2 transition-colors font-ocr'
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
