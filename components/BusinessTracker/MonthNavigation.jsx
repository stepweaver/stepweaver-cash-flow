'use client';

import { getMonthNames } from '@/lib/utils';

export default function MonthNavigation({
  currentMonth,
  currentYear,
  onMonthChange,
}) {
  const monthNames = getMonthNames();

  return (
    <div className='flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0'>
      <div className='flex items-center justify-center md:justify-end space-x-4'>
        <button
          onClick={() => onMonthChange(-1)}
          className='w-12 h-10 flex items-center justify-center text-terminal-muted hover:text-terminal-text hover:bg-terminal-light rounded-md transition-colors font-ibm cursor-pointer'
        >
          ←
        </button>
        <span className='text-lg font-semibold text-terminal-text min-w-[140px] text-center font-ibm'>
          [{monthNames[currentMonth]} {currentYear}]
        </span>
        <button
          onClick={() => onMonthChange(1)}
          className='w-12 h-10 flex items-center justify-center text-terminal-muted hover:text-terminal-text hover:bg-terminal-light rounded-md transition-colors font-ibm cursor-pointer'
        >
          →
        </button>
      </div>
    </div>
  );
}
