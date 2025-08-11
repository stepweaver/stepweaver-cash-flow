'use client';

import { useState } from 'react';
import { Plus, Paperclip } from 'lucide-react';
import ReceiptUpload from '../ReceiptUpload';
import { getCurrentDateString } from '@/lib/utils';

export default function TransactionForm({
  onSubmit,
  receiptFiles,
  onReceiptUpload,
  uploading,
}) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('revenue');
  const [date, setDate] = useState(getCurrentDateString());

  const [localReceiptFiles, setLocalReceiptFiles] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!description.trim() || !amount) {
      return;
    }

    onSubmit({
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      date,
      receipts: localReceiptFiles,
    });

    // Reset form
    setDescription('');
    setAmount('');
    setType('revenue');
    setDate(getCurrentDateString());
    setLocalReceiptFiles([]);
  };

  const handleReceiptUpload = async (files) => {
    const uploadedReceipts = await onReceiptUpload(files);
    setLocalReceiptFiles(uploadedReceipts);
  };

  return (
    <div className='bg-terminal-light p-6 rounded-lg shadow-sm border border-terminal-border'>
      <h3 className='text-lg font-semibold text-terminal-green mb-4 font-ibm-custom'>
        Add Transaction
      </h3>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
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
        </div>

        {/* Receipt Upload Section */}
        <div className='border-t border-terminal-border pt-4'>
          <label className='block text-sm font-medium text-terminal-text mb-2 font-ibm'>
            <Paperclip className='h-4 w-4 inline mr-1 lucide' />
            Attach Receipts (Optional)
          </label>
          <ReceiptUpload onUpload={handleReceiptUpload} uploading={uploading} />
          {localReceiptFiles.length > 0 && (
            <div className='mt-3 p-3 bg-terminal-dark rounded-md border border-terminal-green'>
              <p className='text-sm text-terminal-green font-ibm'>
                {localReceiptFiles.length} receipt
                {localReceiptFiles.length !== 1 ? 's' : ''} ready to attach
              </p>
            </div>
          )}
        </div>

        <div className='flex justify-center md:justify-start'>
          <button
            type='submit'
            className='flex items-center px-4 py-2 bg-terminal-green text-black rounded-md hover:bg-terminal-green/80 focus:outline-none focus:ring-2 focus:ring-terminal-green focus:ring-offset-2 transition-colors font-ibm cursor-pointer'
          >
            <Plus className='h-4 w-4 mr-2 lucide' />
            Add Transaction
          </button>
        </div>
      </form>
    </div>
  );
}
