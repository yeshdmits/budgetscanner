import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { FileUpload } from './components/FileUpload';
import { YearlySummary } from './components/YearlySummary';
import { MonthlySummary } from './components/MonthlySummary';
import { DailySummary } from './components/DailySummary';
import { deleteAllTransactions, exportTransactions } from './api/transactions';

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
  | { type: 'monthly'; monthKey: string }
  | { type: 'daily'; dayKey: string; monthKey: string };

function Dashboard() {
  const client = useQueryClient();
  const [view, setView] = useState<View>({ type: 'yearly' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleUploadSuccess = () => {
    client.invalidateQueries({ queryKey: ['yearly-summary'] });
  };

  const handleExport = async () => {
    setIsExporting(true);
    setActionStatus(null);
    try {
      await exportTransactions();
      setActionStatus({ type: 'success', message: 'Transactions exported successfully' });
    } catch (error) {
      setActionStatus({ type: 'error', message: error instanceof Error ? error.message : 'Export failed' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    setActionStatus(null);
    try {
      const result = await deleteAllTransactions();
      setActionStatus({ type: 'success', message: `Deleted ${result.deleted} transactions` });
      client.invalidateQueries({ queryKey: ['yearly-summary'] });
      client.invalidateQueries({ queryKey: ['monthly-summary'] });
      client.invalidateQueries({ queryKey: ['daily-summary'] });
    } catch (error) {
      setActionStatus({ type: 'error', message: error instanceof Error ? error.message : 'Delete failed' });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleMonthClick = (monthKey: string) => {
    setView({ type: 'monthly', monthKey });
  };

  const handleDayClick = (dayKey: string) => {
    if (view.type === 'monthly') {
      setView({ type: 'daily', dayKey, monthKey: view.monthKey });
    }
  };

  const handleBackToYearly = () => {
    setView({ type: 'yearly' });
  };

  const handleBackToMonthly = () => {
    if (view.type === 'daily') {
      setView({ type: 'monthly', monthKey: view.monthKey });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Budget Scanner</h1>

        <FileUpload onUploadSuccess={handleUploadSuccess} />

        <div className="flex gap-3 mb-6">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isExporting ? 'Exporting...' : 'Export All Transactions'}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting ? 'Deleting...' : 'Clean All Transactions'}
          </button>
        </div>

        {actionStatus && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              actionStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {actionStatus.message}
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete all transactions? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAll}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete All'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          {view.type === 'yearly' && (
            <YearlySummary onMonthClick={handleMonthClick} />
          )}
          {view.type === 'monthly' && (
            <MonthlySummary
              monthKey={view.monthKey}
              onDayClick={handleDayClick}
              onBack={handleBackToYearly}
            />
          )}
          {view.type === 'daily' && (
            <DailySummary
              dayKey={view.dayKey}
              onBack={handleBackToMonthly}
            />
          )}
        </div>
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
