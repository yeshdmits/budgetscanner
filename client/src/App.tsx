import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { FileUpload } from './components/FileUpload';
import { YearlySummary } from './components/YearlySummary';
import { MonthlySummary } from './components/MonthlySummary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: false
    }
  }
});

type View =
  | { type: 'yearly' }
  | { type: 'monthly'; monthKey: string };

function Dashboard() {
  const client = useQueryClient();
  const [view, setView] = useState<View>({ type: 'yearly' });

  const handleUploadSuccess = () => {
    client.invalidateQueries({ queryKey: ['yearly-summary'] });
  };

  const handleMonthClick = (monthKey: string) => {
    setView({ type: 'monthly', monthKey });
  };

  const handleBackToYearly = () => {
    setView({ type: 'yearly' });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Budget Scanner</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {view.type === 'yearly' && (
            <YearlySummary onMonthClick={handleMonthClick} />
          )}
          {view.type === 'monthly' && (
            <MonthlySummary
              monthKey={view.monthKey}
              onBack={handleBackToYearly}
            />
          )}
        </div>

        <FileUpload onUploadSuccess={handleUploadSuccess} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
