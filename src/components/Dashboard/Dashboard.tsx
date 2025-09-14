import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { Charts } from './Charts';
import { Transaction } from '../../types';
import { generateMonthlyData, generateCategoryData, calculateStats } from '../../utils/analytics';

interface DashboardProps {
  transactions: Transaction[];
}

export function Dashboard({ transactions }: DashboardProps) {
  const monthlyData = useMemo(() => generateMonthlyData(transactions), [transactions]);
  const categoryData = useMemo(() => generateCategoryData(transactions), [transactions]);
  const stats = useMemo(() => calculateStats(transactions), [transactions]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your financial activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Balance"
          value={`$${stats.totalBalance.toFixed(2)}`}
          icon={DollarSign}
          iconColor="bg-blue-500"
        />
        <StatsCard
          title="Monthly Income"
          value={`$${stats.currentIncome.toFixed(2)}`}
          change={`${stats.incomeChange > 0 ? '+' : ''}${stats.incomeChange.toFixed(1)}%`}
          changeType={stats.incomeChange >= 0 ? 'positive' : 'negative'}
          icon={TrendingUp}
          iconColor="bg-green-500"
        />
        <StatsCard
          title="Monthly Expenses"
          value={`$${stats.currentExpenses.toFixed(2)}`}
          change={`${stats.expenseChange > 0 ? '+' : ''}${stats.expenseChange.toFixed(1)}%`}
          changeType={stats.expenseChange <= 0 ? 'positive' : 'negative'}
          icon={TrendingDown}
          iconColor="bg-red-500"
        />
        <StatsCard
          title="Net Income"
          value={`$${(stats.currentIncome - stats.currentExpenses).toFixed(2)}`}
          icon={CreditCard}
          iconColor="bg-purple-500"
        />
      </div>

      <Charts monthlyData={monthlyData} categoryData={categoryData} />
    </div>
  );
}