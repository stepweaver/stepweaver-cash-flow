'use client';

import { useState, useEffect } from 'react';
import { X, Download, Calendar } from 'lucide-react';
import { formatDate, createLocalDate } from '../lib/utils';

export default function DateRangePicker({
  isOpen,
  onClose,
  onExport,
  title = 'Export Data',
}) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportFormat, setExportFormat] = useState('csv');
  const [includeReceipts, setIncludeReceipts] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Note: Helper functions now imported from lib/utils.js

  // Set default dates when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      const lastDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      );

      setStartDate(formatDate(firstDayOfMonth));
      setEndDate(formatDate(lastDayOfMonth));
    }
  }, [isOpen]);

  const handleExport = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }

    if (createLocalDate(startDate) > createLocalDate(endDate)) {
      alert('Start date must be before or equal to end date.');
      return;
    }

    setExporting(true);

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
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const getQuickDateRange = (type) => {
    const today = new Date();
    let start, end;

    switch (type) {
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'thisYear':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31);
        break;
      case 'lastYear':
        start = new Date(today.getFullYear() - 1, 0, 1);
        end = new Date(today.getFullYear() - 1, 11, 31);
        break;
      case 'last30Days':
        start = new Date(today);
        start.setDate(start.getDate() - 30);
        end = today;
        break;
      case 'last90Days':
        start = new Date(today);
        start.setDate(start.getDate() - 90);
        end = today;
        break;
      default:
        return;
    }

    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-terminal-light rounded-lg max-w-md w-full mx-4 border border-terminal-border'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-terminal-border'>
          <div className='flex items-center'>
            <Calendar className='h-5 w-5 mr-2 text-terminal-green lucide' />
            <h3 className='text-lg font-semibold text-terminal-green font-ibm-custom'>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className='text-terminal-muted hover:text-terminal-text transition-colors'
          >
            <X className='h-6 w-6 lucide' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 space-y-6'>
          {/* Quick Date Ranges */}
          <div>
            <label className='block text-sm font-medium text-terminal-text mb-2 font-ibm'>
              Quick Select
            </label>
            <div className='grid grid-cols-2 gap-2'>
              <button
                onClick={() => getQuickDateRange('thisMonth')}
                className='px-3 py-2 text-sm bg-terminal-dark text-terminal-text border border-terminal-border rounded hover:bg-terminal-dark/80 transition-colors font-ibm'
              >
                This Month
              </button>
              <button
                onClick={() => getQuickDateRange('lastMonth')}
                className='px-3 py-2 text-sm bg-terminal-dark text-terminal-text border border-terminal-border rounded hover:bg-terminal-dark/80 transition-colors font-ibm'
              >
                Last Month
              </button>
              <button
                onClick={() => getQuickDateRange('thisYear')}
                className='px-3 py-2 text-sm bg-terminal-dark text-terminal-text border border-terminal-border rounded hover:bg-terminal-dark/80 transition-colors font-ibm'
              >
                This Year
              </button>
              <button
                onClick={() => getQuickDateRange('lastYear')}
                className='px-3 py-2 text-sm bg-terminal-dark text-terminal-text border border-terminal-border rounded hover:bg-terminal-dark/80 transition-colors font-ibm'
              >
                Last Year
              </button>
              <button
                onClick={() => getQuickDateRange('last30Days')}
                className='px-3 py-2 text-sm bg-terminal-dark text-terminal-text border border-terminal-border rounded hover:bg-terminal-dark/80 transition-colors font-ibm'
              >
                Last 30 Days
              </button>
              <button
                onClick={() => getQuickDateRange('last90Days')}
                className='px-3 py-2 text-sm bg-terminal-dark text-terminal-text border border-terminal-border rounded hover:bg-terminal-dark/80 transition-colors font-ibm'
              >
                Last 90 Days
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-terminal-text mb-1 font-ibm'>
                Start Date
              </label>
              <input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ibm'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-terminal-text mb-1 font-ibm'>
                End Date
              </label>
              <input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className='w-full px-3 py-2 border border-terminal-border rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent bg-terminal-dark text-terminal-text font-ibm'
                required
              />
            </div>
          </div>

          {/* Export Format */}
          <div>
            <label className='block text-sm font-medium text-terminal-text mb-2 font-ibm'>
              Export Format
            </label>
            <div className='grid grid-cols-3 gap-2'>
              <label className='flex items-center'>
                <input
                  type='radio'
                  name='exportFormat'
                  value='csv'
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className='mr-2'
                />
                <span className='text-sm text-terminal-text font-ibm'>CSV</span>
              </label>
              <label className='flex items-center'>
                <input
                  type='radio'
                  name='exportFormat'
                  value='json'
                  checked={exportFormat === 'json'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className='mr-2'
                />
                <span className='text-sm text-terminal-text font-ibm'>
                  JSON
                </span>
              </label>
              <label className='flex items-center'>
                <input
                  type='radio'
                  name='exportFormat'
                  value='pdf'
                  checked={exportFormat === 'pdf'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className='mr-2'
                />
                <span className='text-sm text-terminal-text font-ibm'>PDF</span>
              </label>
            </div>
          </div>

          {/* Include Receipts Option */}
          <div>
            <label className='flex items-center'>
              <input
                type='checkbox'
                checked={includeReceipts}
                onChange={(e) => setIncludeReceipts(e.target.checked)}
                className='mr-2'
              />
              <span className='text-sm text-terminal-text font-ibm'>
                Include receipts as ZIP file (when available)
              </span>
            </label>
            <p className='text-xs text-terminal-muted font-ibm mt-1'>
              Creates a separate ZIP file with receipt links and instructions
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end space-x-3 p-6 border-t border-terminal-border bg-terminal-dark'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-sm bg-terminal-muted text-terminal-text rounded hover:bg-terminal-muted/80 transition-colors font-ibm'
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || !startDate || !endDate}
            className='flex items-center px-4 py-2 text-sm bg-terminal-muted text-terminal-text rounded hover:bg-terminal-border hover:text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-muted focus:ring-offset-2 transition-all duration-200 font-ibm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
          >
            {exporting ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-terminal-text mr-2'></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className='h-4 w-4 mr-2 lucide' />
                Export Data
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
