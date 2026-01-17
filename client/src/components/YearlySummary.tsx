import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Loader2 } from 'lucide-react';
import { getYearlySummary } from '../api/transactions';
import { formatCurrency, cn } from '../lib/utils';
import { BudgetChart } from './BudgetChart';
import { SortableHeader, type SortOrder } from './SortableHeader';

interface YearlySummaryProps {
  onMonthClick: (monthKey: string) => void;
}

export function YearlySummary({ onMonthClick }: YearlySummaryProps) {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['yearly-summary'],
    queryFn: getYearlySummary
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortField(null);
        setSortOrder(null);
      } else {
        setSortOrder('asc');
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const rawSummary = data?.data || [];

  const years = useMemo(() => {
    const yearSet = new Set(rawSummary.map(item => item.monthKey.split('-')[0]));
    return Array.from(yearSet).sort().reverse();
  }, [rawSummary]);

  const filteredAndSortedSummary = useMemo(() => {
    let result = [...rawSummary];

    if (selectedYear !== 'all') {
      result = result.filter(item => item.monthKey.startsWith(selectedYear));
    }

    if (sortField && sortOrder) {
      result.sort((a, b) => {
        const aVal = a[sortField as keyof typeof a];
        const bVal = b[sortField as keyof typeof b];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }

    return result;
  }, [rawSummary, selectedYear, sortField, sortOrder]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        Failed to load summary
      </div>
    );
  }

  if (rawSummary.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No transactions yet. Upload a CSV file to get started.
      </div>
    );
  }

  const chartData = filteredAndSortedSummary.map(item => ({
    name: item.month.split(' ')[0].slice(0, 3),
    income: item.income,
    outcome: item.outcome,
    savings: item.savings
  }));

  const totals = filteredAndSortedSummary.reduce(
    (acc, item) => ({
      income: acc.income + item.income,
      outcome: acc.outcome + item.outcome,
      savings: acc.savings + item.savings
    }),
    { income: 0, outcome: 0, savings: 0 }
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Yearly Summary</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Filter by year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="all">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600">Total Income</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(totals.income)} CHF</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-600">Total Expenses</p>
          <p className="text-2xl font-bold text-red-700">{formatCurrency(totals.outcome)} CHF</p>
        </div>
        <div className={cn('p-4 rounded-lg', totals.savings >= 0 ? 'bg-blue-50' : 'bg-orange-50')}>
          <p className={cn('text-sm', totals.savings >= 0 ? 'text-blue-600' : 'text-orange-600')}>Total Savings</p>
          <p className={cn('text-2xl font-bold', totals.savings >= 0 ? 'text-blue-700' : 'text-orange-700')}>
            {formatCurrency(totals.savings)} CHF
          </p>
        </div>
      </div>

      <BudgetChart data={chartData} showIncome />

      <div className="mt-6 overflow-hidden rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader
                label="Month"
                field="monthKey"
                currentField={sortField}
                currentOrder={sortOrder}
                onSort={handleSort}
              />
              <SortableHeader
                label="Income"
                field="income"
                currentField={sortField}
                currentOrder={sortOrder}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                label="Expenses"
                field="outcome"
                currentField={sortField}
                currentOrder={sortOrder}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                label="Savings"
                field="savings"
                currentField={sortField}
                currentOrder={sortOrder}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                label="Transactions"
                field="transactionCount"
                currentField={sortField}
                currentOrder={sortOrder}
                onSort={handleSort}
                align="right"
              />
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredAndSortedSummary.map(item => (
              <tr
                key={item.monthKey}
                onClick={() => onMonthClick(item.monthKey)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.month}</td>
                <td className="px-4 py-3 text-sm text-right text-green-600">
                  {formatCurrency(item.income)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-red-600">
                  {formatCurrency(item.outcome)}
                </td>
                <td className={cn(
                  'px-4 py-3 text-sm text-right font-medium',
                  item.savings >= 0 ? 'text-blue-600' : 'text-orange-600'
                )}>
                  {item.savings >= 0 ? '+' : ''}{formatCurrency(item.savings)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-500">
                  {item.transactionCount}
                </td>
                <td className="px-4 py-3 text-right">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
