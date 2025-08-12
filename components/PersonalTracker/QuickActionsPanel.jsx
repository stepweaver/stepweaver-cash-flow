'use client';

import { Plus, Download, Calendar, Info } from 'lucide-react';
import Card from '../common/Card';

export default function QuickActionsPanel({
  onAddIncome,
  onAddBill,
  onExport,
  onGenerateBills,
  currentMonth,
  currentYear,
  billTemplates,
}) {
  const hasTemplates = billTemplates && billTemplates.length > 0;
  const currentMonthName = new Date(
    currentYear,
    currentMonth
  ).toLocaleDateString('en-US', { month: 'long' });

  return (
    <Card>
      <h3 className='text-lg font-semibold text-terminal-green mb-4 font-ibm-custom'>
        Quick Actions
      </h3>
      <div className='flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0'>
        <div className='flex flex-wrap items-center gap-4'>
          <button
            onClick={onAddIncome}
            className='flex items-center px-4 py-2 bg-terminal-green text-black rounded-md hover:bg-terminal-green/80 focus:outline-none focus:ring-2 focus:ring-terminal-green focus:ring-offset-2 transition-colors font-ibm cursor-pointer'
          >
            <Plus className='h-4 w-4 mr-2' />
            Add Income
          </button>
          <button
            onClick={onAddBill}
            className='flex items-center px-4 py-2 bg-terminal-blue text-white rounded-md hover:bg-terminal-blue/80 focus:outline-none focus:ring-2 focus:ring-terminal-blue focus:ring-offset-2 transition-colors font-ibm cursor-pointer'
          >
            <Plus className='h-4 w-4 mr-2' />
            Add Bill
          </button>
          <div className='relative group'>
            <button
              onClick={() => onGenerateBills(currentMonth, currentYear)}
              disabled={!hasTemplates}
              className={`flex items-center px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors font-ibm cursor-pointer ${
                hasTemplates
                  ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500'
                  : 'bg-purple-800 text-white cursor-not-allowed'
              }`}
              title={
                hasTemplates
                  ? `Generate blank bill entries for ${currentMonthName} ${currentYear} from your templates`
                  : 'No bill templates available'
              }
            >
              <Calendar className='h-4 w-4 mr-2' />
              Generate Bills
            </button>

            {/* Tooltip */}
            <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-terminal-dark text-terminal-text text-xs rounded border border-terminal-border opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10'>
              {hasTemplates
                ? `Creates blank bill entries for ${currentMonthName} ${currentYear}`
                : 'Create templates in Admin panel first'}
              <div className='absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-terminal-dark'></div>
            </div>
          </div>
        </div>
        <button
          onClick={onExport}
          className='flex items-center px-3 py-1 text-sm text-terminal-muted hover:text-terminal-text border border-terminal-muted hover:bg-terminal-dark/20 transition-all duration-200 font-ibm cursor-pointer'
        >
          <Download className='h-3 w-3 mr-1' />
          Export
        </button>
      </div>

      {/* Generate Bills Info */}
      {hasTemplates && (
        <div className='mt-4 p-3 bg-purple-100 border border-purple-300 rounded-md'>
          <div className='flex items-start space-x-2'>
            <Info className='h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0' />
            <div className='text-sm text-purple-700 font-ibm'>
              <p className='font-medium mb-1'>Generate Bills</p>
              <p className='text-purple-600'>
                This will create blank bill entries for {currentMonthName}{' '}
                {currentYear} based on your {billTemplates.length} template
                {billTemplates.length !== 1 ? 's' : ''}. Each generated bill
                will be completely blank for you to fill in with actual amounts
                and details.
              </p>
            </div>
          </div>
        </div>
      )}

      {!hasTemplates && (
        <div className='mt-4 p-3 bg-terminal-purple/40 border border-purple-300 rounded-md'>
          <div className='flex items-start space-x-2'>
            <Info className='h-4 w-4 text-terminal-purple mt-0.5 flex-shrink-0' />
            <div className='text-sm text-white font-ibm'>
              <p className='font-medium mb-1'>No Bill Templates Available</p>
              <p className='text-white'>
                To generate bills automatically, first create bill templates in
                the Admin panel. Templates define the structure of bills that
                will be generated each month.
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
