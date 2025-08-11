'use client';

import { Trash2, Edit3 } from 'lucide-react';
import { formatDate, formatCurrency, createLocalDate } from '@/lib/utils';

export default function IncomeSection({
  incomeWithColors,
  getColorClasses,
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
        <>
          {/* Desktop Table View */}
          <div className='hidden md:block overflow-x-auto'>
            <table className='min-w-full divide-y divide-terminal-border'>
              <thead className='bg-terminal-dark'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Source
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Date
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Budget
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Actual
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Notes
                  </th>
                  <th className='px-6 py-3 text-center text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-terminal-light divide-y divide-terminal-border'>
                {incomeWithColors.map((income) => (
                  <tr key={income.id} className='hover:bg-terminal-dark'>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-terminal-text font-ibm ${
                        income.colorIndex === 0
                          ? 'border-l-4 border-l-[#8b949e]'
                          : income.colorIndex === 1
                          ? 'border-l-4 border-l-[#00ff41]'
                          : income.colorIndex === 2
                          ? 'border-l-4 border-l-[#ff55ff]'
                          : income.colorIndex === 3
                          ? 'border-l-4 border-l-[#ffff00]'
                          : income.colorIndex === 4
                          ? 'border-l-4 border-l-[#38beff]'
                          : income.colorIndex === 5
                          ? 'border-l-4 border-l-[#56b6c2]'
                          : income.colorIndex === 6
                          ? 'border-l-4 border-l-[#ffa500]'
                          : income.colorIndex === 7
                          ? 'border-l-4 border-l-[#a855f7]'
                          : income.colorIndex === 8
                          ? 'border-l-4 border-l-[#ff3e3e]'
                          : income.colorIndex === 9
                          ? 'border-l-4 border-l-[#ffffff]'
                          : 'border-l-4 border-l-[#a855f7]'
                      }`}
                    >
                      {income.source}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-text font-ibm'>
                      {formatDate(createLocalDate(income.date))}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-green text-right font-ibm'>
                      {formatCurrency(income.budget)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-green text-right font-ibm'>
                      {income.actual ? formatCurrency(income.actual) : '-'}
                    </td>
                    <td className='px-6 py-4 text-sm text-terminal-text font-ibm'>
                      {income.notes}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <div className='flex justify-center space-x-2'>
                        <button
                          onClick={() => onEdit(income, 'income')}
                          className='text-terminal-blue hover:text-terminal-blue/80 transition-colors cursor-pointer'
                          title='Edit income'
                        >
                          <Edit3 className='h-4 w-4 lucide' />
                        </button>
                        <button
                          onClick={() => onDelete(income.id)}
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
          {/* Mobile Card View */}
          <div className='md:hidden space-y-2 p-4'>
            {incomeWithColors.map((income) => (
              <div
                key={income.id}
                className={`bg-terminal-dark p-3 rounded border border-terminal-border ${getColorClasses(
                  income.colorIndex
                )}`}
              >
                <div className='flex justify-between items-center mb-2'>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-terminal-muted font-ibm'>
                        {formatDate(createLocalDate(income.date))}
                      </span>
                      <p className='text-lg font-bold text-terminal-green font-ibm-custom'>
                        {income.actual
                          ? formatCurrency(income.actual)
                          : formatCurrency(income.budget)}
                      </p>
                    </div>
                    <h4 className='text-terminal-text font-medium font-ibm text-sm mt-1'>
                      {income.source}
                    </h4>
                    {income.notes && (
                      <p className='text-xs text-terminal-muted font-ibm mt-1'>
                        {income.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className='flex items-center justify-between pt-2 border-t border-terminal-border'>
                  <div className='text-xs text-terminal-muted font-ibm'>
                    Budget: {formatCurrency(income.budget)}
                    {income.actual &&
                      ` • Actual: ${formatCurrency(income.actual)}`}
                  </div>

                  <div className='flex items-center space-x-3'>
                    <button
                      onClick={() => onEdit(income, 'income')}
                      className='text-terminal-blue hover:text-terminal-blue/80 transition-colors cursor-pointer'
                      title='Edit income'
                    >
                      <Edit3 className='h-3 w-3 lucide' />
                    </button>
                    <button
                      onClick={() => onDelete(income.id)}
                      className='text-terminal-red hover:text-terminal-red/80 transition-colors cursor-pointer'
                      title='Delete income'
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
        <div className='px-6 py-12 text-center'>
          <p className='text-terminal-muted font-ibm'>
            {!incomeWithColors
              ? 'Loading income data...'
              : 'No income entries yet. Add some above!'}
          </p>
        </div>
      )}
    </div>
  );
}
