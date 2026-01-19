import axios from 'axios';
import type {
  Transaction,
  MonthlySummary,
  DailySummary,
  DayDetail,
  UploadResponse,
  ApiResponse,
  PaginatedResponse
} from '../types/transaction';

const api = axios.create({
  baseURL: '/api/transactions'
});

export async function uploadCSV(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<UploadResponse>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

export async function getTransactions(params?: {
  page?: number;
  limit?: number;
  type?: 'debit' | 'credit';
  search?: string;
  startDate?: string;
  endDate?: string;
}): Promise<PaginatedResponse<Transaction>> {
  const { data } = await api.get<PaginatedResponse<Transaction>>('/', { params });
  return data;
}

export async function getMonthlyTransactions(year: string, month: string): Promise<Transaction[]> {
  const monthKey = `${year}-${month.padStart(2, '0')}`;

  // Fetch with high limit to get all transactions for the month
  const { data } = await api.get<PaginatedResponse<Transaction>>('/', {
    params: { monthKey, limit: 1000 }
  });
  return data.data;
}

export async function getYearlySummary(): Promise<ApiResponse<MonthlySummary[]>> {
  const { data } = await api.get<ApiResponse<MonthlySummary[]>>('/summary/yearly');
  return data;
}

export async function getMonthlySummary(year: string, month: string): Promise<ApiResponse<DailySummary[]>> {
  const { data } = await api.get<ApiResponse<DailySummary[]>>(`/summary/monthly/${year}/${month}`);
  return data;
}

export async function getDailySummary(year: string, month: string, day: string): Promise<ApiResponse<DayDetail>> {
  const { data } = await api.get<ApiResponse<DayDetail>>(`/summary/daily/${year}/${month}/${day}`);
  return data;
}

export async function deleteTransactions(year?: string): Promise<{ success: boolean; deleted: number }> {
  const params = year ? { year } : {};
  const { data } = await api.delete<{ success: boolean; deleted: number }>('/all', { params });
  return data;
}

export async function exportTransactions(year?: string): Promise<void> {
  const params = year ? { year } : {};
  const response = await api.get('/export', { params, responseType: 'blob' });
  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const contentDisposition = response.headers['content-disposition'];
  const yearSuffix = year ? `_${year}` : '';
  const filename = contentDisposition
    ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
    : `transactions_export${yearSuffix}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
