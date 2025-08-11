'use client';

import { Trash2, Edit3, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { formatDate, formatCurrency, createLocalDate } from '@/lib/utils';

export default function BillsSection({
  billsWithColorCoding,
  getColorClasses,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  return (
    <div className='bg-terminal-light rounded-lg shadow-sm border border-terminal-border overflow-hidden'>
      <div className='px-6 py-4 border-b border-terminal-border'>
        <h3 className='text-lg font-semibold text-terminal-red font-ibm-custom'>
          Bills
        </h3>
      </div>

      {billsWithColorCoding && billsWithColorCoding.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className='hidden md:block overflow-x-auto'>
            <table className='min-w-full divide-y divide-terminal-border'>
              <thead className='bg-terminal-dark'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Bill
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Due Date
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Amount
                  </th>
                  <th className='px-6 py-3 text-center text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Status
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
                {billsWithColorCoding.map((bill) => (
                  <tr key={bill.id} className='hover:bg-terminal-dark'>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-terminal-text font-ibm ${
                        bill.colorIndex === 0
                          ? 'border-l-4 border-l-[#8b949e]'
                          : bill.colorIndex === 1
                          ? 'border-l-4 border-l-[#00ff41]'
                          : bill.colorIndex === 2
                          ? 'border-l-4 border-l-[#ff55ff]'
                          : bill.colorIndex === 3
                          ? 'border-l-4 border-l-[#ffff00]'
                          : bill.colorIndex === 4
                          ? 'border-l-4 border-l-[#38beff]'
                          : bill.colorIndex === 5
                          ? 'border-l-4 border-l-[#56b6c2]'
                          : bill.colorIndex === 6
                          ? 'border-l-4 border-l-[#ffa500]'
                          : bill.colorIndex === 7
                          ? 'border-l-4 border-l-[#a855f7]'
                          : bill.colorIndex === 8
                          ? 'border-l-4 border-l-[#ff3e3e]'
                          : bill.colorIndex === 9
                          ? 'border-l-4 border-l-[#ffffff]'
                          : 'border-l-4 border-l-[#a855f7]'
                      }`}
                    >
                      {bill.name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-text font-ibm'>
                      {formatDate(createLocalDate(bill.dueDate))}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-red text-right font-ibm'>
                      {formatCurrency(bill.amount)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <button
                        onClick={() => onStatusChange(bill.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-ibm cursor-pointer transition-colors ${
                          bill.status === 'paid'
                            ? 'bg-terminal-green/20 text-terminal-green hover:bg-terminal-green/30'
                            : bill.status === 'pending'
                            ? 'bg-terminal-yellow/20 text-terminal-yellow hover:bg-terminal-yellow/30'
                            : 'bg-terminal-red/20 text-terminal-red hover:bg-terminal-red/30'
                        }`}
                      >
                        {bill.status === 'paid' ? (
                          <CheckCircle className='h-3 w-3 mr-1 lucide' />
                        ) : bill.status === 'pending' ? (
                          <Clock className='h-3 w-3 mr-1 lucide' />
                        ) : (
                          <AlertCircle className='h-3 w-3 mr-1 lucide' />
                        )}
                        {bill.status.charAt(0).toUpperCase() +
                          bill.status.slice(1)}
                      </button>
                    </td>
                    <td className='px-6 py-4 text-sm text-terminal-text font-ibm'>
                      {bill.notes}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <div className='flex justify-center space-x-2'>
                        <button
                          onClick={() => onEdit(bill, 'bill')}
                          className='text-terminal-blue hover:text-terminal-blue/80 transition-colors cursor-pointer'
                          title='Edit bill'
                        >
                          <Edit3 className='h-4 w-4 lucide' />
                        </button>
                        <button
                          onClick={() => onDelete(bill.id)}
                          className='text-terminal-red hover:text-terminal-red/80 transition-colors cursor-pointer'
                          title='Delete bill'
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
            {billsWithColorCoding.map((bill) => (
              <div
                key={bill.id}
                className={`bg-terminal-dark p-3 rounded border border-terminal-border ${getColorClasses(
                  bill.colorIndex
                )}`}
              >
                <div className='flex justify-between items-center mb-2'>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-terminal-muted font-ibm'>
                        {formatDate(createLocalDate(bill.dueDate))}
                      </span>
                      <p className='text-lg font-bold text-terminal-red font-ibm-custom'>
                        {formatCurrency(bill.amount)}
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

                <div className='flex items-center justify-between pt-2 border-t border-terminal-border'>
                  <button
                    onClick={() => onStatusChange(bill.id)}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium font-ibm cursor-pointer transition-colors ${
                      bill.status === 'paid'
                        ? 'bg-terminal-green/20 text-terminal-green hover:bg-terminal-green/30'
                        : bill.status === 'pending'
                        ? 'bg-terminal-yellow/20 text-terminal-yellow hover:bg-terminal-yellow/30'
                        : 'bg-terminal-red/20 text-terminal-red hover:bg-terminal-red/30'
                    }`}
                  >
                    {bill.status === 'paid' ? (
                      <CheckCircle className='h-3 w-3 mr-1 lucide' />
                    ) : bill.status === 'pending' ? (
                      <Clock className='h-3 w-3 mr-1 lucide' />
                    ) : (
                      <AlertCircle className='h-3 w-3 mr-1 lucide' />
                    )}
                    {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                  </button>

                  <div className='flex items-center space-x-3'>
                    <button
                      onClick={() => onEdit(bill, 'bill')}
                      className='text-terminal-blue hover:text-terminal-blue/80 transition-colors cursor-pointer'
                      title='Edit bill'
                    >
                      <Edit3 className='h-3 w-3 lucide' />
                    </button>
                    <button
                      onClick={() => onDelete(bill.id)}
                      className='text-terminal-red hover:text-terminal-red/80 transition-colors cursor-pointer'
                      title='Delete bill'
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
            No bills yet. Add some above!
          </p>
        </div>
      )}
    </div>
  );
}
