'use client';

import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  actions?: (item: T) => ReactNode;
  emptyMessage?: string;
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  onEdit,
  onDelete,
  actions,
  emptyMessage = 'Aucune donnee',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="card text-center py-12 text-dark-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full">
        <thead className="border-b border-dark-border">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="table-header">{col.label}</th>
            ))}
            {(onEdit || onDelete || actions) && (
              <th className="table-header text-right">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-border">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-dark-lighter/50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="table-cell">
                  {col.render
                    ? col.render(item)
                    : String((item as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
              {(onEdit || onDelete || actions) && (
                <td className="table-cell text-right space-x-2">
                  {actions && actions(item)}
                  {onEdit && (
                    <button onClick={() => onEdit(item)} className="text-primary hover:text-yellow-300 text-sm font-medium">
                      Modifier
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => onDelete(item)} className="text-red-400 hover:text-red-300 text-sm font-medium">
                      Supprimer
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
