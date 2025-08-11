'use client';

import { Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Card from '../common/Card';

export default function AnnualSummaryCards({
  currentYear,
  annualRevenue,
  annualExpenses,
  annualNetProfit,
  annualTaxableIncome,
  annualTaxReserve,
  annualDraws,
  annualDrawableCash,
}) {
  return (
    <Card>
      <h3 className='text-xl font-semibold text-terminal-green mb-4 flex items-center font-ibm-custom'>
        <Calendar className='h-5 w-5 mr-2 lucide' />[{currentYear}]
      </h3>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-terminal-dark p-4 rounded-lg border border-terminal-green bg-opacity-40'>
          <p className='text-sm font-medium text-terminal-green font-ibm'>
            Annual Revenue
          </p>
          <p className='text-2xl font-bold text-terminal-green font-ibm-custom'>
            {formatCurrency(annualRevenue)}
          </p>
        </div>

        <div className='bg-terminal-dark p-4 rounded-lg border border-terminal-red bg-opacity-40'>
          <p className='text-sm font-medium text-terminal-red font-ibm'>
            Annual Expenses
          </p>
          <p className='text-2xl font-bold text-terminal-red font-ibm-custom'>
            {formatCurrency(annualExpenses)}
          </p>
        </div>

        <div className='bg-terminal-dark p-4 rounded-lg border border-terminal-green bg-opacity-40'>
          <p className='text-sm font-medium text-terminal-green font-ibm'>
            Annual Net Profit
          </p>
          <p
            className={`text-2xl font-bold font-ibm-custom ${
              annualNetProfit >= 0 ? 'text-terminal-green' : 'text-terminal-red'
            }`}
          >
            {formatCurrency(annualNetProfit)}
          </p>
        </div>

        <div className='bg-terminal-dark p-4 rounded-lg border border-terminal-yellow bg-opacity-40'>
          <p className='text-sm font-medium text-terminal-yellow font-ibm'>
            Taxable Income
          </p>
          <p className='text-2xl font-bold text-terminal-yellow font-ibm-custom'>
            {formatCurrency(annualTaxableIncome)}
          </p>
          <p className='text-xs text-terminal-yellow font-ibm'>
            92.35% of net profit
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
        <div className='bg-terminal-dark p-4 rounded-lg border border-terminal-yellow bg-opacity-40'>
          <p className='text-sm font-medium text-terminal-yellow font-ibm'>
            Tax Reserve
          </p>
          <p className='text-2xl font-bold text-terminal-yellow font-ibm-custom'>
            {formatCurrency(annualTaxReserve)}
          </p>
          <p className='text-xs text-terminal-yellow font-ibm'>
            25% of taxable income
          </p>
        </div>

        <div className='bg-terminal-dark p-4 rounded-lg border border-terminal-purple bg-opacity-40'>
          <p className='text-sm font-medium text-terminal-purple font-ibm'>
            Total Draws
          </p>
          <p className='text-2xl font-bold text-terminal-purple font-ibm-custom'>
            {formatCurrency(annualDraws)}
          </p>
        </div>

        <div className='bg-terminal-dark p-4 rounded-lg border border-terminal-magenta bg-opacity-40'>
          <p className='text-sm font-medium text-terminal-magenta font-ibm'>
            Drawable Cash
          </p>
          <p
            className={`text-2xl font-bold font-ibm-custom ${
              annualDrawableCash > 0
                ? 'text-terminal-magenta'
                : annualDrawableCash < 0
                ? 'text-terminal-red'
                : 'text-terminal-magenta'
            }`}
          >
            {formatCurrency(annualDrawableCash)}
          </p>
          <p className='text-xs text-terminal-magenta font-ibm'>
            Available for owner's draw
          </p>
        </div>
      </div>
    </Card>
  );
}
