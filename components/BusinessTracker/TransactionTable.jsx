'use client';

import { useState } from 'react';
import { Trash2, Edit3, Paperclip, Filter, Download } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function TransactionTable({
  transactions,
  filteredTransactions,
  onEdit,
  onDelete,
  onViewReceipts,
  onExport,
  showTransactionFilter,
  onToggleFilter,
  filterStartDate,
  filterEndDate,
  filterType,
  onFilterChange,
  onClearFilters,
  currentMonth,
  currentYear,
}) {
  const getTypeBadge = (type) => {
    const baseClasses =
      'inline-flex px-2 py-1 text-xs font-semibold rounded-md border bg-opacity-40';

    switch (type) {
      case 'revenue':
        return `${baseClasses} bg-terminal-dark text-terminal-green border-terminal-green`;
      case 'expense':
        return `${baseClasses} bg-terminal-dark text-terminal-red border-terminal-red`;
      case 'draw':
        return `${baseClasses} bg-terminal-dark text-purple-400 border-purple-400`;
      default:
        return `${baseClasses} bg-terminal-dark text-terminal-yellow border-terminal-yellow`;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'draw':
        return 'DRAW';
      case 'tax payment':
        return 'TAX';
      case 'revenue':
        return 'REVENUE';
      case 'expense':
        return 'EXPENSE';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getAmountDisplay = (transaction) => {
    const formattedAmount = formatCurrency(transaction.amount);
    return transaction.type === 'revenue'
      ? formattedAmount
      : `-${formattedAmount}`;
  };

  const getAmountColor = (type) => {
    switch (type) {
      case 'revenue':
        return 'text-terminal-green';
      case 'expense':
        return 'text-terminal-red';
      case 'draw':
        return 'text-purple-400';
      default:
        return 'text-terminal-yellow';
    }
  };

  return (
    <div className='bg-terminal-light rounded-lg shadow-sm border border-terminal-border overflow-hidden'>
      <div className='px-4 md:px-6 py-4 border-b border-terminal-border'>
        {/* Desktop Header */}
        <div className='hidden md:flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <h3 className='text-lg font-semibold text-terminal-green font-ibm-custom'>
              All Transactions
            </h3>
            <span className='text-sm text-terminal-muted font-ibm'>
              {filteredTransactions.length} of {transactions.length}{' '}
              transactions
            </span>
            <button
              onClick={onToggleFilter}
              className='flex items-center px-3 py-1 text-sm text-terminal-muted hover:text-terminal-text border border-terminal-border rounded hover:border-terminal-muted hover:bg-terminal-dark/20 transition-all duration-200 font-ibm cursor-pointer'
            >
              <Filter className='h-3 w-3 mr-1 lucide' />
              {showTransactionFilter ? 'Hide Month Filter' : 'Filter by Month'}
            </button>
          </div>
          <button
            onClick={onExport}
            className='flex items-center px-3 py-1 text-sm text-terminal-muted hover:text-terminal-text border border-terminal-border rounded hover:border-terminal-muted hover:bg-terminal-dark/20 transition-all duration-200 font-ibm cursor-pointer'
          >
            <Download className='h-3 w-3 mr-1 lucide' />
            Export
          </button>
        </div>

        {/* Mobile Header */}
        <div className='md:hidden space-y-3'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-terminal-green font-ibm-custom'>
              All Transactions
            </h3>
            <button
              onClick={onExport}
              className='flex items-center px-2 py-1 text-xs text-terminal-muted hover:text-terminal-text border border-terminal-border rounded hover:border-terminal-muted hover:bg-terminal-dark/20 transition-all duration-200 font-ibm cursor-pointer'
            >
              <Download className='h-3 w-3 mr-1 lucide' />
              Export
            </button>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-terminal-muted font-ibm'>
              {filteredTransactions.length} of {transactions.length}{' '}
              transactions
            </span>
            <button
              onClick={onToggleFilter}
              className='flex items-center px-3 py-1 text-sm text-terminal-muted hover:text-terminal-text border border-terminal-border rounded hover:border-terminal-muted hover:bg-terminal-dark/20 transition-all duration-200 font-ibm cursor-pointer'
            >
              <Filter className='h-3 w-3 mr-1 lucide' />
              {showTransactionFilter ? 'Hide' : 'Show'} Filters
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Filter */}
      {showTransactionFilter && (
        <div className='px-4 md:px-6 py-4 border-b border-terminal-border bg-terminal-dark'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
            <div>
              <label className='block text-sm font-medium text-terminal-text mb-1 font-ibm'>
                Month/Year Filter
              </label>
              <div className='px-3 py-2 bg-terminal-light text-terminal-text font-ibm border border-terminal-border rounded-md'>
                {new Date(0, currentMonth - 1).toLocaleDateString('en-US', {
                  month: 'long',
                })}{' '}
                {currentYear}
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium text-terminal-text mb-1 font-ibm'>
                Start Date
              </label>
              <input
                type='date'
                value={filterStartDate}
                onChange={(e) => onFilterChange('startDate', e.target.value)}
                className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-light text-terminal-text font-ibm'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-terminal-text mb-1 font-ibm'>
                End Date
              </label>
              <input
                type='date'
                value={filterEndDate}
                onChange={(e) => onFilterChange('endDate', e.target.value)}
                className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-light text-terminal-text font-ibm'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-terminal-text mb-1 font-ibm'>
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => onFilterChange('type', e.target.value)}
                className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-light text-terminal-text font-ibm'
              >
                <option value='all'>All Types</option>
                <option value='revenue'>Revenue</option>
                <option value='expense'>Expense</option>
                <option value='draw'>Draw</option>
                <option value='tax payment'>Tax Payment</option>
              </select>
            </div>
            <div className='flex items-end'>
              <button
                onClick={onClearFilters}
                className='w-full px-3 py-2 text-sm bg-terminal-muted text-terminal-text rounded hover:bg-terminal-muted/80 transition-colors font-ibm cursor-pointer'
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredTransactions.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className='hidden md:block overflow-x-auto'>
            <table className='min-w-full divide-y divide-terminal-border'>
              <thead className='bg-terminal-dark'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Date
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Type
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Description
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Amount
                  </th>
                  <th className='px-6 py-3 text-center text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Receipts
                  </th>
                  <th className='px-6 py-3 text-center text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-terminal-light divide-y divide-terminal-border'>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className='hover:bg-terminal-dark'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-text font-ibm'>
                      {formatDate(transaction.date)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className={getTypeBadge(transaction.type)}>
                        {getTypeLabel(transaction.type)}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm text-terminal-text font-ibm'>
                      {transaction.description}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm text-right font-ibm ${getAmountColor(
                        transaction.type
                      )}`}
                    >
                      {getAmountDisplay(transaction)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      {transaction.receipts &&
                      transaction.receipts.length > 0 ? (
                        <button
                          onClick={() => onViewReceipts(transaction)}
                          className='inline-flex items-center px-2 py-1 text-xs bg-terminal-blue text-white rounded hover:bg-terminal-blue/80 transition-colors font-ibm'
                          title={`View ${transaction.receipts.length} receipt${
                            transaction.receipts.length !== 1 ? 's' : ''
                          }`}
                        >
                          <Paperclip className='h-3 w-3 mr-1 lucide' />
                          {transaction.receipts.length}
                        </button>
                      ) : (
                        <span className='text-terminal-muted text-xs font-ibm'>
                          -
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <div className='flex justify-center space-x-2'>
                        <button
                          onClick={() => onEdit(transaction)}
                          className='text-terminal-blue hover:text-terminal-blue/80 transition-colors cursor-pointer'
                          title='Edit transaction'
                        >
                          <Edit3 className='h-4 w-4 lucide' />
                        </button>
                        <button
                          onClick={() => onDelete(transaction.id)}
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
          <div className='md:hidden space-y-2 p-4'>
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className='bg-terminal-dark p-3 rounded border border-terminal-border'
              >
                <div className='flex justify-between items-center mb-2'>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-terminal-muted font-ibm'>
                        {formatDate(transaction.date)}
                      </span>
                      <p
                        className={`text-lg font-bold font-ibm-custom ${getAmountColor(
                          transaction.type
                        )}`}
                      >
                        {getAmountDisplay(transaction)}
                      </p>
                    </div>
                    <h4 className='text-terminal-text font-medium font-ibm text-sm mt-1'>
                      {transaction.description}
                    </h4>
                  </div>
                </div>

                <div className='flex items-center justify-between pt-2 border-t border-terminal-border'>
                  <div className='flex items-center'>
                    {transaction.receipts && transaction.receipts.length > 0 ? (
                      <button
                        onClick={() => onViewReceipts(transaction)}
                        className='inline-flex items-center px-2 py-1 text-xs bg-terminal-blue text-white rounded hover:bg-terminal-blue/80 transition-colors font-ibm'
                        title={`View ${transaction.receipts.length} receipt${
                          transaction.receipts.length !== 1 ? 's' : ''
                        }`}
                      >
                        <Paperclip className='h-3 w-3 mr-1 lucide' />
                        {transaction.receipts.length}
                      </button>
                    ) : (
                      <span className='text-terminal-muted text-xs font-ibm'>
                        No receipts
                      </span>
                    )}
                  </div>

                  <div className='flex items-center space-x-3'>
                    <button
                      onClick={() => onEdit(transaction)}
                      className='text-terminal-blue hover:text-terminal-blue/80 transition-colors cursor-pointer'
                      title='Edit transaction'
                    >
                      <Edit3 className='h-3 w-3 lucide' />
                    </button>
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className='text-terminal-red hover:text-terminal-red/80 transition-colors cursor-pointer'
                      title='Delete transaction'
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
        <div className='px-4 md:px-6 py-12 text-center'>
          <p className='text-terminal-muted font-ibm'>
            {transactions.length === 0
              ? 'No transactions yet. Add some above!'
              : 'No transactions match the current filters. Try adjusting your filter criteria.'}
          </p>
        </div>
      )}
    </div>
  );
}
