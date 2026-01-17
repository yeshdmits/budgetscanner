import axios from 'axios';
import type { ApiResponse, CategorySummary, Category, Transaction } from '../types/transaction';

const api = axios.create({
  baseURL: '/api/categories'
});

export async function getCategorySummary(year: string, month: string): Promise<ApiResponse<CategorySummary>> {
  const { data } = await api.get<ApiResponse<CategorySummary>>(`/summary/${year}/${month}`);
  return data;
}

export async function updateTransactionCategory(id: string, category: Category): Promise<ApiResponse<Transaction>> {
  const { data } = await api.patch<ApiResponse<Transaction>>(`/transaction/${id}`, { category });
  return data;
}

export async function getCategories(): Promise<ApiResponse<Category[]>> {
  const { data } = await api.get<ApiResponse<Category[]>>('/');
  return data;
}

export async function recategorizeAll(): Promise<ApiResponse<{ updated: number; total: number }>> {
  const { data } = await api.post<ApiResponse<{ updated: number; total: number }>>('/recategorize');
  return data;
}
