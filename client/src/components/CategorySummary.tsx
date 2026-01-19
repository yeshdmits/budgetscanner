import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';
import { getCategorySummary } from '../api/categories';
import { formatCurrency, cn } from '../lib/utils';
import { CategoryTransactionsModal } from './CategoryTransactionsModal';

interface CategorySummaryProps {
  year: string;
  month: string;
  hideSavingsTransfer?: boolean;
}

const COLORS = [
  '#ef4444', // red - Rent
  '#f97316', // orange - Sanitas
  '#22c55e', // green - Food
  '#3b82f6', // blue - Cafe
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#6366f1', // indigo
  '#84cc16', // lime
  '#06b6d4', // cyan
  '#d946ef', // fuchsia
  '#64748b', // slate
  '#78716c', // stone
  '#a855f7', // purple
  '#10b981', // emerald
  '#f43f5e', // rose
  '#0ea5e9', // sky
  '#94a3b8'  // gray
];

export function CategorySummary({ year, month, hideSavingsTransfer = false }: CategorySummaryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['category-summary', year, month],
    queryFn: () => getCategorySummary(year, month)
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        Failed to load category summary
      </div>
    );
  }

  const { categories: rawCategories, totalExpenses: rawTotalExpenses } = data.data;

  // Filter out Savings Transfer if hidden
  const categories = hideSavingsTransfer
    ? rawCategories.filter(cat => cat.category !== 'Savings Transfer')
    : rawCategories;

  // Recalculate total and percentages if filtered
  const totalExpenses = hideSavingsTransfer
    ? categories.reduce((sum, cat) => sum + cat.total, 0)
    : rawTotalExpenses;

  // Recalculate percentages based on filtered total
  const categoriesWithPercentages = categories.map(cat => ({
    ...cat,
    percentage: totalExpenses > 0 ? Math.round((cat.total / totalExpenses) * 100) : 0
  }));

  if (categoriesWithPercentages.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No expense data for this month
      </div>
    );
  }

  const pieData = categoriesWithPercentages.map((cat, index) => ({
    name: cat.category,
    value: cat.total,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table */}
        <div className="overflow-hidden rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {categoriesWithPercentages.map((cat, index) => (
                <tr
                  key={cat.category}
                  onClick={() => setSelectedCategory(cat.category)}
                  className={cn(
                    "cursor-pointer hover:bg-gray-50 transition-colors",
                    cat.category === 'Uncategorized' && "bg-orange-50 hover:bg-orange-100"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className={cn(
                        "text-sm font-medium",
                        cat.category === 'Uncategorized' ? "text-orange-700" : "text-gray-900"
                      )}>{cat.category}</span>
                      <span className="text-xs text-gray-500">({cat.count})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {formatCurrency(cat.total)} CHF
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                      <span className="text-gray-600 w-8">{cat.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">Total</td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                  {formatCurrency(totalExpenses)} CHF
                </td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pie Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value) + ' CHF'}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {selectedCategory && (
        <CategoryTransactionsModal
          year={year}
          month={month}
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
}
