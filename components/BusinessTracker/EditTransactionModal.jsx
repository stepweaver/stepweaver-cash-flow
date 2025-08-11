'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createLocalDate, safeParseFloat } from '@/lib/utils';

export default function EditTransactionModal({
  isOpen,
  onClose,
  onSave,
  transaction,
}) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('revenue');
  const [date, setDate] = useState('');

  // Helper function to format date as YYYY-MM-DD
  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) {
      return '';
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description || '');
      setAmount(transaction.amount || '');
      setType(transaction.type || 'revenue');
      setDate(formatDate(new Date(transaction.date)) || '');
    }
  }, [transaction]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!description.trim() || !amount) {
      return;
    }

    onSave({
      description: description.trim(),
      amount: safeParseFloat(amount),
      type,
      date: createLocalDate(date),
    });
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-terminal-light rounded-lg max-w-md w-full mx-4 border border-terminal-border'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-terminal-border'>
          <h3 className='text-lg font-semibold text-terminal-green font-ibm-custom'>
            Edit Transaction
          </h3>
          <button
            onClick={onClose}
            className='text-terminal-muted hover:text-terminal-text transition-colors'
          >
            <X className='h-6 w-6 lucide' />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          <div>
            <label className='block text-sm font-medium text-terminal-text mb-1 font-ibm'>
              Description
            </label>
            <input
              type='text'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Transaction description'
              className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ibm'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-terminal-text mb-1 font-ibm'>
              Amount
            </label>
            <input
              type='number'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder='0.00'
              className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ibm'
              min='0'
              step='0.01'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-terminal-text mb-1 font-ibm'>
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ibm'
            >
              <option value='revenue'>Revenue</option>
              <option value='expense'>Expense</option>
              <option value='draw'>Draw</option>
              <option value='tax payment'>Tax Payment</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-terminal-text mb-1 font-ibm'>
              Date
            </label>
            <input
              type='date'
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ibm'
              required
            />
          </div>

          {/* Footer */}
          <div className='flex items-center justify-end space-x-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm bg-terminal-muted text-terminal-text rounded hover:bg-terminal-muted/80 transition-colors font-ibm'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 text-sm bg-terminal-green text-black rounded hover:bg-terminal-green/80 focus:outline-none focus:ring-2 focus:ring-terminal-green focus:ring-offset-2 transition-colors font-ibm'
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
