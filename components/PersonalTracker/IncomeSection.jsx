'use client';

import { Trash2, Edit3 } from 'lucide-react';
import { formatDate, formatCurrency, createLocalDate } from '@/lib/utils';

export default function IncomeSection({
  incomeWithColors,
  getColorClasses,
  getColorStyles,
  onEdit,
  onDelete,
}) {
  return (
    <div className='bg-terminal-light rounded-lg shadow-sm border border-terminal-border overflow-hidden'>
      <div className='px-4 py-3 sm:px-6 sm:py-4 border-b border-terminal-border'>
        <h3 className='text-base sm:text-lg font-semibold text-terminal-green font-ibm-custom'>
          Income
        </h3>
      </div>

      {incomeWithColors && incomeWithColors.length > 0 ? (
        <div className='space-y-2 sm:space-y-4 p-3 sm:p-6'>
          {incomeWithColors.map((income, index) => (
            <div key={income.id} className='space-y-2 sm:space-y-3'>
              {/* Income Details */}
              <div
                className='bg-terminal-dark p-3 sm:p-4 rounded border border-terminal-border'
                style={getColorStyles(income.colorIndex)}
              >
                {/* Mobile Layout - Stacked */}
                <div className='block sm:hidden space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-terminal-text font-ibm'>
                      {income.source}
                    </span>
                    <div className='flex items-center space-x-2'>
                      <button
                        onClick={() => onEdit(income, 'income')}
                        className='p-1 text-terminal-muted hover:text-terminal-text transition-colors'
                        title='Edit income'
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(income.id)}
                        className='p-1 text-terminal-muted hover:text-terminal-red transition-colors'
                        title='Delete income'
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className='flex items-center justify-between text-xs text-terminal-text font-ibm'>
                    <div>
                      <span className='text-terminal-muted'>Date: </span>
                      <span>{formatDate(createLocalDate(income.date))}</span>
                    </div>
                    <div className='text-right'>
                      <div>
                        <span className='text-terminal-muted'>Budget: </span>
                        <span className='text-terminal-green'>
                          {formatCurrency(income.budget)}
                        </span>
                      </div>
                      <div>
                        <span className='text-terminal-muted'>Actual: </span>
                        <span className='text-terminal-green'>
                          {income.actual ? formatCurrency(income.actual) : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout - Grid */}
                <div className='hidden sm:grid grid-cols-4 gap-4 items-center'>
                  <div className='col-span-1'>
                    <span className='text-xs text-terminal-muted font-ibm block mb-1'>
                      Source
                    </span>
                    <span className='text-sm font-medium text-terminal-text font-ibm'>
                      {income.source}
                    </span>
                  </div>
                  <div className='col-span-1'>
                    <span className='text-xs text-terminal-muted font-ibm block mb-1'>
                      Date
                    </span>
                    <span className='text-sm text-terminal-text font-ibm'>
                      {formatDate(createLocalDate(income.date))}
                    </span>
                  </div>
                  <div className='col-span-1 text-right'>
                    <span className='text-xs text-terminal-muted font-ibm block mb-1'>
                      Budget
                    </span>
                    <span className='text-sm text-terminal-green font-ibm'>
                      {formatCurrency(income.budget)}
                    </span>
                  </div>
                  <div className='col-span-1 flex items-center justify-between'>
                    <div className='flex-1 text-right'>
                      <span className='text-xs text-terminal-muted font-ibm block mb-1'>
                        Actual
                      </span>
                      <span className='text-sm text-terminal-green font-ibm'>
                        {income.actual ? formatCurrency(income.actual) : '-'}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2 ml-2'>
                      <button
                        onClick={() => onEdit(income, 'income')}
                        className='p-1 text-terminal-muted hover:text-terminal-text transition-colors'
                        title='Edit income'
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(income.id)}
                        className='p-1 text-terminal-muted hover:text-terminal-red transition-colors'
                        title='Delete income'
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='p-4 sm:p-6 text-center text-terminal-muted font-ibm'>
          No income found for this month.
        </div>
      )}
    </div>
  );
}
