import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { formatCurrency } from '../lib/utils';

interface ChartData {
  name: string;
  income?: number;
  outcome: number;
  savings: number;
}

interface BudgetChartProps {
  data: ChartData[];
  showIncome?: boolean;
}

export function BudgetChart({ data, showIncome = false }: BudgetChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => formatCurrency(value)} />
          <Tooltip
            formatter={(value: number) => formatCurrency(value) + ' CHF'}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Legend />
          <ReferenceLine y={0} stroke="#000" />
          {showIncome && <Bar dataKey="income" name="Income" fill="#22c55e" />}
          <Bar dataKey="outcome" name="Expenses" fill="#ef4444" />
          <Bar dataKey="savings" name="Savings" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
