import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { getDailySummary } from '../api/transactions';
import { updateTransactionCategory } from '../api/categories';
import { formatCurrency, cn } from '../lib/utils';
import { CATEGORIES, type Category } from '../types/transaction';
import { SortableHeader, type SortOrder } from './SortableHeader';

interface DailyTransactionsModalProps {
  dayKey: string;
  onClose: () => void;
}

export function DailyTransactionsModal({ dayKey, onClose }: DailyTransactionsModalProps) {
  const [year, month, day] = dayKey.split('-');
  const queryClient = useQueryClient();
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit'>('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['daily-summary', year, month, day],
    queryFn: () => getDailySummary(year, month, day)
  });

  const categoryMutation = useMutation({
    mutationFn: ({ id, category }: { id: string; category: Category }) =>
      updateTransactionCategory(id, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-summary', year, month, day] });
      queryClient.invalidateQueries({ queryKey: ['category-summary', year, month] });
      queryClient.invalidateQueries({ queryKey: ['monthly-summary', year, month] });
    }
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

  const dayData = data?.data;

  const filteredAndSortedTransactions = useMemo(() => {
    if (!dayData?.transactions) return [];

    let result = [...dayData.transactions];

    if (categoryFilter !== 'all') {
      result = result.filter(tx => tx.category === categoryFilter);
    }

    if (typeFilter !== 'all') {
      result = result.filter(tx => tx.type === typeFilter);
    }

    if (sortField && sortOrder) {
      result.sort((a, b) => {
        let aVal: string | number;
        let bVal: string | number;

        if (sortField === 'amount') {
          aVal = a.amount;
          bVal = b.amount;
        } else if (sortField === 'balanceCHF') {
          aVal = a.balanceCHF;
          bVal = b.balanceCHF;
        } else if (sortField === 'category') {
          aVal = a.category || 'Uncategorized';
          bVal = b.category || 'Uncategorized';
        } else if (sortField === 'bookingText') {
          aVal = a.bookingText || '';
          bVal = b.bookingText || '';
        } else {
          return 0;
        }

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
  }, [dayData?.transactions, categoryFilter, typeFilter, sortField, sortOrder]);

  const dayName = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{dayName}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
              Failed to load daily data
            </div>
          )}

          {!isLoading && !error && dayData && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-600">Income</p>
                  <p className="text-lg font-bold text-green-700">{formatCurrency(dayData.income)} CHF</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-xs text-red-600">Expenses</p>
                  <p className="text-lg font-bold text-red-700">{formatCurrency(dayData.outcome)} CHF</p>
                </div>
                <div className={cn('p-3 rounded-lg', dayData.savings >= 0 ? 'bg-blue-50' : 'bg-orange-50')}>
                  <p className={cn('text-xs', dayData.savings >= 0 ? 'text-blue-600' : 'text-orange-600')}>Net</p>
                  <p className={cn('text-lg font-bold', dayData.savings >= 0 ? 'text-blue-700' : 'text-orange-700')}>
                    {dayData.savings >= 0 ? '+' : ''}{formatCurrency(dayData.savings)} CHF
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Balance</p>
                  <p className="text-lg font-bold text-gray-700">{formatCurrency(dayData.balance)} CHF</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Transactions ({filteredAndSortedTransactions.length})
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Category:</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                    >
                      <option value="all">All Categories</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Type:</label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as 'all' | 'credit' | 'debit')}
                      className="px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                    >
                      <option value="all">All Types</option>
                      <option value="credit">Income</option>
                      <option value="debit">Expense</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-hidden rounded-lg border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <SortableHeader
                        label="Description"
                        field="bookingText"
                        currentField={sortField}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="Category"
                        field="category"
                        currentField={sortField}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="Amount"
                        field="amount"
                        currentField={sortField}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                        align="right"
                      />
                      <SortableHeader
                        label="Balance"
                        field="balanceCHF"
                        currentField={sortField}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                        align="right"
                      />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredAndSortedTransactions.map((tx, idx) => (
                      <tr key={tx._id || idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{tx.bookingText}</div>
                          {tx.paymentPurpose && (
                            <div className="text-xs text-gray-500 mt-1">{tx.paymentPurpose}</div>
                          )}
                          {tx.details && (
                            <div className="text-xs text-gray-400 mt-1">{tx.details}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={tx.category || 'Uncategorized'}
                            onChange={(e) => categoryMutation.mutate({
                              id: tx._id,
                              category: e.target.value as Category
                            })}
                            disabled={categoryMutation.isPending}
                            className={cn(
                              'text-xs px-2 py-1 rounded border bg-white',
                              tx.categoryManual ? 'border-blue-300 bg-blue-50' : 'border-gray-300',
                              tx.category === 'Uncategorized' && 'border-orange-300 bg-orange-50'
                            )}
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          {tx.categoryManual && (
                            <div className="text-xs text-blue-500 mt-1">Manual</div>
                          )}
                        </td>
                        <td className={cn(
                          'px-4 py-3 text-sm text-right font-medium whitespace-nowrap',
                          tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        )}>
                          {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)} CHF
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600 whitespace-nowrap">
                          {formatCurrency(tx.balanceCHF)} CHF
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
