import React from 'react';
import { Coins, TrendingDown, PiggyBank } from 'lucide-react';
import { FinancialSummary as FinancialSummaryType } from '../types/Booking';

interface FinancialSummaryProps {
  summary: FinancialSummaryType;
}

const SummaryCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon, color, subtitle }) => (
  <div className={`bg-white rounded-lg shadow p-6 transition-all hover:shadow-md hover:scale-102`}>
    <div className="flex items-center justify-between mb-2">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
        {icon}
      </div>
    </div>
    <p className={`text-2xl font-bold ${color}`}>
      €{value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </p>
  </div>
);

const FinancialSummary: React.FC<FinancialSummaryProps> = ({ summary }) => {
  const yearlyNetProfit = summary.totalEarnings - summary.expenses;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <SummaryCard
        title="Total Expected Earnings"
        subtitle="Yearly Forecast"
        value={summary.totalEarnings}
        icon={<Coins className="h-6 w-6 text-blue-500" />}
        color="text-blue-600"
      />
      <SummaryCard
        title="Total Expected Expenses"
        subtitle="Yearly Forecast"
        value={summary.expenses}
        icon={<TrendingDown className="h-6 w-6 text-red-500" />}
        color="text-red-600"
      />
      <SummaryCard
        title="Expected Net Profit"
        subtitle="Yearly Forecast"
        value={yearlyNetProfit}
        icon={<PiggyBank className="h-6 w-6 text-purple-500" />}
        color="text-purple-600"
      />
    </div>
  );
};

export default FinancialSummary;