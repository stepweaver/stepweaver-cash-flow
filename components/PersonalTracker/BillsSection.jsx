'use client';

import {
  Trash2,
  Edit3,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { formatDate, formatCurrency, createLocalDate } from '@/lib/utils';

export default function BillsSection({
  billsWithColorCoding,
  getColorClasses,
  getColorStyles,
  onEdit,
  onDelete,
  onStatusChange,
  incomeWithColors, // Add this prop to access income periods
}) {
  // Status options with their corresponding colors and icons
  const statusOptions = [
    {
      value: null,
      label: '-',
      color: 'bg-terminal-muted/20 text-terminal-muted',
      icon: AlertCircle,
    },
    {
      value: 'pending',
      label: 'Pending',
      color: 'bg-terminal-yellow/20 text-terminal-yellow',
      icon: Clock,
    },
    {
      value: 'paid',
      label: 'Paid',
      color: 'bg-terminal-green/20 text-terminal-green',
      icon: CheckCircle,
    },
  ];

  const getStatusOption = (status) => {
    return (
      statusOptions.find((option) => option.value === status) ||
      statusOptions[0]
    );
  };

  const handleStatusChange = (billId, newStatus) => {
    onStatusChange(billId, newStatus);
  };

  return (
    <div className='bg-terminal-light rounded-lg shadow-sm border border-terminal-border overflow-hidden'>
      <div className='px-6 py-4 border-b border-terminal-border'>
        <h3 className='text-lg font-semibold text-terminal-red font-ibm-custom mb-2'>
          Bills
        </h3>
        {incomeWithColors && incomeWithColors.length > 0 && (
          <div className='flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0'>
            <span className='text-xs text-terminal-muted font-ibm'>
              Income Periods:
            </span>
          </div>
        )}
        <div className='text-sm text-terminal-muted font-ibm mt-1'>
          {incomeWithColors && incomeWithColors.length > 0 ? (
            <div className='space-y-1'>
              {incomeWithColors.map((income, index) => {
                const periodNumber = index + 1;
                const source = income.source || 'Unknown';
                const amount = formatCurrency(income.actual || income.budget);
                const date = formatDate(createLocalDate(income.date));
                const color =
                  [
                    '#00ff41', // Green
                    '#a855f7', // Purple
                    '#38beff', // Blue
                    '#ffff00', // Yellow
                    '#56b6c2', // Cyan
                    '#ffa500', // Orange
                    '#ff3e3e', // Red
                    '#ff55ff', // Magenta
                    '#ffffff', // White
                  ][index] || '#00ff41';

                return (
                  <div key={index} className='block'>
                    <span style={{ color }} className='font-medium'>
                      P{periodNumber}: {source} | {date}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            'No income periods'
          )}
        </div>
      </div>

      {billsWithColorCoding && billsWithColorCoding.length > 0 ? (
        <div className='p-3 sm:p-6 space-y-2 sm:space-y-3'>
          {billsWithColorCoding.map((bill) => {
            const currentStatus = getStatusOption(bill.status);
            const StatusIcon = currentStatus.icon;

            return (
              <div
                key={bill.id}
                className='bg-terminal-dark p-3 rounded border border-terminal-border'
                style={getColorStyles(bill.colorIndex)}
              >
                {/* Mobile Layout - Stacked with Labels */}
                <div className='block sm:hidden space-y-2'>
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <h4 className='text-terminal-text font-medium font-ibm text-sm mb-1'>
                        <span className='text-terminal-muted text-xs'>
                          Bill:{' '}
                        </span>
                        {bill.url ? (
                          <a
                            href={bill.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-terminal-cyan hover:text-terminal-blue transition-colors underline'
                          >
                            {bill.name}
                          </a>
                        ) : (
                          bill.name
                        )}
                      </h4>
                      <div className='text-xs text-terminal-muted font-ibm'>
                        <span className='text-terminal-muted'>Due: </span>
                        {bill.dueDate
                          ? formatDate(createLocalDate(bill.dueDate))
                          : '-'}
                      </div>
                      {bill.notes && (
                        <button
                          className='text-xs text-terminal-cyan font-ibm mt-1 hover:text-terminal-blue transition-colors'
                          onClick={() => alert(bill.notes)}
                          title='Click to view notes'
                        >
                          📝 View Notes
                        </button>
                      )}
                    </div>
                    <div className='text-right ml-4'>
                      <p className='text-base font-bold text-terminal-red font-ibm-custom mb-2'>
                        <span className='text-terminal-muted text-xs'>
                          Amount:{' '}
                        </span>
                        {formatCurrency(bill.amountDue)}
                      </p>
                    </div>
                  </div>

                  {/* Status and Actions - Right Side */}
                  <div className='flex items-center justify-end space-x-2'>
                    <select
                      value={bill.status || ''}
                      onChange={(e) =>
                        handleStatusChange(bill.id, e.target.value || null)
                      }
                      className={`px-2 py-1 text-xs rounded font-ibm ${currentStatus.color}`}
                    >
                      {statusOptions.map((option) => (
                        <option
                          key={option.value || 'null'}
                          value={option.value || ''}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => onEdit(bill, 'bill')}
                      className='p-1 text-terminal-muted hover:text-terminal-text transition-colors'
                      title='Edit bill'
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(bill.id)}
                      className='p-1 text-terminal-muted hover:text-terminal-red transition-colors'
                      title='Delete bill'
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Desktop Layout - Original */}
                <div className='hidden sm:block'>
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <div className='mb-2'>
                        <span className='text-xs text-terminal-muted font-ibm block mb-1'>
                          Bill Name
                        </span>
                        <h4 className='text-terminal-text font-medium font-ibm text-sm'>
                          {bill.url ? (
                            <a
                              href={bill.url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-terminal-cyan hover:text-terminal-blue transition-colors underline'
                            >
                              {bill.name}
                            </a>
                          ) : (
                            bill.name
                          )}
                        </h4>
                      </div>
                      <div className='flex items-center space-x-6'>
                        <div>
                          <span className='text-xs text-terminal-muted font-ibm block mb-1'>
                            Due Date
                          </span>
                          <span className='text-xs text-terminal-muted font-ibm'>
                            {bill.dueDate
                              ? formatDate(createLocalDate(bill.dueDate))
                              : '-'}
                          </span>
                        </div>
                        {bill.notes && (
                          <div>
                            <span className='text-xs text-terminal-muted font-ibm block mb-1'>
                              Notes
                            </span>
                            <span className='text-xs text-terminal-text font-ibm max-w-xs truncate'>
                              {bill.notes}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Amount Due and Actions - Right Side */}
                    <div className='flex flex-col items-end space-y-3 ml-4'>
                      <div className='text-right'>
                        <span className='text-xs text-terminal-muted font-ibm block mb-1'>
                          Amount Due
                        </span>
                        <p className='text-base font-bold text-terminal-red font-ibm-custom'>
                          {formatCurrency(bill.amountDue)}
                        </p>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <select
                          value={bill.status || ''}
                          onChange={(e) =>
                            handleStatusChange(bill.id, e.target.value || null)
                          }
                          className={`px-2 py-1 text-xs rounded font-ibm ${currentStatus.color}`}
                        >
                          {statusOptions.map((option) => (
                            <option
                              key={option.value || 'null'}
                              value={option.value || ''}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => onEdit(bill, 'bill')}
                          className='p-1 text-terminal-muted hover:text-terminal-text transition-colors'
                          title='Edit bill'
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(bill.id)}
                          className='p-1 text-terminal-muted hover:text-terminal-red transition-colors'
                          title='Delete bill'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className='p-4 sm:p-6 text-center text-terminal-muted font-ibm'>
          No bills found for this month.
        </div>
      )}
    </div>
  );
}
