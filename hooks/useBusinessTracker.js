import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/authContext.js';
import { useTokenManager } from '@/lib/client-token-manager.js';
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

export const useBusinessTracker = () => {
  const { user } = useAuth();
  const tokenManager = useTokenManager();

  // Use the tokenManager directly - the memoization should handle stability
  const memoizedTokenManager = tokenManager;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [receiptFiles, setReceiptFiles] = useState([]);
  const [selectedTransactionReceipts, setSelectedTransactionReceipts] = useState([]);
  const [selectedTransactionDescription, setSelectedTransactionDescription] = useState('');
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Initialize with current month and year (1-indexed: January = 1, July = 7, August = 8)
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());

  // Transaction filter state
  const [showTransactionFilter, setShowTransactionFilter] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Export modal state
  const [showExportModal, setShowExportModal] = useState(false);

  // Debug: Track when dependencies change
  useEffect(() => {
    console.log('useBusinessTracker dependencies changed:', {
      user: user?.uid || 'no-user',
      tokenManagerId: memoizedTokenManager ? 'tokenManager-exists' : 'no-tokenManager'
    });
  }, [user?.uid, memoizedTokenManager]);

  // Load transactions from Firebase when user is authenticated
  useEffect(() => {
    console.log('useBusinessTracker useEffect triggered:', { user: !!user, tokenManager: !!memoizedTokenManager });

    // Don't load if user is not authenticated or if we're still loading
    if (!user || user === null) {
      console.log('User not authenticated, skipping data load');
      return;
    }

    const loadTransactions = async () => {
      try {
        setLoading(true);
        console.log('Loading business transactions...');
        const data = await memoizedTokenManager.getBusinessTransactions();
        console.log('Transactions loaded successfully:', data);
        setTransactions(data.transactions || data || []);
      } catch (error) {
        console.error('Error loading transactions:', error);
        // Fallback to localStorage if Firebase fails
        const savedTransactions = localStorage.getItem('businessTransactions');
        if (savedTransactions) {
          try {
            const parsed = JSON.parse(savedTransactions);
            setTransactions(parsed);
          } catch (parseError) {
            console.error('Error parsing localStorage data:', parseError);
            setTransactions([]);
          }
        } else {
          setTransactions([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [user?.uid, memoizedTokenManager]); // Use memoized tokenManager

  const handleAddTransaction = async (transactionData) => {
    const newTransaction = {
      description: transactionData.description,
      amount: transactionData.amount,
      type: transactionData.type,
      date: createLocalDate(transactionData.date),
      receipts: transactionData.receipts || [],
    };

    try {
      const savedTransaction = await memoizedTokenManager.createBusinessTransaction(newTransaction);
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
      // Delete the transaction (receipts will be cleaned up server-side)
      await memoizedTokenManager.deleteBusinessTransaction(idToDelete);
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
        // Convert file to base64 for storage and display
        const reader = new FileReader();
        const fileData = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const receiptData = {
          id: `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          mimeType: file.type,
          uploadDate: new Date().toISOString(),
          data: fileData, // Store the actual file data as base64
          url: fileData, // Also store as URL for compatibility
        };
        uploadedReceipts.push(receiptData);
      }

      return uploadedReceipts;
    } catch (error) {
      console.error('Error processing receipts:', error);
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

      // Update the transaction to remove the receipt
      const transaction = transactions.find(
        (t) => t.receipts && t.receipts.some((r) => r.id === receiptId)
      );

      if (transaction) {
        const updatedReceipts = transaction.receipts.filter(
          (r) => r.id !== receiptId
        );
        await memoizedTokenManager.updateBusinessTransaction(transaction.id, {
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
      await memoizedTokenManager.updateBusinessTransaction(editingTransaction.id, updatedData);

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

    if (!start || !end) {
      console.error('Invalid date range for export:', { startDate, endDate, start, end });
      return [];
    }

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
    try {
      const exportTransactions = getTransactionsForExport(startDate, endDate);

      if (exportTransactions.length === 0) {
        throw new Error('No transactions found in the selected date range.');
      }

      // Safely create date range string
      const startDateStr = startDate ? String(startDate).split('T')[0] : 'unknown';
      const endDateStr = endDate ? String(endDate).split('T')[0] : 'unknown';
      const dateRange = `${startDateStr}_to_${endDateStr}`;

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
            `Business Transactions (${startDateStr} to ${endDateStr})`
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
          // Flatten all receipts from all transactions into a single array
          const allReceipts = transactionsWithReceipts.flatMap((transaction, transactionIndex) =>
            transaction.receipts.map((receipt, receiptIndex) => ({
              ...receipt,
              transactionDescription: transaction.description,
              transactionIndex,
              receiptIndex
            }))
          );

          if (allReceipts.length > 0) {
            await downloadReceiptsAsZip(allReceipts, dateRange, tokenManager);
          }
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentYear, currentMonth + offset - 1, 1);
    setCurrentMonth(newDate.getMonth() + 1);
    setCurrentYear(newDate.getFullYear());
  };

  // Filter transactions based on current month/year and filters
  const filteredDisplayTransactions = useMemo(() => {
    let filtered = transactions;

    // Only apply month/year filter if explicitly enabled
    if (showTransactionFilter) {
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        const transactionMonth = transactionDate.getMonth() + 1;
        const transactionYear = transactionDate.getFullYear();

        // Filter by month and year
        if (transactionMonth !== currentMonth || transactionYear !== currentYear) {
          return false;
        }

        return true;
      });
    }

    // Apply additional filters (date range and type)
    if (filterStartDate || filterEndDate || filterType !== 'all') {
      filtered = filtered.filter((transaction) => {
        // Apply date range filters
        if (filterStartDate && new Date(transaction.date) < new Date(filterStartDate)) {
          return false;
        }
        if (filterEndDate && new Date(transaction.date) > new Date(filterEndDate)) {
          return false;
        }

        // Apply type filter
        if (filterType !== 'all' && transaction.type !== filterType) {
          return false;
        }

        return true;
      });
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, currentMonth, currentYear, filterStartDate, filterEndDate, filterType, showTransactionFilter]);

  // Filter transactions for annual summary (current year)
  const filteredAnnualTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      const transactionYear = transactionDate.getFullYear();
      return transactionYear === currentYear;
    });
  }, [transactions, currentYear]);

  // Filter transactions for current month (for summary statistics)
  const filteredMonthlyTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() + 1 === currentMonth &&
      transactionDate.getFullYear() === currentYear
    );
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
    setShowTransactionFilter(false);
  };

  return {
    // State
    transactions,
    loading,
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
    receiptFiles,

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
    setShowTransactionFilter,
    setEditingTransaction,
    setReceiptFiles,
  };
}
