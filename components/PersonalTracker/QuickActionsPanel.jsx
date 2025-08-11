'use client';

import { Plus, Download } from 'lucide-react';

export default function QuickActionsPanel({
  onAddIncome,
  onAddBill,
  onExport,
}) {
  return (
    <div className='bg-terminal-light p-6 rounded-lg shadow-sm border border-terminal-border'>
      <h3 className='text-lg font-semibold text-terminal-green mb-4 font-ibm-custom'>
        Quick Actions
      </h3>
      <div className='flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0'>
        <div className='flex flex-wrap items-center gap-4'>
          <button
            onClick={onAddIncome}
            className='flex items-center px-4 py-2 bg-terminal-green text-black rounded-md hover:bg-terminal-green/80 focus:outline-none focus:ring-2 focus:ring-terminal-green focus:ring-offset-2 transition-colors font-ibm cursor-pointer'
          >
            <Plus className='h-4 w-4 mr-2 lucide' />
            Add Income
          </button>
          <button
            onClick={onAddBill}
            className='flex items-center px-4 py-2 bg-terminal-red text-white rounded-md hover:bg-terminal-red/80 focus:outline-none focus:ring-2 focus:ring-terminal-red focus:ring-offset-2 transition-colors font-ibm cursor-pointer'
          >
            <Plus className='h-4 w-4 mr-2 lucide' />
            Add Bill
          </button>
        </div>
        <button
          onClick={onExport}
          className='flex items-center px-3 py-1 text-sm text-terminal-muted hover:text-terminal-text border border-terminal-border rounded hover:border-terminal-muted hover:bg-terminal-dark/20 transition-all duration-200 font-ibm cursor-pointer'
        >
          <Download className='h-3 w-3 mr-1 lucide' />
          Export
        </button>
      </div>
    </div>
  );
}
