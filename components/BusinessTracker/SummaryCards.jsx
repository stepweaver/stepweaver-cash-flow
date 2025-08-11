'use client';

import { Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency, getMonthNames } from '@/lib/utils';

export default function SummaryCards({
  currentMonth,
  currentYear,
  monthlyRevenue,
  monthlyExpenses,
  monthlyDraws,
  monthlyNetIncome,
}) {
  const monthNames = getMonthNames();

  return (
    <>
      {/* Monthly Summary Cards */}
      <div className='bg-terminal-light p-6 rounded-lg shadow-sm border border-terminal-border'>
        <h3 className='text-xl font-semibold text-terminal-green mb-4 flex items-center font-ibm-custom'>
          <Calendar className='h-5 w-5 mr-2 lucide' />[
          {monthNames[currentMonth]} {currentYear}]
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='bg-terminal-dark p-6 rounded-lg shadow-sm border border-terminal-border'>
            <div className='flex items-center'>
              <div className='p-2 bg-terminal-dark rounded-lg border border-terminal-green bg-opacity-40'>
                <TrendingUp className='h-6 w-6 text-terminal-green lucide' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-terminal-muted font-ibm'>
                  Revenue
                </p>
                <p className='text-2xl font-bold text-terminal-green font-ibm-custom'>
                  {formatCurrency(monthlyRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-terminal-dark p-6 rounded-lg shadow-sm border border-terminal-border'>
            <div className='flex items-center'>
              <div className='p-2 bg-terminal-dark rounded-lg border border-terminal-red bg-opacity-40'>
                <TrendingDown className='h-6 w-6 text-terminal-red lucide' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-terminal-muted font-ibm'>
                  Expenses
                </p>
                <p className='text-2xl font-bold text-terminal-red font-ibm-custom'>
                  {formatCurrency(monthlyExpenses)}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-terminal-dark p-6 rounded-lg shadow-sm border border-terminal-border'>
            <div className='flex items-center'>
              <div className='p-2 bg-terminal-dark rounded-lg border border-terminal-purple bg-opacity-40'>
                <DollarSign className='h-6 w-6 text-terminal-purple lucide' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-terminal-muted font-ibm'>
                  Draws
                </p>
                <p className='text-2xl font-bold text-terminal-purple font-ibm-custom'>
                  {formatCurrency(monthlyDraws)}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-terminal-dark p-6 rounded-lg shadow-sm border border-terminal-border'>
            <div className='flex items-center'>
              <div
                className={`p-2 rounded-lg border bg-opacity-40 ${
                  monthlyNetIncome >= 0
                    ? 'bg-terminal-dark border-terminal-green'
                    : 'bg-terminal-dark border-terminal-red'
                }`}
              >
                <DollarSign
                  className={`h-6 w-6 lucide ${
                    monthlyNetIncome >= 0
                      ? 'text-terminal-green'
                      : 'text-terminal-red'
                  }`}
                />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-terminal-muted font-ibm'>
                  Net Income
                </p>
                <p
                  className={`text-2xl font-bold font-ibm-custom ${
                    monthlyNetIncome >= 0
                      ? 'text-terminal-green'
                      : 'text-terminal-red'
                  }`}
                >
                  {formatCurrency(monthlyNetIncome)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
