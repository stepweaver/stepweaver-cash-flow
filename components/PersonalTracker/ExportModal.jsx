'use client';

import { useState } from 'react';
import { X, Download } from 'lucide-react';
import DateRangePicker from '../DateRangePicker';

export default function ExportModal({
  isOpen,
  onClose,
  onExport,
  monthNames,
  currentMonth,
  currentYear,
}) {
  const [exportFormat, setExportFormat] = useState('csv');

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-terminal-light rounded-lg max-w-md w-full mx-4 border border-terminal-border'>
        <div className='flex items-center justify-between p-6 border-b border-terminal-border'>
          <h3 className='text-lg font-semibold text-terminal-green font-ibm-custom'>
            Export Data
          </h3>
          <button
            onClick={onClose}
            className='text-terminal-muted hover:text-terminal-text transition-colors'
          >
            <X className='h-5 w-5 lucide' />
          </button>
        </div>

        <div className='p-6 space-y-4'>
          <div>
            <label className='block text-sm font-medium text-terminal-text mb-2 font-ibm'>
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className='w-full px-3 py-2 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent font-ibm'
            >
              <option value='csv'>CSV</option>
              <option value='json'>JSON</option>
              <option value='pdf'>PDF</option>
            </select>
          </div>

          <DateRangePicker
            onExport={async (startDate, endDate, format, includeReceipts) => {
              try {
                await onExport({
                  startDate,
                  endDate,
                  format: exportFormat,
                  includeReceipts,
                });
                onClose();
              } catch (error) {
                console.error('Export error:', error);
                alert('Export failed. Please try again.');
              }
            }}
          />

          <div className='flex justify-end space-x-3 pt-4'>
            <button
              onClick={onClose}
              className='px-4 py-2 text-terminal-muted hover:text-terminal-text border border-terminal-border rounded-md hover:border-terminal-muted hover:bg-terminal-dark/20 transition-all duration-200 font-ibm cursor-pointer'
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const currentDate = new Date();
                const startDate = new Date(
                  currentDate.getFullYear(),
                  currentMonth,
                  1
                );
                const endDate = new Date(
                  currentDate.getFullYear(),
                  currentMonth + 1,
                  0
                );

                onExport({
                  startDate: startDate.toISOString().split('T')[0],
                  endDate: endDate.toISOString().split('T')[0],
                  format: exportFormat,
                  includeReceipts: false,
                });
                onClose();
              }}
              className='px-4 py-2 bg-terminal-green text-black rounded-md hover:bg-terminal-green/80 focus:outline-none focus:ring-2 focus:ring-terminal-green focus:ring-offset-2 transition-colors font-ibm cursor-pointer flex items-center'
            >
              <Download className='h-4 w-4 mr-2 lucide' />
              Export Current Month
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
