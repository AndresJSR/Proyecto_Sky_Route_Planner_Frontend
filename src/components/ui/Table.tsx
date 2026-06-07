import type { ReactNode } from 'react';
import { Spinner } from './Spinner';

interface Column<T> {
  key: keyof T;
  label: string;
  width?: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

interface TableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  className?: string;
  keyExtractor?: (row: T, index: number) => string | number;
  emptyMessage?: string;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  className = '',
  keyExtractor,
  emptyMessage = 'No hay datos disponibles.',
}: TableProps<T>) {
  return (
    <div
      className={`w-full overflow-x-auto rounded-sm border border-stroke bg-white dark:border-strokedark dark:bg-boxdark ${className}`}
    >
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                style={{ width: column.width }}
                className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white whitespace-nowrap"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8">
                <Spinner size="md" />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-body dark:text-bodydark"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={keyExtractor ? keyExtractor(row, index) : index}
                className="border-b border-stroke transition hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="px-4 py-3 text-sm text-black dark:text-white whitespace-nowrap"
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
