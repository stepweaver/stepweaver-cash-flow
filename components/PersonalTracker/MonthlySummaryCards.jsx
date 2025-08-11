'use client';

import { Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Card from '../common/Card';
import SummaryCard from '../common/SummaryCard';

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
    <Card>
      <h3 className='text-xl font-semibold text-terminal-green mb-4 flex items-center font-ibm-custom'>
        <Calendar className='h-5 w-5 mr-2 lucide' />[
        {monthNames[currentMonth - 1]} {currentYear}]
      </h3>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <SummaryCard
          icon={DollarSign}
          title="Income Budget"
          value={totalIncomeBudget}
          subtitle={`Actual: ${formatCurrency(totalIncomeActual)}`}
          variant="success"
        >
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
        </SummaryCard>

        <SummaryCard
          icon={DollarSign}
          title="Bills Due"
          value={totalBillsDue}
          subtitle={`Paid: ${formatCurrency(totalBillsPaid)}`}
          variant="danger"
        />

        <SummaryCard
          icon={DollarSign}
          title="Discretionary Income"
          value={discretionaryIncome}
          subtitle="After Bills Paid"
          variant={discretionaryIncome >= 0 ? 'success' : 'danger'}
        />

        <SummaryCard
          icon={AlertCircle}
          title="Bills Status"
          value={pendingBillsCount + unsetBillsCount}
          subtitle={`${pendingBillsCount} Pending • ${paidBillsCount} Paid`}
          variant="purple"
        >
          <p className='text-xs text-terminal-muted font-ibm'>
            {unsetBillsCount} Unset
          </p>
        </SummaryCard>
      </div>
    </Card>
  );
}
