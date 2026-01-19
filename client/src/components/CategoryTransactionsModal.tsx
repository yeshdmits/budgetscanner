import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { getMonthlyTransactions } from '../api/transactions';
import { updateTransactionCategory } from '../api/categories';
import { formatCurrency, cn } from '../lib/utils';
import { CATEGORIES, type Category } from '../types/transaction';

interface CategoryTransactionsModalProps {
  year: string;
  month: string;
  category: string;
  onClose: () => void;
}

export function CategoryTransactionsModal({
  year,
  month,
  category,
  onClose
}: CategoryTransactionsModalProps) {
  const queryClient = useQueryClient();

  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ['monthly-transactions', year, month],
    queryFn: () => getMonthlyTransactions(year, month)
  });

  const categoryMutation = useMutation({
    mutationFn: ({ id, category }: { id: string; category: Category }) =>
      updateTransactionCategory(id, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-transactions', year, month] });
      queryClient.invalidateQueries({ queryKey: ['category-summary', year, month] });
      queryClient.invalidateQueries({ queryKey: ['monthly-summary', year, month] });
    }
  });

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions
      .filter(tx => tx.category === category)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, category]);

  const total = useMemo(() => {
    return filteredTransactions.reduce((sum, tx) => sum + (tx.debitCHF || 0), 0);
  }, [filteredTransactions]);

  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('en-US', {
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
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-6 py-4 border-b",
          category === 'Uncategorized' && "bg-orange-50"
        )}>
          <div>
            <h2 className={cn(
              "text-lg font-semibold",
              category === 'Uncategorized' ? "text-orange-700" : "text-gray-900"
            )}>{category}</h2>
            <p className="text-sm text-gray-500">{monthName}</p>
          </div>
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
              Failed to load transactions
            </div>
          )}

          {!isLoading && !error && filteredTransactions.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              No transactions found for this category
            </div>
          )}

          {!isLoading && !error && filteredTransactions.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredTransactions.map((tx) => {
                    const txDate = new Date(tx.date);
                    const dateStr = txDate.toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short'
                    });

                    return (
                      <tr
                        key={tx._id}
                        className={cn(
                          "hover:bg-gray-50",
                          tx.category === 'Uncategorized' && "bg-orange-50"
                        )}
                      >
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                          {dateStr}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{tx.bookingText}</div>
                          {tx.paymentPurpose && (
                            <div className="text-xs text-gray-500 mt-1">{tx.paymentPurpose}</div>
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
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-900">
                      Total ({filteredTransactions.length} transactions)
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">
                      {formatCurrency(total)} CHF
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
