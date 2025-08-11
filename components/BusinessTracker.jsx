'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import ReceiptViewer from './ReceiptViewer';
import DateRangePicker from './DateRangePicker';
import { useBusinessTracker } from '../hooks/useBusinessTracker';
import SummaryCards from './BusinessTracker/SummaryCards';
import AnnualSummaryCards from './BusinessTracker/AnnualSummaryCards';
import MonthNavigation from './BusinessTracker/MonthNavigation';
import TransactionForm from './BusinessTracker/TransactionForm';
import TransactionTable from './BusinessTracker/TransactionTable';
import EditTransactionModal from './BusinessTracker/EditTransactionModal';

export default function BusinessTracker() {
  const {
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
  } = useBusinessTracker();

  return (
    <div className='space-y-6'>
      {/* Month Navigation */}
      <MonthNavigation
        currentMonth={currentMonth}
        currentYear={currentYear}
        onMonthChange={changeMonth}
      />

      {/* Annual Summary Cards */}
      <AnnualSummaryCards
        currentYear={currentYear}
        annualRevenue={annualRevenue}
        annualExpenses={annualExpenses}
        annualNetProfit={annualNetProfit}
        annualTaxableIncome={annualTaxableIncome}
        annualTaxReserve={annualTaxReserve}
        annualDraws={annualDraws}
        annualDrawableCash={annualDrawableCash}
      />

      {/* Monthly Summary Cards */}
      <SummaryCards
        currentMonth={currentMonth}
        currentYear={currentYear}
        monthlyRevenue={monthlyRevenue}
        monthlyExpenses={monthlyExpenses}
        monthlyDraws={monthlyDraws}
        monthlyNetIncome={monthlyNetIncome}
      />

      {/* Add Transaction Form */}
      <TransactionForm
        onSubmit={handleAddTransaction}
        onReceiptUpload={handleReceiptUpload}
        uploading={uploading}
      />

      {/* Transactions Table */}
      <TransactionTable
        transactions={transactions}
        filteredTransactions={filteredDisplayTransactions}
        onEdit={openEditModal}
        onDelete={handleDeleteTransaction}
        onViewReceipts={openReceiptViewer}
        onExport={() => setShowExportModal(true)}
        showTransactionFilter={showTransactionFilter}
        onToggleFilter={() => setShowTransactionFilter(!showTransactionFilter)}
        filterStartDate={filterStartDate}
        filterEndDate={filterEndDate}
        filterType={filterType}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      {/* Receipt Viewer Modal */}
      {showReceiptViewer && (
        <ReceiptViewer
          receipts={selectedTransactionReceipts}
          transactionDescription={selectedTransactionDescription}
          onClose={() => setShowReceiptViewer(false)}
          onDeleteReceipt={handleDeleteReceipt}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-terminal-light rounded-lg max-w-md w-full mx-4 border border-terminal-border'>
            <div className='flex items-center justify-between p-6 border-b border-terminal-border'>
              <h3 className='text-lg font-semibold text-terminal-green font-ibm-custom'>
                Export Transactions
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className='text-terminal-muted hover:text-terminal-text transition-colors'
              >
                ×
              </button>
            </div>
            <div className='p-6'>
              <DateRangePicker
                onExport={async (
                  startDate,
                  endDate,
                  format,
                  includeReceipts
                ) => {
                  try {
                    await handleExport({
                      startDate,
                      endDate,
                      format,
                      includeReceipts,
                    });
                    setShowExportModal(false);
                  } catch (error) {
                    console.error('Export error:', error);
                    alert('Export failed. Please try again.');
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditTransaction}
        transaction={editingTransaction}
      />
    </div>
  );
}
