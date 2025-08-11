'use client';

import { Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency, getMonthNames } from '@/lib/utils';
import Card from '../common/Card';
import SummaryCard from '../common/SummaryCard';

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
      <Card>
        <h3 className='text-xl font-semibold text-terminal-green mb-4 flex items-center font-ibm-custom'>
          <Calendar className='h-5 w-5 mr-2 lucide' />[
          {monthNames[currentMonth]} {currentYear}]
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <SummaryCard
            icon={TrendingUp}
            title="Revenue"
            value={monthlyRevenue}
            variant="success"
          />

          <SummaryCard
            icon={TrendingDown}
            title="Expenses"
            value={monthlyExpenses}
            variant="danger"
          />

          <SummaryCard
            icon={DollarSign}
            title="Draws"
            value={monthlyDraws}
            variant="purple"
          />

          <SummaryCard
            icon={DollarSign}
            title="Net Income"
            value={monthlyNetIncome}
            variant={monthlyNetIncome >= 0 ? 'success' : 'danger'}
          />
        </div>
      </Card>
    </>
  );
}
