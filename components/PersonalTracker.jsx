'use client';

import { usePersonalTracker } from '@/hooks/usePersonalTracker';
import MonthNavigation from './common/MonthNavigation';
import MonthlySummaryCards from './PersonalTracker/MonthlySummaryCards';
import QuickActionsPanel from './PersonalTracker/QuickActionsPanel';
import IncomeSection from './PersonalTracker/IncomeSection';
import BillsSection from './PersonalTracker/BillsSection';
import IncomeModal from './PersonalTracker/IncomeModal';
import BillModal from './PersonalTracker/BillModal';
import ExportModal from './PersonalTracker/ExportModal';

export default function PersonalTracker() {
  const {
    // State
    currentMonth,
    currentYear,
    monthNames,
    personalData,
    billTemplates,
    showIncomeModal,
    showBillModal,
    showExportModal,
    editingItem,
    editingType,

    // Computed values
    totalIncomeBudget,
    totalIncomeActual,
    totalBillsDue,
    totalBillsPaid,
    incomeVariance,
    incomeVariancePercent,
    discretionaryIncome,
    pendingBillsCount,
    paidBillsCount,
    incomeWithColors,
    billsWithColorCoding,
    unsetBillsCount,

    // Actions
    changeMonth,
    openIncomeModal,
    openBillModal,
    editItem,
    handleSaveIncome,
    handleSaveBill,
    handleDeleteIncome,
    handleDeleteBill,
    handleStatusChange,
    handleExport,
    handleSaveTemplate,
    handleDeleteTemplate,
    handleUpdateTemplate,
    handleGenerateBills,
    loadData,

    // Modal controls
    setShowIncomeModal,
    setShowBillModal,
    setShowExportModal,
    setEditingItem,
    setEditingType,

    // Utility functions
    getColorClasses,
    getColorStyles,
  } = usePersonalTracker();

  return (
    <div className='space-y-6'>
      {/* Month Navigation */}
      <MonthNavigation
        currentMonth={currentMonth}
        currentYear={currentYear}
        monthNames={monthNames}
        onChangeMonth={changeMonth}
      />

      {/* Monthly Summary Cards */}
      <MonthlySummaryCards
        currentMonth={currentMonth}
        currentYear={currentYear}
        monthNames={monthNames}
        totalIncomeBudget={totalIncomeBudget}
        totalIncomeActual={totalIncomeActual}
        totalBillsDue={totalBillsDue}
        totalBillsPaid={totalBillsPaid}
        incomeVariance={incomeVariance}
        incomeVariancePercent={incomeVariancePercent}
        discretionaryIncome={discretionaryIncome}
        pendingBillsCount={pendingBillsCount}
        paidBillsCount={paidBillsCount}
        unsetBillsCount={unsetBillsCount}
      />

      {/* Quick Actions Panel */}
      <QuickActionsPanel
        onAddIncome={openIncomeModal}
        onAddBill={openBillModal}
        onExport={() => setShowExportModal(true)}
        onGenerateBills={handleGenerateBills}
        currentMonth={currentMonth}
        currentYear={currentYear}
        billTemplates={billTemplates}
      />

      {/* Income Section */}
      <IncomeSection
        incomeWithColors={incomeWithColors}
        getColorClasses={getColorClasses}
        getColorStyles={getColorStyles}
        onEdit={editItem}
        onDelete={handleDeleteIncome}
      />

      {/* Bills Section */}
      <BillsSection
        billsWithColorCoding={billsWithColorCoding}
        incomeWithColors={incomeWithColors}
        getColorClasses={getColorClasses}
        getColorStyles={getColorStyles}
        onEdit={editItem}
        onDelete={handleDeleteBill}
        onStatusChange={handleStatusChange}
      />

      {/* Income Modal */}
      <IncomeModal
        isOpen={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        onSave={handleSaveIncome}
        editingIncome={editingType === 'income' ? editingItem : null}
        monthNames={monthNames}
        currentMonth={currentMonth}
        currentYear={currentYear}
      />

      {/* Bill Modal */}
      <BillModal
        isOpen={showBillModal}
        onClose={() => setShowBillModal(false)}
        onSave={handleSaveBill}
        editingBill={editingType === 'bill' ? editingItem : null}
        monthNames={monthNames}
        currentMonth={currentMonth}
        currentYear={currentYear}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        monthNames={monthNames}
        currentMonth={currentMonth}
        currentYear={currentYear}
      />
    </div>
  );
}
