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
          <div className='flex items-center space-x-2'>
            <span className='text-xs text-terminal-muted font-ibm'>
              Income Periods:
            </span>
          </div>
        )}
        <p className='text-sm text-terminal-muted font-ibm mt-1'>
          {incomeWithColors && incomeWithColors.length > 0 ? (
            <span>
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
                  <span key={index}>
                    <span style={{ color }} className='font-medium'>
                      P{periodNumber}: {source} ({amount}) - {date}
                    </span>
                    {index < incomeWithColors.length - 1 && (
                      <span className='text-terminal-muted'> | </span>
                    )}
                  </span>
                );
              })}
            </span>
          ) : (
            'No income periods'
          )}
        </p>
      </div>

      {billsWithColorCoding && billsWithColorCoding.length > 0 ? (
        <div className='p-6 space-y-3'>
          {billsWithColorCoding.map((bill) => {
            const currentStatus = getStatusOption(bill.status);
            const StatusIcon = currentStatus.icon;

            return (
              <div
                key={bill.id}
                className='bg-terminal-dark p-3 rounded border border-terminal-border'
                style={getColorStyles(bill.colorIndex)}
              >
                <div className='flex justify-between items-center mb-2'>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-terminal-muted font-ibm'>
                        {bill.dueDate
                          ? formatDate(createLocalDate(bill.dueDate))
                          : '-'}
                      </span>
                      <p className='text-lg font-bold text-terminal-red font-ibm-custom'>
                        {formatCurrency(bill.amountDue)}
                      </p>
                    </div>
                    <h4 className='text-terminal-text font-medium font-ibm text-sm mt-1'>
                      {bill.name}
                    </h4>
                    {bill.notes && (
                      <p className='text-xs text-terminal-muted font-ibm mt-1'>
                        {bill.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status and Actions */}
                <div className='flex items-center justify-between'>
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
                  </div>

                  <div className='flex items-center space-x-2'>
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
            );
          })}
        </div>
      ) : (
        <div className='p-6 text-center text-terminal-muted font-ibm'>
          No bills found for this month.
        </div>
      )}
    </div>
  );
}
