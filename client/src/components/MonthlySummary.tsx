import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import { getMonthlySummary } from '../api/transactions';
import { formatCurrency, cn } from '../lib/utils';
import { BudgetChart } from './BudgetChart';
import { CategorySummary } from './CategorySummary';
import { SortableHeader, type SortOrder } from './SortableHeader';

interface MonthlySummaryProps {
  monthKey: string;
  onDayClick: (dayKey: string) => void;
  onBack: () => void;
}

export function MonthlySummary({ monthKey, onDayClick, onBack }: MonthlySummaryProps) {
  const [year, month] = monthKey.split('-');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['monthly-summary', year, month],
    queryFn: () => getMonthlySummary(year, month)
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

  const rawDays = data?.data || [];

  const sortedDays = useMemo(() => {
    if (!sortField || !sortOrder) return rawDays;

    return [...rawDays].sort((a, b) => {
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
  }, [rawDays, sortField, sortOrder]);

  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric'
  });

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
        Failed to load monthly data
      </div>
    );
  }

  const chartData = sortedDays.map(item => ({
    name: item.day,
    outcome: item.outcome,
    savings: item.savings
  }));

  const totals = rawDays.reduce(
    (acc, item) => ({
      income: acc.income + item.income,
      outcome: acc.outcome + item.outcome
    }),
    { income: 0, outcome: 0 }
  );

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Summary
      </button>

      <h2 className="text-xl font-semibold mb-4">{monthName}</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600">Income</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(totals.income)} CHF</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-600">Expenses</p>
          <p className="text-2xl font-bold text-red-700">{formatCurrency(totals.outcome)} CHF</p>
        </div>
        <div className={cn('p-4 rounded-lg', totals.income - totals.outcome >= 0 ? 'bg-blue-50' : 'bg-orange-50')}>
          <p className={cn('text-sm', totals.income - totals.outcome >= 0 ? 'text-blue-600' : 'text-orange-600')}>Savings</p>
          <p className={cn('text-2xl font-bold', totals.income - totals.outcome >= 0 ? 'text-blue-700' : 'text-orange-700')}>
            {formatCurrency(totals.income - totals.outcome)} CHF
          </p>
        </div>
      </div>

      <BudgetChart data={chartData} />

      <CategorySummary year={year} month={month} />

      <div className="mt-6 overflow-hidden rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader
                label="Day"
                field="dayKey"
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
                label="Balance"
                field="balance"
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
            {sortedDays.map(item => (
              <tr
                key={item.dayKey}
                onClick={() => onDayClick(item.dayKey)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.day}</td>
                <td className="px-4 py-3 text-sm text-right text-green-600">
                  {item.income > 0 ? formatCurrency(item.income) : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-right text-red-600">
                  {item.outcome > 0 ? formatCurrency(item.outcome) : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-600">
                  {formatCurrency(item.balance)}
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
