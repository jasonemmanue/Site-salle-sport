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

/**
 * Tableau a partir de `md`, liste de cartes en dessous.
 *
 * Un tableau de cinq ou six colonnes reste lisible sur un ecran large ; sous
 * 768px il impose un defilement horizontal ou l'on perd la colonne qui nomme
 * la ligne. Les memes `columns` alimentent donc une carte par enregistrement,
 * chaque champ precede de son libelle.
 */
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
      <div className="card py-12 text-center text-dark-muted">
        {emptyMessage}
      </div>
    );
  }

  const hasActions = Boolean(onEdit || onDelete || actions);

  const cellValue = (item: T, col: Column<T>) =>
    col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '');

  const actionButtons = (item: T) => (
    <>
      {actions && actions(item)}
      {onEdit && (
        <button
          onClick={() => onEdit(item)}
          className="text-sm font-medium text-primary hover:text-yellow-300"
        >
          Modifier
        </button>
      )}
      {onDelete && (
        <button
          onClick={() => onDelete(item)}
          className="text-sm font-medium text-red-400 hover:text-red-300"
        >
          Supprimer
        </button>
      )}
    </>
  );

  return (
    <>
      {/* Mobile et petite tablette */}
      <div className="space-y-3 md:hidden">
        {data.map((item) => (
          <div key={item.id} className="card space-y-3">
            <dl className="space-y-2">
              {columns.map((col) => (
                <div key={col.key} className="flex items-start justify-between gap-4">
                  <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-dark-muted">
                    {col.label}
                  </dt>
                  <dd className="min-w-0 break-words text-right text-sm text-secondary">
                    {cellValue(item, col)}
                  </dd>
                </div>
              ))}
            </dl>
            {hasActions && (
              <div className="flex flex-wrap justify-end gap-4 border-t border-dark-border pt-3">
                {actionButtons(item)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ecran large */}
      <div className="card hidden overflow-x-auto p-0 md:block">
        <table className="w-full">
          <thead className="border-b border-dark-border">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="table-header">{col.label}</th>
              ))}
              {hasActions && <th className="table-header text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {data.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-dark-lighter/50">
                {columns.map((col) => (
                  <td key={col.key} className="table-cell">{cellValue(item, col)}</td>
                ))}
                {hasActions && (
                  <td className="table-cell space-x-2 text-right whitespace-nowrap">
                    {actionButtons(item)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
