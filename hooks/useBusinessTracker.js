import { useState, useEffect } from 'react';
import {
  addBusinessTransaction,
  getBusinessTransactions,
  deleteBusinessTransaction,
  uploadReceiptFile,
  deleteReceiptFile,
  updateBusinessTransaction,
} from '@/lib/firebase';
import {
  exportToCSV,
  exportToJSON,
  generatePDFHTML,
  downloadFile,
  downloadReceiptsAsZip,
} from '@/lib/exportUtils';
import {
  createLocalDate,
  getCurrentDateString,
  safeParseFloat,
} from '@/lib/utils';

export function useBusinessTracker() {
  const [transactions, setTransactions] = useState([]);
  const [receiptFiles, setReceiptFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);
  const [selectedTransactionReceipts, setSelectedTransactionReceipts] = useState([]);
  const [selectedTransactionDescription, setSelectedTransactionDescription] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Initialize with current month and year
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Transaction filter state
  const [showTransactionFilter, setShowTransactionFilter] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterType, setFilterType] = useState('all');

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

  const handleAddTransaction = async (transactionData) => {
    const newTransaction = {
      description: transactionData.description,
      amount: transactionData.amount,
      type: transactionData.type,
      date: createLocalDate(transactionData.date),
      receipts: transactionData.receipts || [],
    };

    try {
      const savedTransaction = await addBusinessTransaction(newTransaction);
      setTransactions((prev) => [savedTransaction, ...prev]);
      setReceiptFiles([]);
      return savedTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
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
      throw error;
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

      return uploadedReceipts;
    } catch (error) {
      console.error('Error uploading receipts:', error);
      throw error;
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
      throw error;
    }
  };

  // Export functions
  const getTransactionsForExport = (startDate, endDate) => {
    const start = createLocalDate(startDate);
    const end = createLocalDate(endDate);

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
      throw new Error('No transactions found in the selected date range.');
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

  // Filter transactions for display (all transactions with optional date/type filters)
  const filteredDisplayTransactions = transactions.filter((transaction) => {
    // Type filter
    if (filterType !== 'all' && transaction.type !== filterType) {
      return false;
    }

    // Date filter
    if (filterStartDate || filterEndDate) {
      const transactionDate = new Date(transaction.date);

      if (filterStartDate) {
        const startDate = createLocalDate(filterStartDate);
        if (transactionDate < startDate) return false;
      }

      if (filterEndDate) {
        const endDate = createLocalDate(filterEndDate);
        if (transactionDate > endDate) return false;
      }
    }

    return true;
  });

  // Filter transactions for current month (for summary statistics)
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

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'startDate':
        setFilterStartDate(value);
        break;
      case 'endDate':
        setFilterEndDate(value);
        break;
      case 'type':
        setFilterType(value);
        break;
      default:
        break;
    }
  };

  const clearFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterType('all');
  };

  return {
    // State
    transactions,
    currentMonth,
    currentYear,
    showTransactionFilter,
    filterStartDate,
    filterEndDate,
    filterType,
    showReceiptViewer,
    selectedTransactionReceipts,
    selectedTransactionDescription,
    showExportModal,
    showEditModal,
    editingTransaction,
    uploading,

    // Computed values
    filteredDisplayTransactions,
    monthlyRevenue,
    monthlyExpenses,
    monthlyDraws,
    monthlyNetIncome,
    annualRevenue,
    annualExpenses,
    annualDraws,
    annualNetProfit,
    annualTaxableIncome,
    annualTaxReserve,
    annualDrawableCash,

    // Actions
    handleAddTransaction,
    handleDeleteTransaction,
    handleReceiptUpload,
    openReceiptViewer,
    handleDeleteReceipt,
    openEditModal,
    handleEditTransaction,
    handleExport,
    changeMonth,
    handleFilterChange,
    clearFilters,

    // Modal controls
    setShowReceiptViewer,
    setShowExportModal,
    setShowEditModal,
    setEditingTransaction,
  };
}
