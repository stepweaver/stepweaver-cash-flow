'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function BillModal({
  isOpen,
  onClose,
  onSave,
  editingBill,
  monthNames,
  currentMonth,
  currentYear,
}) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    status: 'pending',
    notes: '',
  });

  useEffect(() => {
    if (editingBill) {
      setFormData({
        name: editingBill.name || '',
        amount: editingBill.amount?.toString() || '',
        dueDate: editingBill.dueDate || '',
        status: editingBill.status || 'pending',
        notes: editingBill.notes || '',
      });
    } else {
      setFormData({
        name: '',
        amount: '',
        dueDate: '',
        status: 'pending',
        notes: '',
      });
    }
  }, [editingBill, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const billData = {
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      dueDate: formData.dueDate || new Date().toISOString().split('T')[0],
    };

    onSave(billData);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-terminal-light rounded-lg max-w-md w-full mx-4 border border-terminal-border'>
        <div className='flex items-center justify-between p-6 border-b border-terminal-border'>
          <h3 className='text-lg font-semibold text-terminal-red font-ibm-custom'>
            {editingBill ? 'Edit Bill' : 'Add Bill'}
          </h3>
          <button
            onClick={onClose}
            className='text-terminal-muted hover:text-terminal-text transition-colors'
          >
            <X className='h-5 w-5 lucide' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          <div>
            <label className='block text-sm font-medium text-terminal-text mb-2 font-ibm'>
              Bill Name
            </label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
              className='w-full px-3 py-2 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-red focus:border-transparent font-ibm'
              placeholder='e.g., Rent, Utilities, Insurance'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-terminal-text mb-2 font-ibm'>
              Amount
            </label>
            <input
              type='number'
              name='amount'
              value={formData.amount}
              onChange={handleChange}
              step='0.01'
              min='0'
              className='w-full px-3 py-2 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-red focus:border-transparent font-ibm'
              placeholder='0.00'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-terminal-text mb-2 font-ibm'>
              Due Date
            </label>
            <input
              type='date'
              name='dueDate'
              value={formData.dueDate}
              onChange={handleChange}
              className='w-full px-3 py-2 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-red focus:border-transparent font-ibm'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-terminal-text mb-2 font-ibm'>
              Status
            </label>
            <select
              name='status'
              value={formData.status}
              onChange={handleChange}
              className='w-full px-3 py-2 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text focus:outline-none focus:ring-2 focus:ring-terminal-red focus:border-transparent font-ibm'
            >
              <option value='pending'>Pending</option>
              <option value='paid'>Paid</option>
              <option value='overdue'>Overdue</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-terminal-text mb-2 font-ibm'>
              Notes (Optional)
            </label>
            <textarea
              name='notes'
              value={formData.notes}
              onChange={handleChange}
              rows='3'
              className='w-full px-3 py-2 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-red focus:border-transparent font-ibm'
              placeholder='Additional details about this bill'
            />
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-terminal-muted hover:text-terminal-text border border-terminal-border rounded-md hover:border-terminal-muted hover:bg-terminal-dark/20 transition-all duration-200 font-ibm cursor-pointer'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-terminal-red text-white rounded-md hover:bg-terminal-red/80 focus:outline-none focus:ring-2 focus:ring-terminal-red focus:ring-offset-2 transition-colors font-ibm cursor-pointer'
            >
              {editingBill ? 'Update' : 'Add'} Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
