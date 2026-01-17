import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '../lib/utils';

export type SortOrder = 'asc' | 'desc' | null;

interface SortableHeaderProps {
  label: string;
  field: string;
  currentField: string | null;
  currentOrder: SortOrder;
  onSort: (field: string) => void;
  align?: 'left' | 'right';
}

export function SortableHeader({
  label,
  field,
  currentField,
  currentOrder,
  onSort,
  align = 'left'
}: SortableHeaderProps) {
  const isActive = currentField === field;

  return (
    <th
      onClick={() => onSort(field)}
      className={cn(
        'px-4 py-3 text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 select-none',
        align === 'right' ? 'text-right' : 'text-left'
      )}
    >
      <div className={cn(
        'flex items-center gap-1',
        align === 'right' && 'justify-end'
      )}>
        <span>{label}</span>
        {isActive ? (
          currentOrder === 'asc' ? (
            <ChevronUp className="h-4 w-4 text-blue-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-blue-600" />
          )
        ) : (
          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
        )}
      </div>
    </th>
  );
}

export function useSorting<T>(
  data: T[],
  defaultField: string | null = null,
  defaultOrder: SortOrder = null
) {
  const [sortField, setSortField] = useState<string | null>(defaultField);
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultOrder);

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

  const sortedData = [...data].sort((a, b) => {
    if (!sortField || !sortOrder) return 0;

    const aVal = (a as Record<string, unknown>)[sortField];
    const bVal = (b as Record<string, unknown>)[sortField];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  return { sortedData, sortField, sortOrder, handleSort };
}
