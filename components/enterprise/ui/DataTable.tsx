// Enterprise Data Table Component - Phase 1
'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { EnterpriseCard, EnterpriseButton, EnterpriseBodySmall } from './DesignSystem';

export interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  };
  sorting?: {
    column?: string;
    direction?: 'asc' | 'desc';
    onSort: (column: string, direction: 'asc' | 'desc') => void;
  };
  selection?: {
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    idField?: string;
  };
  bulkActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedIds: string[]) => void;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
  }>;
  filters?: Record<string, any>;
  onFilterChange?: (filters: Record<string, any>) => void;
  emptyState?: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  className?: string;
}

export function EnterpriseDataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  sorting,
  selection,
  bulkActions,
  filters,
  onFilterChange,
  emptyState,
  className
}: DataTableProps<T>) {
  const [localFilters, setLocalFilters] = useState<Record<string, string>>({});
  
  const idField = selection?.idField || 'id';
  const selectedIds = selection?.selectedIds || [];
  const allSelected = data.length > 0 && data.every(row => selectedIds.includes(row[idField]));
  const someSelected = selectedIds.length > 0 && !allSelected;

  // Filter data locally if no external filtering
  const filteredData = useMemo(() => {
    if (!onFilterChange && Object.keys(localFilters).length > 0) {
      return data.filter(row => {
        return Object.entries(localFilters).every(([key, value]) => {
          if (!value) return true;
          const rowValue = String(row[key] || '').toLowerCase();
          return rowValue.includes(value.toLowerCase());
        });
      });
    }
    return data;
  }, [data, localFilters, onFilterChange]);

  const handleSelectAll = () => {
    if (!selection) return;
    
    if (allSelected) {
      selection.onSelectionChange([]);
    } else {
      const allIds = data.map(row => row[idField]);
      selection.onSelectionChange(allIds);
    }
  };

  const handleSelectRow = (id: string) => {
    if (!selection) return;
    
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter(selectedId => selectedId !== id)
      : [...selectedIds, id];
    
    selection.onSelectionChange(newSelection);
  };

  const handleSort = (columnKey: string) => {
    if (!sorting || !columns.find(col => col.key === columnKey)?.sortable) return;
    
    let direction: 'asc' | 'desc' = 'asc';
    if (sorting.column === columnKey && sorting.direction === 'asc') {
      direction = 'desc';
    }
    
    sorting.onSort(columnKey, direction);
  };

  const handleFilterChange = (columnKey: string, value: string) => {
    const newFilters = { ...localFilters, [columnKey]: value };
    setLocalFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const renderCell = (column: Column<T>, row: T, rowIndex: number) => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row, rowIndex);
    }
    
    // Default rendering based on value type
    if (value === null || value === undefined) {
      return <span className="text-neutral-400">—</span>;
    }
    
    if (typeof value === 'boolean') {
      return value ? '✓' : '✗';
    }
    
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    
    return String(value);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (!sorting || sorting.column !== column) {
      return <span className="text-neutral-400">↕</span>;
    }
    return (
      <span className="text-primary-500">
        {sorting.direction === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  if (loading) {
    return (
      <EnterpriseCard padding="none" className={className}>
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex space-x-4">
            {columns.map((_, index) => (
              <div key={index} className="flex-1">
                <div className="h-4 bg-neutral-300 rounded"></div>
              </div>
            ))}
          </div>
          
          {/* Row skeletons */}
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <div key={rowIndex} className="p-4 border-b border-neutral-200 flex space-x-4">
              {columns.map((_, colIndex) => (
                <div key={colIndex} className="flex-1">
                  <div className="h-4 bg-neutral-200 rounded"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </EnterpriseCard>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Bulk Actions Bar */}
      {bulkActions && selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-xl">
          <EnterpriseBodySmall className="font-medium">
            {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected
          </EnterpriseBodySmall>
          <div className="flex items-center gap-2">
            {bulkActions.map((action, index) => (
              <EnterpriseButton
                key={index}
                size="sm"
                variant={action.variant || 'secondary'}
                disabled={action.disabled}
                icon={action.icon}
                onClick={() => action.onClick(selectedIds)}
              >
                {action.label}
              </EnterpriseButton>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <EnterpriseCard padding="none">
        {filteredData.length === 0 && !loading ? (
          <div className="text-center py-12">
            {emptyState ? (
              <div>
                {emptyState.icon && <div className="text-6xl mb-4">{emptyState.icon}</div>}
                <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                  {emptyState.title}
                </h3>
                {emptyState.description && (
                  <p className="text-neutral-500 mb-4">
                    {emptyState.description}
                  </p>
                )}
                {emptyState.action && (
                  <EnterpriseButton onClick={emptyState.action.onClick}>
                    {emptyState.action.label}
                  </EnterpriseButton>
                )}
              </div>
            ) : (
              <p className="text-neutral-500">No data available</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Header */}
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {selection && (
                    <th className="w-12 p-4 text-left">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = someSelected;
                          }}
                          onChange={handleSelectAll}
                          className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                        />
                      </label>
                    </th>
                  )}
                  
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={cn(
                        'p-4 text-left font-medium text-neutral-700',
                        column.sortable && 'cursor-pointer hover:bg-neutral-100 transition-colors',
                        column.width && `w-${column.width}`
                      )}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center justify-between group">
                        <div>
                          {column.headerRender ? column.headerRender() : column.label}
                          
                          {/* Filter input for filterable columns */}
                          {column.filterable && (
                            <input
                              type="text"
                              placeholder={`Filter ${column.label.toLowerCase()}...`}
                              value={localFilters[column.key] || ''}
                              onChange={(e) => handleFilterChange(column.key, e.target.value)}
                              className="mt-1 block w-full text-xs border-neutral-300 rounded-md px-2 py-1"
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                        </div>
                        
                        {column.sortable && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <SortIcon column={column.key} />
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-neutral-200">
                {filteredData.map((row, rowIndex) => (
                  <tr
                    key={row[idField] || rowIndex}
                    className={cn(
                      'hover:bg-neutral-50 transition-colors',
                      selectedIds.includes(row[idField]) && 'bg-primary-50'
                    )}
                  >
                    {selection && (
                      <td className="w-12 p-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(row[idField])}
                            onChange={() => handleSelectRow(row[idField])}
                            className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                          />
                        </label>
                      </td>
                    )}
                    
                    {columns.map((column) => (
                      <td key={column.key} className="p-4 text-sm">
                        {renderCell(column, row, rowIndex)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </EnterpriseCard>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <EnterpriseBodySmall className="text-neutral-600">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </EnterpriseBodySmall>
          
          <div className="flex items-center gap-2">
            {pagination.onPageSizeChange && (
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange!(Number(e.target.value))}
                className="border border-neutral-300 rounded-md px-2 py-1 text-sm"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            )}
            
            <div className="flex items-center gap-1">
              <EnterpriseButton
                size="sm"
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
              >
                Previous
              </EnterpriseButton>
              
              <EnterpriseBodySmall className="px-3">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
              </EnterpriseBodySmall>
              
              <EnterpriseButton
                size="sm"
                variant="outline"
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
              >
                Next
              </EnterpriseButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}