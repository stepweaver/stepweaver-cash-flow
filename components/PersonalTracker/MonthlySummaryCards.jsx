'use client';

import { Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function MonthlySummaryCards({
  currentMonth,
  currentYear,
  monthNames,
  totalIncomeBudget,
  totalIncomeActual,
  totalBillsDue,
  totalBillsPaid,
  incomeVariance,
  incomeVariancePercent,
  discretionaryIncome,
  pendingBillsCount,
  paidBillsCount,
  unsetBillsCount,
}) {
  return (
    <div className='bg-terminal-light p-6 rounded-lg shadow-sm border border-terminal-border'>
      <h3 className='text-xl font-semibold text-terminal-green mb-4 flex items-center font-ibm-custom'>
        <Calendar className='h-5 w-5 mr-2 lucide' />[
        {monthNames[currentMonth - 1]} {currentYear}]
      </h3>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-terminal-dark p-6 rounded-lg shadow-sm border border-terminal-border'>
          <div className='flex items-center'>
            <div className='p-2 bg-terminal-dark rounded-lg border border-terminal-green bg-opacity-40'>
              <DollarSign className='h-6 w-6 text-terminal-green lucide' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-terminal-muted font-ibm'>
                Income Budget
              </p>
              <p className='text-2xl font-bold text-terminal-green font-ibm-custom'>
                {formatCurrency(totalIncomeBudget)}
              </p>
              <p className='text-xs text-terminal-muted font-ibm'>
                Actual: {formatCurrency(totalIncomeActual)}
              </p>
              <p
                className={`text-xs font-ibm ${
                  incomeVariance >= 0
                    ? 'text-terminal-green'
                    : 'text-terminal-red'
                }`}
              >
                Variance: {incomeVariance >= 0 ? '+' : ''}
                {formatCurrency(incomeVariance)} (
                {incomeVariancePercent.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>

        <div className='bg-terminal-dark p-6 rounded-lg shadow-sm border border-terminal-border'>
          <div className='flex items-center'>
            <div className='p-2 bg-terminal-dark rounded-lg border border-terminal-red bg-opacity-40'>
              <DollarSign className='h-6 w-6 text-terminal-red lucide' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-terminal-muted font-ibm'>
                Bills Due
              </p>
              <p className='text-2xl font-bold text-terminal-red font-ibm-custom'>
                {formatCurrency(totalBillsDue)}
              </p>
              <p className='text-xs text-terminal-muted font-ibm'>
                Paid: {formatCurrency(totalBillsPaid)}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-terminal-dark p-6 rounded-lg shadow-sm border border-terminal-border'>
          <div className='flex items-center'>
            <div
              className={`p-2 rounded-lg border bg-opacity-40 ${
                discretionaryIncome >= 0
                  ? 'bg-terminal-dark border-terminal-green'
                  : 'bg-terminal-dark border-terminal-red'
              }`}
            >
              <DollarSign
                className={`h-6 w-6 lucide ${
                  discretionaryIncome >= 0
                    ? 'text-terminal-green'
                    : 'text-terminal-red'
                }`}
              />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-terminal-muted font-ibm'>
                Discretionary Income
              </p>
              <p
                className={`text-2xl font-bold font-ibm-custom ${
                  discretionaryIncome >= 0
                    ? 'text-terminal-green'
                    : 'text-terminal-red'
                }`}
              >
                {formatCurrency(discretionaryIncome)}
              </p>
              <p className='text-xs text-terminal-muted font-ibm'>
                After Bills Paid
              </p>
            </div>
          </div>
        </div>

        <div className='bg-terminal-dark p-6 rounded-lg shadow-sm border border-terminal-border'>
          <div className='flex items-center'>
            <div className='p-2 bg-terminal-dark rounded-lg border border-terminal-purple bg-opacity-40'>
              <AlertCircle className='h-6 w-6 text-terminal-purple lucide' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-terminal-muted font-ibm'>
                Bills Status
              </p>
              <p className='text-2xl font-bold text-terminal-purple font-ibm-custom'>
                {pendingBillsCount + unsetBillsCount}
              </p>
              <p className='text-xs text-terminal-muted font-ibm'>
                {pendingBillsCount} Pending • {paidBillsCount} Paid
              </p>
              <p className='text-xs text-terminal-muted font-ibm'>
                {unsetBillsCount} -
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
