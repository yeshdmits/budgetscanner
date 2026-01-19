import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Loader2 } from 'lucide-react';
import { getYearlySummary, exportTransactions, deleteTransactions } from '../api/transactions';
import { formatCurrency, cn } from '../lib/utils';
import { BudgetChart } from './BudgetChart';
import { SortableHeader, type SortOrder } from './SortableHeader';

interface YearlySummaryProps {
  onMonthClick: (monthKey: string) => void;
}

export function YearlySummary({ onMonthClick }: YearlySummaryProps) {
  const queryClient = useQueryClient();
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortField, setSortField] = useState<string | null>('monthKey');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['yearly-summary'],
    queryFn: getYearlySummary
  });

  const handleExport = async () => {
    setIsExporting(true);
    setActionStatus(null);
    try {
      await exportTransactions(selectedYear !== 'all' ? selectedYear : undefined);
      const yearMsg = selectedYear !== 'all' ? ` for ${selectedYear}` : '';
      setActionStatus({ type: 'success', message: `Transactions exported successfully${yearMsg}` });
    } catch (error) {
      setActionStatus({ type: 'error', message: error instanceof Error ? error.message : 'Export failed' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setActionStatus(null);
    try {
      const result = await deleteTransactions(selectedYear !== 'all' ? selectedYear : undefined);
      const yearMsg = selectedYear !== 'all' ? ` for ${selectedYear}` : '';
      setActionStatus({ type: 'success', message: `Deleted ${result.deleted} transactions${yearMsg}` });
      queryClient.invalidateQueries({ queryKey: ['yearly-summary'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] });
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
    } catch (error) {
      setActionStatus({ type: 'error', message: error instanceof Error ? error.message : 'Delete failed' });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

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
      savings: acc.savings + item.savings,
      savingsMovement: acc.savingsMovement + (item.savingsMovement || 0)
    }),
    { income: 0, outcome: 0, savings: 0, savingsMovement: 0 }
  );

  const deleteMessage = selectedYear !== 'all'
    ? `Are you sure you want to delete all transactions for ${selectedYear}? This action cannot be undone.`
    : 'Are you sure you want to delete ALL transactions? This action cannot be undone.';

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Yearly Summary</h2>

      <div className="grid grid-cols-4 gap-4 mb-6">
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
        <div className={cn('p-4 rounded-lg', totals.savingsMovement >= 0 ? 'bg-purple-50' : 'bg-purple-50')}>
          <p className="text-sm text-purple-600">Savings Account</p>
          <p className={cn('text-2xl font-bold', totals.savingsMovement >= 0 ? 'text-purple-700' : 'text-purple-700')}>
            {totals.savingsMovement >= 0 ? '+' : ''}{formatCurrency(totals.savingsMovement)} CHF
          </p>
        </div>
      </div>

      <BudgetChart data={chartData} showIncome />

      {actionStatus && (
        <div
          className={`mt-6 p-4 rounded-lg ${
            actionStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {actionStatus.message}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
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
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isExporting ? 'Exporting...' : `Export${selectedYear !== 'all' ? ` ${selectedYear}` : ' All'}`}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isDeleting ? 'Deleting...' : `Clean${selectedYear !== 'all' ? ` ${selectedYear}` : ' All'}`}
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border">
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

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">{deleteMessage}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
