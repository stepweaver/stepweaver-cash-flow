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
      <div className='px-6 py-4 border-b border-terminal-border'>
        <h3 className='text-lg font-semibold text-terminal-green font-ibm-custom'>
          Income
        </h3>
      </div>

      {incomeWithColors && incomeWithColors.length > 0 ? (
        <div className='space-y-4 p-6'>
          {incomeWithColors.map((income, index) => (
            <div key={income.id} className='space-y-3'>
              {/* Income Details */}
              <div
                className='bg-terminal-dark p-4 rounded border border-terminal-border'
                style={getColorStyles(income.colorIndex)}
              >
                <div className='grid grid-cols-1 md:grid-cols-5 gap-4 items-center'>
                  <div className='md:col-span-1'>
                    <span className='text-sm font-medium text-terminal-text font-ibm'>
                      {income.source}
                    </span>
                  </div>
                  <div className='md:col-span-1'>
                    <span className='text-sm text-terminal-text font-ibm'>
                      {formatDate(createLocalDate(income.date))}
                    </span>
                  </div>
                  <div className='md:col-span-1 text-right'>
                    <span className='text-sm text-terminal-green font-ibm'>
                      {formatCurrency(income.budget)}
                    </span>
                  </div>
                  <div className='md:col-span-1 text-right'>
                    <span className='text-sm text-terminal-green font-ibm'>
                      {income.actual ? formatCurrency(income.actual) : '-'}
                    </span>
                  </div>
                  <div className='md:col-span-1 flex items-center justify-between'>
                    <span className='text-sm text-terminal-text font-ibm flex-1'>
                      {income.notes}
                    </span>
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
        <div className='p-6 text-center text-terminal-muted font-ibm'>
          No income found for this month.
        </div>
      )}
    </div>
  );
}
