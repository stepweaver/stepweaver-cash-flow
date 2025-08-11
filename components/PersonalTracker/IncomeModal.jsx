'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function IncomeModal({
  isOpen,
  onClose,
  onSave,
  editingIncome,
  monthNames,
  currentMonth,
  currentYear,
}) {
  const [formData, setFormData] = useState({
    source: '',
    budget: '',
    actual: '',
    date: '',
    notes: '',
  });

  useEffect(() => {
    if (editingIncome) {
      setFormData({
        source: editingIncome.source || '',
        budget: editingIncome.budget?.toString() || '',
        actual: editingIncome.actual?.toString() || '',
        date: editingIncome.date || '',
        notes: editingIncome.notes || '',
      });
    } else {
      setFormData({
        source: '',
        budget: '',
        actual: '',
        date: '',
        notes: '',
      });
    }
  }, [editingIncome, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const incomeData = {
      ...formData,
      budget: parseFloat(formData.budget) || 0,
      actual: formData.actual ? parseFloat(formData.actual) : null,
      date: formData.date || new Date().toISOString().split('T')[0],
    };

    onSave(incomeData);
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
          <h3 className='text-lg font-semibold text-terminal-green font-ibm-custom'>
            {editingIncome ? 'Edit Income' : 'Add Income'}
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
              Source
            </label>
            <input
              type='text'
              name='source'
              value={formData.source}
              onChange={handleChange}
              className='w-full px-3 py-2 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent font-ibm'
              placeholder='e.g., Salary, Freelance, Investment'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-terminal-text mb-2 font-ibm'>
              Budget Amount
            </label>
            <input
              type='number'
              name='budget'
              value={formData.budget}
              onChange={handleChange}
              step='0.01'
              min='0'
              className='w-full px-3 py-2 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent font-ibm'
              placeholder='0.00'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-terminal-text mb-2 font-ibm'>
              Actual Amount (Optional)
            </label>
            <input
              type='number'
              name='actual'
              value={formData.actual}
              onChange={handleChange}
              step='0.01'
              min='0'
              className='w-full px-3 py-2 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent font-ibm'
              placeholder='Leave empty if not received yet'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-terminal-text mb-2 font-ibm'>
              Date
            </label>
            <input
              type='date'
              name='date'
              value={formData.date}
              onChange={handleChange}
              className='w-full px-3 py-2 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent font-ibm'
            />
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
              className='w-full px-3 py-2 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent font-ibm'
              placeholder='Additional details about this income'
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
              className='px-4 py-2 bg-terminal-green text-black rounded-md hover:bg-terminal-green/80 focus:outline-none focus:ring-2 focus:ring-terminal-green focus:ring-offset-2 transition-colors font-ibm cursor-pointer'
            >
              {editingIncome ? 'Update' : 'Add'} Income
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
